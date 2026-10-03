import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { additionalPathIds } from './additional-paths.js';

const VERSION = 'practical-v1';
const DATABASE = '6aa56477002e28054068';
const ATTEMPTS = '6ab933b6001be5900662';
let privateBank;
const PATHS = ['foundations', 'path_pentest', 'path_soc', 'path_dfir', 'path_cloud', 'path_grc', ...additionalPathIds];

function isPath(pathId) {
  return PATHS.includes(pathId);
}

function bank() {
  if (!privateBank) {
    privateBank = JSON.parse(process.env.ACADEMY_PRACTICAL_BANK || readFileSync(new URL('../practical-bank.private.json', import.meta.url), 'utf8'));
    for (const id of PATHS) {
      const tasks = privateBank[id];
      if (!Array.isArray(tasks) || tasks.length !== 3 || new Set(tasks.map((task) => task.id)).size !== 3 || tasks.some((task) =>
        !/^[a-z0-9-]+$/.test(task.id) || !Number.isInteger(task.answer) || task.answer < 0 || task.answer > 2 ||
        !['ar', 'en'].every((lang) => typeof task.artifact?.[lang] === 'string' && task.artifact[lang].length > 10 &&
          typeof task.question?.[lang] === 'string' && task.question[lang].length > 10) ||
        !Array.isArray(task.options) || task.options.length !== 3 || task.options.some((option) =>
          !['ar', 'en'].every((lang) => typeof option?.[lang] === 'string' && option[lang])))) throw new Error('Practical bank invalid');
    }
  }
  return privateBank;
}

export function practicalId(userId, pathId) {
  return `r_${createHash('sha256').update(`${userId}:${VERSION}:${pathId}`).digest('hex').slice(0, 32)}`;
}

export function practicalService({ base, request }) {
  const rowsBase = `${base}/tablesdb/${DATABASE}/tables/${ATTEMPTS}/rows`;
  async function passed(userId, pathId) {
    if (!isPath(pathId)) return null;
    const result = await request(`${rowsBase}/${practicalId(userId, pathId)}`);
    if (result.status === 404) return null;
    if (result.status !== 200) throw new Error('Practical assessment lookup failed');
    if (result.data.userId !== userId) throw new Error('Practical assessment ownership mismatch');
    const payload = JSON.parse(result.data.payload);
    if (payload.version !== VERSION || payload.pathId !== pathId || !payload.passed || payload.score !== 3) throw new Error('Practical record invalid');
    return { ...payload, completedAt: result.data.$createdAt };
  }
  async function state(userId, pathId, language = 'ar', ready = false) {
    if (!isPath(pathId)) return { code: 404, data: { error: 'Path not found' } };
    const completion = await passed(userId, pathId);
    const data = { pathId, version: VERSION, ready, passed: Boolean(completion), score: completion?.score ?? null, total: 3 };
    if (ready && !completion) data.tasks = bank()[pathId].map(({ id, artifact, question, options }) => ({ id,
      artifact: artifact[language === 'en' ? 'en' : 'ar'], question: question[language === 'en' ? 'en' : 'ar'],
      options: options.map((option) => option[language === 'en' ? 'en' : 'ar']) }));
    return { code: 200, data };
  }
  async function submit(userId, pathId, answers, ready = false) {
    if (!isPath(pathId)) return { code: 404, data: { error: 'Path not found' } };
    if (!ready) return { code: 403, data: { error: 'Complete path lessons and course exams first' } };
    if (await passed(userId, pathId)) return { code: 409, data: { error: 'Practical assessment already passed' } };
    const tasks = bank()[pathId];
    if (!answers || typeof answers !== 'object' || Array.isArray(answers) || Object.keys(answers).length !== tasks.length ||
      tasks.some((task) => !Object.hasOwn(answers, task.id) || !Number.isInteger(answers[task.id]) || answers[task.id] < 0 || answers[task.id] > 2)) {
      return { code: 400, data: { error: 'Complete all three evidence tasks' } };
    }
    const score = tasks.reduce((sum, task) => sum + Number(answers[task.id] === task.answer), 0);
    if (score === tasks.length) {
      const payload = JSON.stringify({ version: VERSION, pathId, score, passed: true });
      const result = await request(rowsBase, { method: 'POST', body: JSON.stringify({ rowId: practicalId(userId, pathId),
        data: { userId, payload }, permissions: [] }) });
      if (![201, 409].includes(result.status)) throw new Error('Practical assessment record failed');
    }
    return { code: 200, data: { score, total: tasks.length, passed: score === tasks.length } };
  }
  return { state, submit, passed };
}
