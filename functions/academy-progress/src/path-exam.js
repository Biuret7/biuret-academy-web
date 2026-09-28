import { createHash, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { libraryData, mayAccessLibrary } from './library.js';

const VERSION = 'program-path-v1';
const DATABASE = '6aa56477002e28054068';
const ATTEMPTS = '6ab933b6001be5900662';
const CREDENTIALS = '6ab93416002801b57b3f';
const MAX_ATTEMPTS = 3;
const COOLDOWN = 24 * 60 * 60 * 1000;
let privateBank;

function bank() {
  if (!privateBank) {
    privateBank = JSON.parse(process.env.ACADEMY_PATH_EXAM_BANK || readFileSync(new URL('../path-exam-bank.private.json', import.meta.url), 'utf8'));
    for (const id of ['path_pentest', 'path_soc', 'path_dfir', 'path_cloud', 'path_grc']) {
      const questions = privateBank[id];
      if (!Array.isArray(questions) || questions.length !== 10 || new Set(questions.map((item) => item.id)).size !== 10 || questions.some((item) =>
        !/^[a-z0-9-]+$/.test(item.id) || !Number.isInteger(item.answer) || item.answer < 0 || item.answer > 2 ||
        !['ar', 'en'].every((lang) => typeof item.question?.[lang] === 'string' && item.question[lang].length > 10) ||
        !Array.isArray(item.options) || item.options.length !== 3 || item.options.some((option) => !['ar', 'en'].every((lang) => typeof option?.[lang] === 'string' && option[lang])))) throw new Error('Private path exam bank invalid');
    }
  }
  return privateBank;
}

export function pathAttemptId(userId, pathId, slot) {
  return `p_${createHash('sha256').update(`${userId}:${VERSION}:${pathId}:${slot}`).digest('hex').slice(0, 32)}`;
}

export function pathQuestions(pathId, language = 'ar') {
  const path = libraryData('ar').roadmapPaths.find((item) => item[2] === pathId);
  if (!path) return null;
  const lang = language === 'en' ? 'en' : 'ar';
  return bank()[pathId].map((item) => ({ id: item.id, question: item.question[lang], options: item.options.map((option) => option[lang]), answer: item.answer }));
}

export function pathExamService({ base, request, getRead, membership, foundationsPassed }) {
  const attemptsBase = `${base}/tablesdb/${DATABASE}/tables/${ATTEMPTS}`;
  const credentialsBase = `${base}/tablesdb/${DATABASE}/tables/${CREDENTIALS}`;

  async function getRow(url) {
    const result = await request(url);
    if (result.status === 404) return null;
    if (result.status !== 200) throw new Error('Path exam lookup failed');
    return result.data;
  }

  function pathInfo(pathId, language = 'ar') {
    if (!['ar', 'en'].includes(language)) language = 'ar';
    const source = libraryData('ar').roadmapPaths.find((item) => item[2] === pathId);
    const local = libraryData(language).roadmapPaths.find((item) => item[2] === pathId);
    return source && local ? { source, local } : null;
  }

  async function attemptsFor(userId, pathId) {
    const rows = await Promise.all(Array.from({ length: MAX_ATTEMPTS }, (_, i) => getRow(`${attemptsBase}/rows/${pathAttemptId(userId, pathId, i + 1)}`)));
    return rows.map((row, index) => {
      if (!row) return null;
      if (row.userId !== userId) throw new Error('Path attempt ownership mismatch');
      const payload = JSON.parse(row.payload);
      if (payload.version !== VERSION || payload.pathId !== pathId || payload.slot !== index + 1) throw new Error('Path attempt payload mismatch');
      return { ...payload, completedAt: row.$createdAt };
    }).filter(Boolean);
  }

  async function state(userId, pathId, language = 'ar') {
    const path = pathInfo(pathId, language);
    if (!path) return { code: 404, data: { error: 'Path not found' } };
    const categories = path.source[6].map((order) => libraryData('ar').categories.find((item) => item.order === order));
    if (categories.some((item) => !item)) throw new Error('Path categories missing');
    const access = categories.every((item) => mayAccessLibrary('course', item.order, membership, foundationsPassed));
    const lessons = categories.flatMap((item) => item.lessons);
    const [read, attempts] = await Promise.all([
      access && !membership.admin ? Promise.all(lessons.map((lesson) => getRead(userId, lesson.id))) : Promise.resolve([]),
      attemptsFor(userId, pathId),
    ]);
    const completedLessons = membership.admin ? lessons.length : read.filter(Boolean).length;
    const eligible = access && completedLessons === lessons.length;
    const passed = attempts.find((item) => item.passed);
    const latest = attempts.at(-1);
    const nextAt = !passed && latest && attempts.length < MAX_ATTEMPTS ? new Date(Date.parse(latest.completedAt) + COOLDOWN).toISOString() : null;
    const data = { pathId, title: path.local[1], categoryIds: path.source[6], access, eligible, completedLessons,
      requiredLessons: lessons.length, passScore: 8, totalQuestions: 10, maxAttempts: MAX_ATTEMPTS,
      attempts: attempts.map(({ slot, score, passed, completedAt }) => ({ slot, score, passed, completedAt })),
      remaining: MAX_ATTEMPTS - attempts.length, nextAt, passed: Boolean(passed), credentialId: passed?.credentialId || null };
    if (eligible && !passed && data.remaining && (!nextAt || Date.now() >= Date.parse(nextAt))) {
      data.questions = pathQuestions(pathId, language).map(({ answer, ...question }) => question);
    }
    return { code: 200, data };
  }

  async function ensureCredential(attempt) {
    const id = attempt.credentialId;
    if (!/^c_[a-f0-9]{32}$/.test(id || '')) throw new Error('Path credential ID invalid');
    if (await getRow(`${credentialsBase}/rows/${id}`)) return;
    const payload = JSON.stringify({ version: VERSION, pathId: attempt.pathId, holderName: attempt.holderName, status: 'active', issuedAt: attempt.completedAt });
    const result = await request(`${credentialsBase}/rows`, { method: 'POST', body: JSON.stringify({ rowId: id, data: { payload }, permissions: [] }) });
    if (![201, 409].includes(result.status)) throw new Error('Path credential creation failed');
  }

  async function submit(userId, name, pathId, answers) {
    const current = await state(userId, pathId);
    if (current.code !== 200) return current;
    if (!current.data.eligible) return { code: 403, data: { error: 'Complete and unlock all path lessons first' } };
    if (current.data.passed) return { code: 409, data: { error: 'Path exam already passed', ...current.data } };
    if (!current.data.remaining || (current.data.nextAt && Date.now() < Date.parse(current.data.nextAt))) return { code: 429, data: { error: 'Path exam is in cooldown', ...current.data } };
    const bank = pathQuestions(pathId, 'ar');
    if (!answers || typeof answers !== 'object' || Array.isArray(answers) || Object.keys(answers).length !== bank.length ||
      bank.some((question) => !Object.hasOwn(answers, question.id) || !Number.isInteger(answers[question.id]) || answers[question.id] < 0 || answers[question.id] >= question.options.length)) {
      return { code: 400, data: { error: 'Answer every question once' } };
    }
    const score = bank.reduce((sum, question) => sum + Number(answers[question.id] === question.answer), 0);
    const passed = score >= 8;
    const slot = current.data.attempts.length + 1;
    const credentialId = passed ? `c_${randomBytes(16).toString('hex')}` : null;
    const holderName = String(name || 'Biuret learner').trim().slice(0, 100) || 'Biuret learner';
    const payload = JSON.stringify({ version: VERSION, pathId, slot, score, passed, credentialId, holderName });
    const result = await request(`${attemptsBase}/rows`, { method: 'POST', body: JSON.stringify({ rowId: pathAttemptId(userId, pathId, slot), data: { userId, payload }, permissions: [] }) });
    if (result.status === 409) return { code: 409, data: { error: 'Attempt already submitted; refresh the page' } };
    if (result.status !== 201) throw new Error('Path attempt creation failed');
    if (passed) await ensureCredential({ credentialId, pathId, holderName, completedAt: result.data.$createdAt });
    return { code: 200, data: { score, passed, credentialId, remaining: MAX_ATTEMPTS - slot } };
  }

  async function credential(userId, pathId) {
    if (!pathInfo(pathId)) return { code: 404, data: { error: 'Path not found' } };
    const passed = (await attemptsFor(userId, pathId)).find((item) => item.passed);
    if (!passed) return { code: 404, data: { error: 'No path credential found' } };
    await ensureCredential(passed);
    const row = await getRow(`${credentialsBase}/rows/${passed.credentialId}`);
    const payload = JSON.parse(row.payload);
    if (payload.version !== VERSION || payload.pathId !== pathId) throw new Error('Path credential mismatch');
    return { code: 200, data: { ...payload, id: passed.credentialId, score: passed.score, total: 10, shared: row.$permissions?.includes('read("any")') || false } };
  }

  async function share(userId, pathId, enabled) {
    if (typeof enabled !== 'boolean') return { code: 400, data: { error: 'Invalid sharing preference' } };
    const record = await credential(userId, pathId);
    if (record.code !== 200) return record;
    if (enabled && record.data.status !== 'active') return { code: 409, data: { error: 'Revoked credentials cannot be shared' } };
    const row = await getRow(`${credentialsBase}/rows/${record.data.id}`);
    const result = await request(`${credentialsBase}/rows/${record.data.id}`, { method: 'PATCH', body: JSON.stringify({ data: { payload: row.payload }, permissions: enabled ? ['read("any")'] : [] }) });
    if (result.status !== 200) throw new Error('Path credential sharing failed');
    return { code: 200, data: { ...record.data, shared: enabled } };
  }

  return { state, submit, credential, share };
}
