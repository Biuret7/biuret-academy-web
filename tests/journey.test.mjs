import test from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../learning-content.js';
import { nextLearningStep, foundationsCount, specializations } from '../journey.js';
import { labs } from '../labs.js';
import { challengesForTrack } from '../content.js';
import { englishChallenges } from '../content-en.js';

test('the recommended route walks every Foundations lesson before the exam and specialties', () => {
  const lessons = {};
  const ordered = courses.flatMap((course) => course.lessonIds);
  for (const [index, id] of ordered.entries()) {
    assert.equal(nextLearningStep(lessons).lessonId, id);
    assert.deepEqual(foundationsCount(lessons), { completed: index, total: ordered.length });
    lessons[id] = '2026-09-28T00:00:00.000Z';
  }
  assert.equal(nextLearningStep(lessons).kind, 'practical');
  assert.equal(nextLearningStep(lessons, true).kind, 'specialization');
});

test('specialty previews and guided labs point to real material without claiming unbuilt courses', () => {
  assert.equal(new Set(specializations.map((path) => path.id)).size, specializations.length);
  for (const path of specializations) {
    for (const language of ['ar', 'en']) {
      assert.ok(path.title[language] && path.summary[language]);
      assert.ok(path.topics.every((topic) => topic[language]));
    }
    if (path.challengeTrack) assert.ok(challengesForTrack(path.challengeTrack).length > 0);
  }
  for (const lab of labs) {
    assert.ok(courses.some((course) => course.id === lab.courseId));
    assert.ok(lab.steps.length >= 3);
    for (const step of lab.steps) {
      assert.ok(step.choices[step.answer]);
      assert.ok(step.prompt.ar && step.prompt.en && step.explanation.ar && step.explanation.en);
    }
  }
  for (const track of ['foundations', 'web', 'forensics']) {
    const list = challengesForTrack(track);
    assert.deepEqual(list.map((challenge) => challenge.order), [1, 2, 3, 4, 5]);
    assert.ok(englishChallenges[list.at(-1).id]);
  }
});
