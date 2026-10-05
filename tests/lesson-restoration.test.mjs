import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { publicLibraryFor, libraryData, lessonCheckpoint } from '../functions/academy-progress/src/library.js';

const base = new URL('../functions/academy-progress/', import.meta.url);
const hasPrivate = existsSync(new URL('learning-edition.private.json', base));

test('all 105 course explanations survive public serialization in both languages alongside their checkpoints', { skip: !hasPrivate }, () => {
  const edition = JSON.parse(readFileSync(new URL('learning-edition.private.json', base), 'utf8'));
  for (const language of ['ar', 'en']) {
    const original = libraryData(language).categories.flatMap(course => course.lessons);
    const published = publicLibraryFor(language, { admin: true }, true).categories.flatMap(course => course.lessons);
    assert.equal(published.length, 105);
    for (const lesson of original) {
      const restored = published.find(row => row.id === lesson.id);
      assert.equal(restored.content, lesson.content, `${language}/${lesson.id}: full explanation`);
      assert.ok(restored.content.length > 400);
      const check = edition.lessons[lesson.id].checkpoint;
      assert.equal(restored.guide.checkpoint.question, check.question[language]);
      assert.deepEqual(restored.guide.checkpoint.options, check.options.map(option => option[language]));
      assert.equal(Object.hasOwn(restored.guide.checkpoint, 'answer'), false);
      assert.equal(Object.hasOwn(restored.guide.checkpoint, 'explanation'), false);
      assert.equal(lessonCheckpoint(lesson.id, check.answer).correct, true);
      assert.equal(lessonCheckpoint(lesson.id, (check.answer + 1) % 4).correct, false);
    }
  }
});

test('restoring full explanations preserves the lesson access boundary', { skip: !hasPrivate }, () => {
  for (const language of ['ar', 'en']) {
    const result = publicLibraryFor(language, { plan: 'free' }, false);
    for (const course of result.categories) for (const lesson of course.lessons) {
      if (course.order === 1) {
        assert.ok(lesson.content && lesson.guide.checkpoint);
      } else {
        assert.equal(course.locked, true);
        assert.equal(Object.hasOwn(lesson, 'content'), false);
        assert.equal(Object.hasOwn(lesson, 'guide'), false);
      }
    }
  }
});
