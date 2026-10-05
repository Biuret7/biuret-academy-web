import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { pathExamService, pathQuestions } from '../functions/academy-progress/src/path-exam.js';

const available = existsSync(new URL('../functions/academy-progress/path-exam-bank.private.json', import.meta.url)) &&
  existsSync(new URL('../functions/academy-progress/desktop-library.ar.private.json', import.meta.url));

test('specialty exam requires accessible, completed path lessons and issues a private credential once', { skip: !available }, async () => {
  const rows = new Map();
  const request = async (url, options = {}) => {
    if (!options.method || options.method === 'GET') return rows.has(url) ? { status: 200, data: rows.get(url) } : { status: 404 };
    const body = JSON.parse(options.body);
    if (options.method === 'POST') {
      const target = `${url}/${body.rowId}`;
      if (rows.has(target)) return { status: 409 };
      const row = { ...body.data, $createdAt: new Date().toISOString(), $permissions: body.permissions || [] };
      rows.set(target, row);
      return { status: 201, data: row };
    }
    if (options.method === 'PATCH') {
      const row = rows.get(url);
      if (!row) return { status: 404 };
      rows.set(url, { ...row, ...body.data, $permissions: body.permissions });
      return { status: 200, data: rows.get(url) };
    }
    throw new Error('Unexpected fake request');
  };
  const create = (plan, getRead, getCoursePassed = async () => true, getPracticalPassed = async () => true) => pathExamService({ base: 'https://example.test/v1', request, getRead,
    getCoursePassed, getPracticalPassed, membership: { plan, admin: false }, foundationsPassed: true });
  const denied = await create('free', async () => true).state('learner', 'path_grc');
  assert.equal(denied.data.access, false);
  assert.equal(denied.data.questions, undefined);
  const partial = await create('plus', async (id, lesson) => lesson !== 'desktop-topic-1').state('learner', 'path_grc');
  assert.equal(partial.data.eligible, false);
  assert.equal(partial.data.questions, undefined);
  const missingCourse = await create('plus', async () => true, async () => false).state('learner', 'path_grc');
  assert.equal(missingCourse.data.readyForPractical, false);
  assert.equal(missingCourse.data.eligible, false);
  const missingPractical = await create('plus', async () => true, async () => true, async () => null).state('learner', 'path_grc');
  assert.equal(missingPractical.data.readyForPractical, true);
  assert.equal(missingPractical.data.eligible, false);
  assert.equal(missingPractical.data.questions, undefined);
  const service = create('plus', async () => true);
  const open = await service.state('learner', 'path_grc', 'en');
  assert.equal(open.data.eligible, true);
  assert.equal(open.data.questions.length, 10);
  assert.ok(open.data.questions.every((question) => !Object.hasOwn(question, 'answer')));
  const answers = Object.fromEntries(pathQuestions('path_grc','ar','learner').map((question) => [question.id, question.answer]));
  const passed = await service.submit('learner', 'Test learner', 'path_grc', answers, open.data.formId);
  assert.equal(passed.code, 200);
  assert.equal(passed.data.passed, true);
  assert.match(passed.data.credentialId, /^c_[a-f0-9]{32}$/);
  const credential = await service.credential('learner', 'path_grc');
  assert.equal(credential.data.pathId, 'path_grc');
  assert.equal(credential.data.version, 'program-path-v2');
  assert.equal(credential.data.practicalScore, 3);
  assert.equal(credential.data.shared, false);
  const shared = await service.share('learner', 'path_grc', true);
  assert.equal(shared.data.shared, true);
  const corrected = await service.correctName('learner', 'path_grc', 'Real Learner');
  assert.equal(corrected.data.holderName, 'Real Learner');
  assert.equal(corrected.data.score, 10);
  assert.equal(corrected.data.courseCount > 0, true);
  assert.equal(corrected.data.shared, true);
  assert.equal((await service.state('learner', 'path_grc')).data.passed, true);
});
