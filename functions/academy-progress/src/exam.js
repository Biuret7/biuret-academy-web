import { createHash, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';

const EXAM_VERSION = 'foundations-v1';
const DATABASE_ID = '6aa56477002e28054068';
const ATTEMPT_TABLE = '6ab933b6001be5900662';
const CREDENTIAL_TABLE = '6ab93416002801b57b3f';
const MAX_ATTEMPTS = 3;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function examAttemptId(userId, slot) {
  return `t_${createHash('sha256').update(`${userId}:${EXAM_VERSION}:${slot}`).digest('hex').slice(0, 32)}`;
}

function parseBank() {
  const raw = process.env.ACADEMY_EXAM_BANK || readFileSync(new URL('../exam-bank.private.json', import.meta.url), 'utf8');
  const bank = JSON.parse(raw);
  if (!Array.isArray(bank) || bank.length !== 10 || bank.some((q) =>
    !/^[a-z0-9-]+$/.test(q.id) ||
    !['ar', 'en'].every((lang) => typeof q.question?.[lang] === 'string' && q.question[lang].length > 10) ||
    !Array.isArray(q.options) || (q.options.length < 3 || q.options.length > 5) ||
    q.options.some((option) => !['ar', 'en'].every((lang) => typeof option?.[lang] === 'string' && option[lang])) ||
    !Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options?.length)) throw new Error('Exam bank is invalid');
  if (new Set(bank.map((q) => q.id)).size !== bank.length) throw new Error('Exam bank has duplicate IDs');
  return bank;
}

// Locale-independent content fingerprint prevents grading answers from a stale form.
export function foundationsFormId(userId, bank = parseBank()) {
  return `f_${createHash('sha256').update(JSON.stringify({ userId, bank })).digest('hex').slice(0, 24)}`;
}

export function examService({ base, request, getLessonState, getPracticalPassed = async () => true }) {
  const attemptBase = `${base}/tablesdb/${DATABASE_ID}/tables/${ATTEMPT_TABLE}`;
  const credentialBase = `${base}/tablesdb/${DATABASE_ID}/tables/${CREDENTIAL_TABLE}`;

  async function getRow(url) {
    const result = await request(url);
    if (result.status === 404) return null;
    if (result.status !== 200) throw new Error('Exam row lookup failed');
    return result.data;
  }

  async function attemptsFor(userId) {
    const rows = await Promise.all(Array.from({ length: MAX_ATTEMPTS }, (_, i) => getRow(`${attemptBase}/rows/${examAttemptId(userId, i + 1)}`)));
    return rows.map((row, i) => {
      if (!row) return null;
      if (row.userId !== userId) throw new Error('Exam attempt ownership mismatch');
      const data = JSON.parse(row.payload);
      if (data.version !== EXAM_VERSION || data.slot !== i + 1) throw new Error('Exam attempt version mismatch');
      return { ...data, completedAt: row.$createdAt };
    }).filter(Boolean);
  }

  function statusFor(awards, attempts, practicalPassed) {
    const passed = attempts.find((attempt) => attempt.passed);
    const latest = attempts.at(-1);
    const remaining = MAX_ATTEMPTS - attempts.length;
    const nextAt = !passed && latest && remaining > 0 ? new Date(Date.parse(latest.completedAt) + COOLDOWN_MS).toISOString() : null;
    return { eligible: awards.length === 9 && practicalPassed, lessonEligible: awards.length === 9,
      practicalPassed, completedLessons: awards.length, requiredLessons: 9,
      version: EXAM_VERSION, passScore: passed ? (passed.requiredScore || 8) : 9, totalQuestions: 10, maxAttempts: MAX_ATTEMPTS,
      attempts: attempts.map(({ slot, score, passed, completedAt }) => ({ slot, score, passed, completedAt })),
      remaining, nextAt, passed: Boolean(passed), credentialId: passed?.credentialId || null };
  }

  async function state(userId) {
    const [learning, attempts, practical] = await Promise.all([getLessonState(userId), attemptsFor(userId), getPracticalPassed(userId, 'foundations')]);
    const status = statusFor(learning.awards, attempts, Boolean(practical));
    if (!status.eligible || status.passed || !status.remaining || (status.nextAt && Date.now() < Date.parse(status.nextAt))) return status;
    const bank = parseBank();
    return { ...status, formId: foundationsFormId(userId, bank), questions: bank.map(({ id, question, options }) => ({ id, question, options })) };
  }

  async function ensureCredential(attempt) {
    const id = attempt.credentialId;
    if (!id || !/^c_[a-f0-9]{32}$/.test(id)) throw new Error('Credential ID invalid');
    const existing = await getRow(`${credentialBase}/rows/${id}`);
    if (existing) return;
    const payload = JSON.stringify({ version: attempt.credentialVersion || EXAM_VERSION, pathId: 'foundations', holderName: attempt.holderName, status: 'active', issuedAt: attempt.completedAt, score: attempt.score, total: 10, courseCount: 3, lessonCount: 9,
      ...(attempt.credentialVersion ? { practicalScore: 3, practicalTotal: 3 } : {}) });
    const created = await request(`${credentialBase}/rows`, { method: 'POST', body: JSON.stringify({ rowId: id, data: { payload }, permissions: [] }) });
    if (![201, 409].includes(created.status)) throw new Error('Credential creation failed');
  }

  async function submit(userId, holderName, answers, formId) {
    const [learning, attempts, practical] = await Promise.all([getLessonState(userId), attemptsFor(userId), getPracticalPassed(userId, 'foundations')]);
    const status = statusFor(learning.awards, attempts, Boolean(practical));
    if (status.passed) return { code: 409, data: { error: 'Exam already passed', ...status } };
    if (!status.eligible) return { code: 409, data: { error: 'Complete all nine verified lessons and the practical assessment first' } };
    if (!status.remaining) return { code: 429, data: { error: 'Attempt limit reached', ...status } };
    if (status.nextAt && Date.now() < Date.parse(status.nextAt)) return { code: 429, data: { error: 'Wait for the next attempt', ...status } };
    const bank = parseBank();
    if (formId !== foundationsFormId(userId, bank)) return { code: 409, data: { error: 'Exam content changed; refresh the page before submitting' } };
    if (!answers || typeof answers !== 'object' || Array.isArray(answers) || Object.keys(answers).length !== bank.length ||
      bank.some((q) => !Object.hasOwn(answers, q.id) || !Number.isInteger(answers[q.id]) || answers[q.id] < 0 || answers[q.id] >= q.options.length)) {
      return { code: 400, data: { error: 'Answer every question once' } };
    }
    const score = bank.reduce((sum, q) => sum + Number(answers[q.id] === q.answer), 0);
    const passed = score >= 9;
    const slot = attempts.length + 1;
    const credentialId = passed ? `c_${randomBytes(16).toString('hex')}` : null;
    const name = holderName;
    const credentialVersion = 'foundations-v2';
    const payload = JSON.stringify({ version: EXAM_VERSION, credentialVersion, assessmentEdition: 'decision-quality-20261006', formId, requiredScore: 9, slot, score, passed, credentialId, holderName: name });
    const result = await request(`${attemptBase}/rows`, { method: 'POST', body: JSON.stringify({ rowId: examAttemptId(userId, slot), data: { userId, payload }, permissions: [] }) });
    if (result.status === 409) return { code: 409, data: { error: 'Attempt was already submitted; refresh the page' } };
    if (result.status !== 201) throw new Error('Exam attempt creation failed');
    if (passed) await ensureCredential({ credentialId, credentialVersion, holderName: name, score, completedAt: result.data.$createdAt });
    return { code: 200, data: { ...statusFor(learning.awards, [...attempts, { slot, score, passed, requiredScore: 9, credentialId, completedAt: result.data.$createdAt }], true), score, passed } };
  }

  async function credential(userId) {
    const passed = (await attemptsFor(userId)).find((attempt) => attempt.passed);
    if (!passed) return { code: 404, data: { error: 'No credential found' } };
    await ensureCredential(passed);
    const row = await getRow(`${credentialBase}/rows/${passed.credentialId}`);
    const data = JSON.parse(row.payload);
    return { code: 200, data: { id: passed.credentialId, ...data, shared: row.$permissions?.includes('read("any")') || false, score: passed.score, total: 10 } };
  }

  async function share(userId, enabled) {
    const record = await credential(userId);
    if (record.code !== 200) return record;
    const id = record.data.id;
    if (enabled && record.data.status !== 'active') return { code: 409, data: { error: 'Revoked credentials cannot be shared' } };
    const row = await getRow(`${credentialBase}/rows/${id}`);
    const payload = { ...JSON.parse(row.payload), score: record.data.score, total: record.data.total, courseCount: 3, lessonCount: 9 };
    const result = await request(`${credentialBase}/rows/${id}`, { method: 'PATCH', body: JSON.stringify({ data: { payload: JSON.stringify(payload) }, permissions: enabled ? ['read("any")'] : [] }) });
    if (result.status !== 200) throw new Error('Credential sharing update failed');
    return { code: 200, data: { ...record.data, shared: enabled } };
  }

  async function correctName(userId, holderName) {
    const record = await credential(userId);
    if (record.code !== 200) return record;
    const row = await getRow(`${credentialBase}/rows/${record.data.id}`);
    const payload = { ...JSON.parse(row.payload), holderName, score: record.data.score, total: record.data.total, courseCount: 3, lessonCount: 9, nameUpdatedAt: new Date().toISOString() };
    const result = await request(`${credentialBase}/rows/${record.data.id}`, { method: 'PATCH', body: JSON.stringify({ data: { payload: JSON.stringify(payload) }, permissions: row.$permissions || [] }) });
    if (result.status !== 200) throw new Error('Credential name correction failed');
    return { code: 200, data: { ...record.data, ...payload } };
  }

  return { state, submit, credential, share, correctName };
}
