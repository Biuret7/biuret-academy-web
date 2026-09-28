import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const library = JSON.parse(read('content/desktop-library.json'));

test('desktop curriculum is complete and contains only public learning records', () => {
  assert.equal(library.categories.length, 18);
  assert.equal(library.categories.reduce((count, category) => count + category.lessons.length, 0), 99);
  assert.equal(library.tools.length, 15);
  assert.equal(library.quizzes.length, 12);
  assert.equal(library.challenges.length, 13);
  assert.equal(library.labs.length, 8);
  assert.equal(library.operations.length, 6);
  assert.equal(library.roadmapPaths.length, 5);
  assert.equal(library.certifications.length, 8);
  assert.equal(library.storeCategories.length, 16);
  const ids = library.categories.flatMap((category) => category.lessons.map((lesson) => lesson.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(library.categories.every((category) => category.lessons.every((lesson) => lesson.content.length > 100)));
  assert.ok(library.categories.every((category) => category.lessons.every((lesson) => lesson.metadata.objectives.length === 3 && lesson.metadata.sources.length > 0)));
  assert.doesNotMatch(read('content/desktop-library.json'), /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|_COIN_SECRET|client_secret|academy\.db/i);
  assert.doesNotMatch(read('content/desktop-library.json'), /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
});

test('every imported library route is built, linked and staged for Pages', () => {
  const workflow = read('.github/workflows/deploy-pages.yml');
  const sitemap = read('sitemap.xml');
  assert.match(workflow, /desktop\.js/);
  assert.match(workflow, /content\/desktop-library\.json/);
  for (const page of ['review', 'operations', 'operation', 'certifications', 'professional', 'notes', 'favorites', 'search', 'settings', 'profile', 'library-course', 'library-lesson', 'practice-quiz', 'practice-lab', 'practice-challenge']) {
    assert.match(read(`${page}.html`), /id="desktop-main"/);
    assert.match(read(`${page}.html`), /src="desktop\.js/);
    assert.match(workflow, new RegExp(`${page}\.html`));
  }
  for (const category of library.categories) {
    assert.ok(sitemap.includes(`library-course.html?id=${category.id}`));
    for (const lesson of category.lessons) assert.ok(sitemap.includes(`library-lesson.html?id=${lesson.id}`));
  }
});

test('practice answer keys and scenario choices are internally valid', () => {
  for (const quiz of library.quizzes) {
    assert.ok(quiz.questions.length > 0);
    for (const question of quiz.questions) {
      assert.ok(question.opts.length >= 2);
      assert.ok(Number.isInteger(question.ans) && question.ans >= 0 && question.ans < question.opts.length);
    }
  }
  for (const item of [...library.labs, ...library.challenges]) {
    assert.ok(Number.isInteger(item.verify_ans) && item.verify_ans >= 0 && item.verify_ans < item.verify_opts.length);
  }
  for (const operation of library.operations) {
    assert.ok(operation.evidence.length > 0);
    assert.ok(operation.decisions.length >= 2 && operation.responses.length >= 2);
    assert.ok(operation.decisions.every((choice) => typeof choice.explanation === 'string'));
  }
});
