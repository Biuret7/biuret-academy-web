import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../functions/academy-progress/src/main.js';

const BANK = Array.from({ length: 10 }, (_, i) => ({ id: `q-${i}`, question: { ar: `سؤال تجريبي ${i} طويل`, en: `Test question number ${i}` }, options: Array.from({ length: 3 }, (_, n) => ({ ar: `خيار ${n}`, en: `Option ${n}` })), answer: i % 3 }));
const PRACTICAL = Object.fromEntries(['foundations', 'path_pentest', 'path_soc', 'path_dfir', 'path_cloud', 'path_grc'].map((path) => [path, Array.from({ length: 3 }, (_, i) => ({ id: `task-${i}`, artifact: { ar: `دليل تدريبي افتراضي رقم ${i}`, en: `Synthetic training evidence ${i}` }, question: { ar: `ما القرار الصحيح للدليل رقم ${i}؟`, en: `What is the right decision for evidence ${i}?` }, options: Array.from({ length: 3 }, (_, n) => ({ ar: `قرار ${n}`, en: `Decision ${n}` })), answer: i % 3 }))]));
const AWARD_TABLE = '6ab81dce000e6188b664';
const ATTEMPT_TABLE = '6ab933b6001be5900662';
const CREDENTIAL_TABLE = '6ab93416002801b57b3f';

test('exam requires all server awards, grades privately, limits attempts, and shares only by owner choice', async () => {
  const beforeFetch = globalThis.fetch;
  const beforeBank = process.env.ACADEMY_EXAM_BANK;
  const beforePracticalBank = process.env.ACADEMY_PRACTICAL_BANK;
  process.env.ACADEMY_EXAM_BANK = JSON.stringify(BANK);
  process.env.ACADEMY_PRACTICAL_BANK = JSON.stringify(PRACTICAL);
  const rows = new Map();
  let person = 'learner-a';
  let name = 'Academy Learner';
  let now = Date.parse('2026-09-27T12:00:00.000Z');
  const beforeNow = Date.now;
  Date.now = () => now;
  const lessons = ['url-parts','url-traps','url-decision','identity-passwords','identity-sessions','identity-least-privilege','evidence-logs','evidence-integrity','evidence-triage'];
  const { awardId } = await import('../functions/academy-progress/src/main.js');
  const key = (table, id) => `${table}:${id}`;
  const response = (status, data = {}) => ({ status, json: async () => data });
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    if (path === '/v1/account') return response(200, { $id: person, name });
    const match = path.match(/\/tables\/([^/]+)\/rows(?:\/([^/]+))?$/);
    if (!match) throw new Error(`Unexpected ${path}`);
    const [, table, id] = match;
    if (options.method === 'POST') {
      const body = JSON.parse(options.body);
      if (rows.has(key(table, body.rowId))) return response(409);
      const row = { ...body.data, $id: body.rowId, $createdAt: new Date(now).toISOString(), $permissions: body.permissions };
      rows.set(key(table, body.rowId), row);
      return response(201, row);
    }
    if (options.method === 'PATCH') {
      const body = JSON.parse(options.body);
      const row = rows.get(key(table, id));
      if (!row) return response(404);
      Object.assign(row, body.data, { $permissions: body.permissions });
      return response(200, row);
    }
    return rows.has(key(table, id)) ? response(200, rows.get(key(table, id))) : response(404);
  };
  const invoke = (bodyJson) => handler({ req: { headers: { 'x-appwrite-user-jwt': 'valid', 'x-appwrite-key': 'key' }, bodyJson }, res: { json: (body, status = 200) => ({ status, body }) }, error: () => {} });
  try {
    let result = await invoke({ action: 'examState' });
    assert.equal(result.body.eligible, false);
    assert.equal(result.body.questions, undefined);
    assert.equal((await invoke({ action: 'submitExam', answers: {} })).status, 409);
    for (const [i, lessonId] of lessons.entries()) rows.set(key(AWARD_TABLE, awardId(person, lessonId)), { userId: person, lessonId, xp: 100, coins: 10, $createdAt: new Date(now - 1000 * (i + 1)).toISOString() });
    result = await invoke({ action: 'examState' });
    assert.equal(result.body.eligible, false);
    assert.equal(result.body.practicalPassed, false);
    const practicalState = await invoke({ action: 'practicalState', pathId: 'foundations', language: 'en' });
    assert.equal(practicalState.status, 200);
    assert.equal(practicalState.body.ready, true);
    assert.equal(JSON.stringify(practicalState.body).includes('"answer"'), false);
    const practicalAnswers = Object.fromEntries(PRACTICAL.foundations.map((task) => [task.id, task.answer]));
    const practicalResult = await invoke({ action: 'submitPractical', pathId: 'foundations', answers: practicalAnswers });
    assert.deepEqual([practicalResult.status, practicalResult.body.score, practicalResult.body.passed], [200, 3, true]);
    result = await invoke({ action: 'examState' });
    assert.equal(result.body.eligible, true);
    assert.equal(result.body.questions.length, 10);
    assert.equal(JSON.stringify(result.body).includes('"answer"'), false);
    assert.equal((await invoke({ action: 'submitExam', answers: {} })).status, 400);
    const wrong = Object.fromEntries(BANK.map((q) => [q.id, (q.answer + 1) % 3]));
    result = await invoke({ action: 'submitExam', answers: wrong });
    assert.deepEqual([result.status, result.body.score, result.body.passed], [200, 0, false]);
    assert.equal((await invoke({ action: 'submitExam', answers: wrong })).status, 429);
    now += 24 * 60 * 60 * 1000;
    const correct = Object.fromEntries(BANK.map((q) => [q.id, q.answer]));
    result = await invoke({ action: 'submitExam', answers: correct });
    assert.deepEqual([result.status, result.body.score, result.body.passed], [200, 10, true]);
    assert.match(result.body.credentialId, /^c_[a-f0-9]{32}$/);
    assert.equal(rows.get(key(CREDENTIAL_TABLE, result.body.credentialId)).$permissions.length, 0);
    assert.equal(JSON.parse(rows.get(key(CREDENTIAL_TABLE, result.body.credentialId)).payload).score, 10);
    assert.equal(JSON.parse(rows.get(key(CREDENTIAL_TABLE, result.body.credentialId)).payload).version, 'foundations-v2');
    assert.equal((await invoke({ action: 'submitExam', answers: correct })).status, 409);
    result = await invoke({ action: 'shareCredential', enabled: true });
    assert.equal(result.body.shared, true);
    assert.deepEqual(rows.get(key(CREDENTIAL_TABLE, result.body.id)).$permissions, ['read("any")']);
    name = 'Biuret';
    assert.equal((await invoke({ action: 'correctCredentialName' })).status, 403);
    name = 'Real Learner';
    const corrected = await invoke({ action: 'correctCredentialName' });
    assert.equal(corrected.status, 200);
    assert.equal(corrected.body.holderName, 'Real Learner');
    assert.equal(corrected.body.score, 10);
    assert.deepEqual(rows.get(key(CREDENTIAL_TABLE, result.body.id)).$permissions, ['read("any")']);
    await invoke({ action: 'shareCredential', enabled: false });
    assert.deepEqual(rows.get(key(CREDENTIAL_TABLE, result.body.id)).$permissions, []);
    person = 'learner-b'; name = 'Other Learner';
    assert.equal((await invoke({ action: 'credential' })).status, 404);
    assert.equal((await invoke({ action: 'examState' })).body.eligible, false);
    assert.equal(rows.size, 13);
    assert.equal([...rows.keys()].filter((item) => item.startsWith(`${ATTEMPT_TABLE}:`)).length, 3);
  } finally {
    globalThis.fetch = beforeFetch;
    Date.now = beforeNow;
    if (beforeBank === undefined) delete process.env.ACADEMY_EXAM_BANK;
    else process.env.ACADEMY_EXAM_BANK = beforeBank;
    if (beforePracticalBank === undefined) delete process.env.ACADEMY_PRACTICAL_BANK;
    else process.env.ACADEMY_PRACTICAL_BANK = beforePracticalBank;
  }
});
