import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { additionalPathIds } from '../functions/academy-progress/src/additional-paths.js';
import { libraryData, programPathIds } from '../functions/academy-progress/src/library.js';
import { pathExamService, pathQuestions } from '../functions/academy-progress/src/path-exam.js';
import { practicalService } from '../functions/academy-progress/src/practical.js';
import { credentialFacts, validCredentialRecord } from '../credential-art.js';

const privateBanksAvailable = ['path-exam-bank.private.json', 'practical-bank.private.json', 'course-exam-bank.private.json', 'practice-quiz-bank.private.json', 'desktop-library.ar.private.json', 'desktop-library.en.private.json']
  .every((file) => existsSync(new URL(`../functions/academy-progress/${file}`, import.meta.url)));

test('four added roadmaps have distinct IDs and real course sequences in both languages', { skip: !privateBanksAvailable }, () => {
  assert.equal(programPathIds().length, 9);
  assert.equal(new Set(programPathIds()).size, 9);
  for (const id of additionalPathIds) {
    const paths = ['ar', 'en'].map((language) => libraryData(language).roadmapPaths.find((path) => path[2] === id));
    assert.equal(paths.length, 2);
    for (const [index, path] of paths.entries()) {
      assert.ok(path, `${id} missing in ${index === 0 ? 'ar' : 'en'}`);
      assert.ok(path[6].length >= 2);
      for (const order of path[6]) {
        const course = libraryData(index === 0 ? 'ar' : 'en').categories.find((item) => item.order === order);
        assert.ok(course?.lessons.length >= 4, `${id}: course ${order} missing content`);
      }
    }
    assert.equal(paths[0][6].join(','), paths[1][6].join(','));
  }
});

test('new specialty final questions are distinct from course and practice questions', { skip: !privateBanksAvailable }, () => {
  const courseBank = JSON.parse(readFileSync(new URL('../functions/academy-progress/course-exam-bank.private.json', import.meta.url), 'utf8'));
  const practiceBank = JSON.parse(readFileSync(new URL('../functions/academy-progress/practice-quiz-bank.private.json', import.meta.url), 'utf8'));
  const normalize = (value) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  for (const language of ['ar', 'en']) {
    const courseQuestions = [
      ...Object.values(courseBank).flat().map((item) => item.question[language]),
      ...libraryData(language).quizzes.flatMap((quiz) => quiz.questions.map((item) => item.q)),
      ...practiceBank.flat().map((item) => item.question[language]),
    ];
    const used = new Set(courseQuestions.map(normalize));
    for (const pathId of additionalPathIds) {
      for (const question of pathQuestions(pathId, language)) {
        assert.equal(used.has(normalize(question.question)), false, `${pathId} reuses a question in ${language}`);
        used.add(normalize(question.question));
      }
    }
  }
});

test('each new specialty requires Pro, practical work and a separate graded exam before a verifiable credential', { skip: !privateBanksAvailable }, async () => {
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
    throw new Error('Unexpected request');
  };
  const base = 'https://example.test/v1';
  const practical = practicalService({ base, request });
  for (const pathId of additionalPathIds) {
    const userId = `user-${pathId}`;
    const service = (plan, getCoursePassed = async () => true) => pathExamService({ base, request,
      getRead: async () => true, getCoursePassed, getPracticalPassed: practical.passed,
      membership: { plan, admin: false }, foundationsPassed: true });
    assert.equal((await service('plus').state(userId, pathId)).data.access, false);
    const pro = service('pro');
    const before = await pro.state(userId, pathId, 'en');
    assert.equal(before.data.access, true);
    assert.equal(before.data.eligible, false);
    assert.equal(before.data.readyForPractical, true);
    assert.equal(before.data.questions, undefined);
    assert.equal((await service('pro', async () => false).state(userId, pathId)).data.readyForPractical, false);
    const tasks = await practical.state(userId, pathId, 'ar', true);
    assert.equal(tasks.data.tasks.length, 3);
    assert.ok(tasks.data.tasks.every((item) => !Object.hasOwn(item, 'answer')));
    const bank = JSON.parse(readFileSync(new URL('../functions/academy-progress/practical-bank.private.json', import.meta.url), 'utf8'));
    const decisions = Object.fromEntries(bank[pathId].map((item) => [item.id, item.answer]));
    assert.equal((await practical.submit(userId, pathId, decisions, true)).data.passed, true);
    const ready = await pro.state(userId, pathId, 'en');
    assert.equal(ready.data.eligible, true);
    assert.equal(ready.data.questions.length, 10);
    assert.ok(ready.data.questions.every((item) => !Object.hasOwn(item, 'answer')));
    const questions = pathQuestions(pathId, 'en', userId);
    assert.equal(new Set(questions.map((item) => item.question)).size, 10);
    const answers = Object.fromEntries(questions.map((item) => [item.id, item.answer]));
    const passed = await pro.submit(userId, 'Real Learner', pathId, answers, ready.data.formId);
    assert.equal(passed.data.passed, true);
    const credential = await pro.credential(userId, pathId);
    assert.equal(credential.data.status, 'active');
    assert.equal(credential.data.practicalScore, 3);
    assert.equal(validCredentialRecord(credential.data), true);
    assert.equal(credential.data.shared, false);
    assert.equal(credentialFacts(credential.data, 'en').verifyUrl.endsWith(credential.data.id), true);
    assert.equal((await pro.share(userId, pathId, true)).data.shared, true);
  }
});
