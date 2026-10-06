import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { examService, foundationsFormId } from '../functions/academy-progress/src/exam.js';
import { courseExamService, courseQuestions } from '../functions/academy-progress/src/course-exam.js';
import { pathExamService, pathQuestions } from '../functions/academy-progress/src/path-exam.js';
import { practicalService } from '../functions/academy-progress/src/practical.js';
import { libraryData, lessonCheckpoint, publicLibraryFor } from '../functions/academy-progress/src/library.js';
import { cleanPilot, pilotReport } from '../pilot-model.js';

const privateRoot = new URL('../functions/academy-progress/', import.meta.url);
const available = existsSync(new URL('exam-bank.private.json', privateRoot));
const read = name => JSON.parse(readFileSync(new URL(`${name}.private.json`, privateRoot), 'utf8'));
const answers = questions => Object.fromEntries(questions.map(q => [q.id, q.answer]));
const wrong = questions => Object.fromEntries(questions.map(q => [q.id, (q.answer + 1) % q.options.length]));
const noAnswers = value => assert.ok(!JSON.stringify(value).includes('"answer"'));

test('synthetic learner completes actual curriculum gates, failed attempts, cooldown and private credentials for all ten paths', { skip: !available }, async () => {
  const rows = new Map(), readLessons = new Set(), awards = [];
  const userId = 'synthetic-journey', base = 'https://memory.invalid/v1';
  let clock = Date.now(); const previousNow = Date.now;
  Date.now = () => clock;
  const request = async (url, options = {}) => {
    if (!options.method) return rows.has(url) ? { status: 200, data: rows.get(url) } : { status: 404 };
    const body = JSON.parse(options.body);
    if (options.method === 'POST') {
      const key = `${url}/${body.rowId}`;
      if (rows.has(key)) return { status: 409 };
      const row = { ...body.data, $createdAt: new Date(clock).toISOString(), $permissions: body.permissions };
      rows.set(key, row); return { status: 201, data: row };
    }
    if (options.method === 'PATCH') {
      const row = rows.get(url); if (!row) return { status: 404 };
      Object.assign(row, body.data, { $permissions: body.permissions }); return { status: 200, data: row };
    }
    throw new Error('Unexpected memory-only request');
  };
  const practical = practicalService({ base, request });
  const foundations = examService({ base, request, getLessonState: async () => ({ awards }), getPracticalPassed: practical.passed });
  const membership = { plan: 'pro', admin: false }; // Synthetic entitlement; no real billing or admin bypass.
  let foundationsPassed = false;
  const courses = courseExamService({ base, request, getRead: async (_, id) => readLessons.has(id), membership, foundationsPassed: true });
  const paths = () => pathExamService({ base, request, getRead: async (_, id) => readLessons.has(id), getCoursePassed: courses.passed, getPracticalPassed: practical.passed, membership, foundationsPassed });
  try {
    assert.equal((await foundations.state(userId)).eligible, false);
    assert.equal((await practical.submit(userId, 'foundations', {}, false)).code, 403);
    assert.equal((await paths().state(userId, 'path_soc')).data.access, false);
    awards.push(...Array.from({ length: 9 }, (_, i) => ({ lessonId: `synthetic-verified-${i}` })));
    assert.equal((await foundations.state(userId)).eligible, false);
    const tasks = read('practical-bank');
    const initial = await practical.state(userId, 'foundations', 'en', true); noAnswers(initial.data);
    assert.equal((await practical.submit(userId, 'foundations', wrong(tasks.foundations), true)).data.passed, false);
    assert.equal((await practical.submit(userId, 'foundations', answers(tasks.foundations), true)).data.passed, true);
    const foundationBank = read('exam-bank');
    let foundationForm = await foundations.state(userId); noAnswers(foundationForm);
    assert.equal((await foundations.submit(userId, 'Synthetic Learner', answers(foundationBank), 'stale')).code, 409);
    assert.equal((await foundations.state(userId)).attempts.length, 0);
    assert.equal((await foundations.submit(userId, 'Synthetic Learner', wrong(foundationBank), foundationForm.formId)).data.passed, false);
    assert.equal((await foundations.submit(userId, 'Synthetic Learner', answers(foundationBank), foundationForm.formId)).code, 429);
    clock += 86400001;
    foundationForm = await foundations.state(userId);
    assert.equal((await foundations.submit(userId, 'Synthetic Learner', answers(foundationBank), foundationForm.formId)).data.passed, true);
    foundationsPassed = true;
    const initialCredential = await foundations.credential(userId);
    assert.equal(initialCredential.data.shared, false);
    assert.equal(initialCredential.data.holderName, 'Synthetic Learner');
    const pathIds = libraryData('en').roadmapPaths.map(path => path[2]);
    for (const pathId of pathIds) {
      const state = await paths().state(userId, pathId);
      assert.equal(state.data.eligible, false); assert.equal(state.data.questions, undefined);
    }
    const edition = read('learning-edition');
    for (const course of libraryData('en').categories) {
      assert.equal((await courses.state(userId, course.order)).data.eligible, false);
      for (const lesson of course.lessons) {
        const checkpoint = edition.lessons[lesson.id].checkpoint;
        assert.equal(lessonCheckpoint(lesson.id, (checkpoint.answer + 1) % 4).correct, false);
        assert.equal(lessonCheckpoint(lesson.id, checkpoint.answer).correct, true);
        readLessons.add(lesson.id);
      }
      const ar = await courses.state(userId, course.order, 'ar'), en = await courses.state(userId, course.order, 'en');
      assert.equal(ar.data.formId, en.data.formId); noAnswers(en.data);
      const bank = courseQuestions(course.order, 'en', userId).questions;
      assert.equal((await courses.submit(userId, course.order, wrong(bank), en.data.formId)).data.passed, false);
      assert.equal((await courses.submit(userId, course.order, answers(bank), en.data.formId)).data.passed, true);
    }
    assert.equal(readLessons.size, 105);
    for (const pathId of pathIds) {
      const service = paths();
      let state = await service.state(userId, pathId);
      assert.equal(state.data.readyForPractical, true); assert.equal(state.data.eligible, false);
      const taskState = await practical.state(userId, pathId, 'ar', state.data.readyForPractical); noAnswers(taskState.data);
      assert.equal((await practical.submit(userId, pathId, wrong(tasks[pathId]), true)).data.passed, false);
      assert.equal((await practical.submit(userId, pathId, answers(tasks[pathId]), true)).data.passed, true);
      const ar = await service.state(userId, pathId, 'ar'), en = await service.state(userId, pathId, 'en');
      assert.equal(ar.data.formId, en.data.formId); noAnswers(en.data);
      let bank = pathQuestions(pathId, 'en', userId, 1);
      assert.equal((await service.submit(userId, 'Synthetic Learner', pathId, answers(bank), 'stale')).code, 409);
      assert.equal((await service.state(userId, pathId)).data.attempts.length, 0);
      assert.equal((await service.submit(userId, 'Synthetic Learner', pathId, wrong(bank), en.data.formId)).data.passed, false);
      assert.equal((await service.submit(userId, 'Synthetic Learner', pathId, answers(bank), en.data.formId)).code, 429);
      clock += 86400001;
      state = await service.state(userId, pathId, 'en'); bank = pathQuestions(pathId, 'en', userId, 2);
      assert.equal((await service.submit(userId, 'Synthetic Learner', pathId, answers(bank), state.data.formId)).data.passed, true);
      const credential = await service.credential(userId, pathId);
      assert.equal(credential.data.shared, false); assert.equal(credential.data.holderName, 'Synthetic Learner');
      assert.equal(credential.data.practicalScore, 3); assert.equal(credential.data.score, 10);
      assert.ok(credential.data.courseCount > 0 && credential.data.lessonCount > 0);
      assert.equal((await service.state(userId, pathId)).data.questions, undefined);
    }
    assert.equal(pathIds.length + 1, 10);
    assert.equal((await foundations.credential(userId)).data.id, initialCredential.data.id);
    assert.equal((await foundations.credential(userId)).data.shared, false);
  } finally { Date.now = previousNow; }
});

test('a Foundations form fingerprint changes with content and owner, with no live account activity', () => {
  const fixture = [{ id: 'synthetic', question: { ar: 'حالة', en: 'Case' }, options: [{ ar: 'أ', en: 'A' }], answer: 0 }];
  const first = foundationsFormId('learner', fixture);
  assert.notEqual(first, foundationsFormId('another', fixture));
  assert.notEqual(first, foundationsFormId('learner', [{ ...fixture[0], question: { ar: 'حالة مختلفة', en: 'Different case' } }]));
  assert.equal(first, foundationsFormId('learner', structuredClone(fixture)));
});

test('locked public content omits teaching/checkpoint data; full bilingual explanations remain for authorized learners', { skip: !available }, () => {
  for (const lang of ['ar', 'en']) {
    const locked = publicLibraryFor(lang, { plan: 'free', admin: false }, false);
    for (const course of locked.categories.filter(course => course.locked)) for (const lesson of course.lessons) {
      assert.equal(lesson.content, undefined); assert.equal(lesson.guide, undefined);
    }
    const open = publicLibraryFor(lang, { plan: 'pro', admin: false }, true);
    for (const course of open.categories) for (const lesson of course.lessons) {
      assert.ok(lesson.content.length > 400); noAnswers(lesson.guide.checkpoint);
    }
    assert.equal(open.labs.length, 8); assert.equal(open.challenges.length, 13);
    for (const item of [...open.labs, ...open.challenges]) assert.ok(item.goal && item.output && item.rubric.length >= 3);
    assert.equal(new Set(open.operations.flatMap(room => room.decisions.map(choice => choice.explanation))).size, 18);
  }
});

test('usability duration/confidence remain optional observations, not learning awards', () => {
  const clean = cleanPilot({ route: { result: 'independent', minutes: '2.5', confidence: '4' }, lesson: { minutes: -1, confidence: 6 } });
  assert.equal(clean.route.minutes, 2.5); assert.equal(clean.route.confidence, 4);
  assert.equal(clean.lesson.minutes, null); assert.equal(clean.lesson.confidence, null);
  const report = pilotReport(clean, 'ar'); assert.equal(report.version, 2);
  assert.equal(report.assessmentResult, false); assert.equal(report.observations.length, 9);
});
