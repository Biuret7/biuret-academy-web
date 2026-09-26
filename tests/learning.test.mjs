import test from 'node:test';
import assert from 'node:assert/strict';
import { learningPath, courses, lessons } from '../learning-content.js';
import { cleanProgress, emptyProgress, isLessonUnlocked, completeLesson, courseLearningProgress, mergeProgress } from '../engine.js';

test('first course has a complete bilingual learning sequence', () => {
  const course = courses[0];
  assert.equal(learningPath.nodes[0].id, course.id);
  assert.equal(course.lessonIds.length, lessons.length);
  for (const id of course.lessonIds) {
    const lesson = lessons.find((item) => item.id === id);
    assert.ok(lesson);
    for (const language of ['ar', 'en']) {
      assert.ok(lesson.title[language]);
      assert.ok(lesson.summary[language]);
      assert.ok(lesson.sections.every((section) => section.title[language] && section.body[language]));
      assert.ok(lesson.check.question[language] && lesson.check.explanation[language]);
      assert.ok(lesson.check.options.every((option) => option[language]));
    }
    assert.ok(lesson.check.answer >= 0 && lesson.check.answer < lesson.check.options.length);
  }
});

test('lessons unlock in order and completion remains idempotent', () => {
  let progress = emptyProgress();
  assert.equal(isLessonUnlocked('url-parts', progress), true);
  assert.equal(isLessonUnlocked('url-traps', progress), false);
  assert.equal(completeLesson(progress, 'url-traps').completed, false);
  progress = completeLesson(progress, 'url-parts', new Date('2026-09-26T10:00:00Z')).progress;
  assert.equal(isLessonUnlocked('url-traps', progress), true);
  assert.equal(completeLesson(progress, 'url-parts').completed, false);
  progress = completeLesson(progress, 'url-traps').progress;
  assert.deepEqual(courseLearningProgress(progress, 'url-safety'), { completed: 2, total: 3, challengeComplete: false });
});

test('legacy progress remains valid and lesson completions merge across devices', () => {
  const legacy = { version: 1, completed: {}, activity: {}, dailyAssignments: {}, dailyBonus: {} };
  assert.deepEqual(cleanProgress(legacy).lessons, {});
  const left = { ...legacy, lessons: { 'url-parts': '2026-09-26T10:00:00.000Z' } };
  const right = { ...legacy, lessons: { 'url-parts': '2026-09-27T10:00:00.000Z', 'url-traps': '2026-09-27T11:00:00.000Z' } };
  const merged = mergeProgress(left, right);
  assert.equal(merged.lessons['url-parts'], left.lessons['url-parts']);
  assert.equal(merged.lessons['url-traps'], right.lessons['url-traps']);
});
