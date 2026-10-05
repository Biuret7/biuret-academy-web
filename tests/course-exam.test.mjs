import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { courseExamService } from '../functions/academy-progress/src/course-exam.js';

const available = ['desktop-library.ar.private.json', 'desktop-library.en.private.json', 'course-exam-bank.private.json']
  .every((name) => existsSync(new URL(`../functions/academy-progress/${name}`, import.meta.url)));

test('course exams cover imported courses and require access and recorded lessons', { skip: !available }, async () => {
  const rows = new Map();
  const request = async (url, options = {}) => {
    if (!options.method) return rows.has(url) ? { status: 200, data: rows.get(url) } : { status: 404 };
    const body = JSON.parse(options.body);
    const target = `${url}/${body.rowId}`;
    if (rows.has(target)) return { status: 409 };
    const row = { ...body.data, $createdAt: new Date().toISOString() };
    rows.set(target, row);
    return { status: 201, data: row };
  };
  const create = (plan, getRead) => courseExamService({ base: 'https://example.test/v1', request, getRead,
    membership: { plan, admin: false }, foundationsPassed: true });
  const blocked = await create('free', async () => true).state('learner', 18);
  assert.equal(blocked.data.access, false);
  assert.equal(blocked.data.questions, undefined);
  const incomplete = await create('pro', async () => false).state('learner', 18);
  assert.equal(incomplete.data.eligible, false);
  assert.equal(incomplete.data.questions, undefined);
  const service = create('pro', async () => true);
  for (let order = 1; order <= 19; order++) {
    const state = await service.state('learner', order, 'en');
    assert.equal(state.code, 200, `course ${order}`);
    assert.equal(state.data.eligible, true, `course ${order}`);
    assert.ok(state.data.questions.length >= 3, `course ${order}`);
    assert.ok(state.data.questions.every((item) => !Object.hasOwn(item, 'answer')));
  }
  const state = await service.state('learner', 18, 'en');
  assert.equal((await service.submit('learner', 18, {})).code, 400);
  const submitted = await service.submit('learner', 18, Object.fromEntries(state.data.questions.map((item) => [item.id, 0])));
  assert.equal(submitted.code, 200);
  assert.ok(submitted.data.score >= 0);
});
