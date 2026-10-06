import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { academyPaths } from '../path-catalog-data.js';
import { validProfilePhoto } from '../identity.js';
import { examService } from '../functions/academy-progress/src/exam.js';

const privateRoot = new URL('../functions/academy-progress/', import.meta.url);
const hasPrivate = existsSync(new URL('learning-edition.private.json', privateRoot));
const read = name => JSON.parse(readFileSync(new URL(name, privateRoot), 'utf8'));

test('each path includes valid, bilingual operations rooms', () => {
  assert.equal(academyPaths.length, 10);
  for (const path of academyPaths) {
    assert.ok(path.operations.length > 0, path.id);
    for (const room of path.operations) {
      assert.ok(room.index >= 0 && room.index < 6);
      assert.ok(room.title.ar && room.title.en);
      assert.equal(room.href, `operation.html?id=${room.index}`);
    }
  }
});

test('profile photos accept only the portfolio JPEG preference, never external or script URLs', () => {
  assert.equal(validProfilePhoto('data:image/jpeg;base64,/9j/AAAA'), true);
  for (const value of ['https://example.test/pixel.jpg', 'javascript:alert(1)', 'data:image/svg+xml,<svg>', null, 'data:image/jpeg;base64,/9j/' + 'A'.repeat(24001)]) assert.equal(validProfilePhoto(value), false);
});

test('path exam requires nine correct answers, rejects invalid choice indices, and keeps legacy passes', async () => {
  const previous = process.env.ACADEMY_EXAM_BANK;
  const bank = Array.from({ length: 10 }, (_, i) => ({ id: `case-${i}`, question: { ar: 'حالة اختبار صناعية طويلة', en: 'A sufficiently long synthetic case' }, options: Array.from({ length: 4 }, (_, j) => ({ ar: `قرار ${j}`, en: `Decision ${j}` })), answer: i % 4 }));
  process.env.ACADEMY_EXAM_BANK = JSON.stringify(bank);
  const rows = new Map();
  const service = examService({ base: 'https://test.example', getLessonState: async () => ({ awards: Array(9).fill({}) }), request: async (url, options = {}) => {
    if (options.method === 'POST') {
      const body = JSON.parse(options.body); const row = { ...body.data, $createdAt: new Date().toISOString() };
      rows.set(`${url}/${body.rowId}`, row); return { status: 201, data: row };
    }
    return rows.has(url) ? { status: 200, data: rows.get(url) } : { status: 404, data: {} };
  } });
  try {
    const answers = Object.fromEntries(bank.map(q => [q.id, q.answer]));
    const invalid = { ...answers, 'case-0': 4 };
    assert.equal((await service.submit('invalid-user', 'Test Learner', invalid, (await service.state('invalid-user')).formId)).code, 400);
    const eight = { ...answers, 'case-0': 1, 'case-1': 2 };
    const eightResult = await service.submit('eight-user', 'Test Learner', eight, (await service.state('eight-user')).formId);
    assert.deepEqual([eightResult.code, eightResult.data.score, eightResult.data.passed], [200, 8, false]);
    const nine = { ...answers, 'case-0': 1 };
    const nineResult = await service.submit('nine-user', 'Test Learner', nine, (await service.state('nine-user')).formId);
    assert.deepEqual([nineResult.code, nineResult.data.score, nineResult.data.passed], [200, 9, true]);
    assert.equal(nineResult.data.passScore, 9);
    assert.equal((await service.state('nine-user')).passed, true);
    const { examAttemptId } = await import('../functions/academy-progress/src/exam.js');
    rows.set(`https://test.example/tablesdb/6aa56477002e28054068/tables/6ab933b6001be5900662/rows/${examAttemptId('legacy-user', 1)}`, { userId: 'legacy-user', payload: JSON.stringify({ version: 'foundations-v1', slot: 1, score: 8, passed: true, credentialId: 'c_' + '1'.repeat(32) }), $createdAt: new Date().toISOString() });
    assert.equal((await service.state('legacy-user')).passed, true);
  } finally { if (previous === undefined) delete process.env.ACADEMY_EXAM_BANK; else process.env.ACADEMY_EXAM_BANK = previous; }
});

test('all private lessons, exams and practical tasks have complete bilingual coverage', { skip: !hasPrivate }, () => {
  const edition = read('learning-edition.private.json');
  const courses = read('desktop-library.en.private.json').categories;
  assert.equal(Object.keys(edition.lessons).length, 105);
  for (const course of courses) for (const lesson of course.lessons) {
    const guide = edition.lessons[lesson.id];
    assert.ok(guide, lesson.id);
    for (const language of ['ar', 'en']) {
      for (const field of ['concept', 'artifact', 'analysis', 'exercise']) assert.ok(guide[field][language].length > 25, `${lesson.id}: ${field}`);
      assert.ok(guide.objectives[language].length >= 3 && guide.rubric[language].length >= 3);
      assert.equal(guide.checkpoint.options.length, 4);
    }
  }
  const pathBank = { foundations: read('exam-bank.private.json'), ...read('path-exam-bank.private.json') };
  const courseBank = read('course-exam-bank.private.json');
  const practicalBank = read('practical-bank.private.json');
  assert.equal(Object.keys(pathBank).length, 10);
  assert.equal(Object.keys(courseBank).length, 19);
  const examText = new Set();
  for (const questions of Object.values(pathBank)) {
    assert.equal(questions.length, 10);
    for (const q of questions) {
      assert.equal(q.options.length, 4);
      assert.ok(q.question.en.includes('\n') && q.question.ar.includes('\n'));
      examText.add(q.question.en);
    }
  }
  assert.equal(examText.size, 100);
  for (const questions of Object.values(practicalBank)) {
    assert.equal(questions.length, 3);
    for (const q of questions) { assert.ok(!examText.has(q.question.en)); assert.equal(q.options.length, 4); }
  }
  for (const group of read('practice-quiz-bank.private.json')) for (const q of group) {
    assert.ok(!examText.has(q.question.en));
    assert.ok(!Object.values(courseBank).flat().some(exam => exam.question.en === q.question.en));
  }
});

test('lesson checkpoints are graded on the server and cannot be bypassed by a mark-read request', { skip: !hasPrivate }, async () => {
  const { publicLibraryFor } = await import('../functions/academy-progress/src/library.js');
  const adminLibrary = publicLibraryFor('en', { admin: true }, true);
  assert.equal(Object.hasOwn(adminLibrary.categories[0].lessons[0].guide.checkpoint, 'answer'), false);
  assert.equal(Object.hasOwn(adminLibrary.categories[0].lessons[0].guide.checkpoint, 'explanation'), false);
  const locked = publicLibraryFor('en', { plan: 'free' }, false).categories[1].lessons[0];
  assert.equal(locked.guide, undefined);
  assert.equal(locked.content, undefined);
  const handler = (await import('../functions/academy-progress/src/main.js')).default;
  const oldFetch = globalThis.fetch; const rows = new Map();
  const response = (status, data = {}) => ({ status, json: async () => data });
  globalThis.fetch = async (url, options = {}) => {
    if (new URL(url).pathname === '/v1/account') return response(200, { $id: 'quality-learner', name: 'Test Learner' });
    if (options.method === 'POST') { const body = JSON.parse(options.body); rows.set(new URL(url).pathname + '/' + body.rowId, { ...body.data, $createdAt: new Date().toISOString() }); return response(201); }
    const row = rows.get(new URL(url).pathname); return row ? response(200, row) : response(404);
  };
  const invoke = bodyJson => handler({ req: { headers: { 'x-appwrite-user-jwt': 'fixture', 'x-appwrite-key': 'fixture' }, bodyJson }, res: { json: (body, status = 200) => ({ status, body }) }, error: () => {} });
  try {
    const check = read('learning-edition.private.json').lessons['desktop-topic-1'].checkpoint;
    assert.equal((await invoke({ action: 'libraryMarkLesson', lessonId: 'desktop-topic-1' })).status, 400);
    assert.equal((await invoke({ action: 'libraryMarkLesson', lessonId: 'desktop-topic-1', answerIndex: (check.answer + 1) % 4 })).status, 422);
    assert.equal(rows.size, 0);
    assert.equal((await invoke({ action: 'libraryMarkLesson', lessonId: 'desktop-topic-2', answerIndex: 0 })).status, 409);
    assert.equal((await invoke({ action: 'libraryMarkLesson', lessonId: 'desktop-topic-1', answerIndex: check.answer })).status, 200);
    assert.equal(rows.size, 1);
    assert.equal((await invoke({ action: 'libraryMarkLesson', lessonId: 'desktop-topic-1' })).status, 200);
    assert.equal(rows.size, 1);
    assert.equal((await invoke({ action: 'libraryLessonState', lessonId: 'desktop-topic-1' })).body.read, true);
  } finally { globalThis.fetch = oldFetch; }
});
