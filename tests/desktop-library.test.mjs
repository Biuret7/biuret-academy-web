import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { requiredPlan, canAccess } from '../plan-access.js';
import { requiredLibraryPlan, mayAccessLibrary } from '../functions/academy-progress/src/library.js';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const catalog = JSON.parse(read('content/desktop-catalog.json'));

test('public catalog lists every course and lesson without lesson bodies or answers', () => {
  assert.equal(catalog.categories.length, 19);
  assert.equal(catalog.categories.reduce((count, category) => count + category.lessons.length, 0), 105);
  const ids = catalog.categories.flatMap((category) => category.lessons.map((lesson) => lesson.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(catalog.categories.every((category) => category.lessons.every((lesson) => Object.keys(lesson).join() === 'id')));
  assert.doesNotMatch(read('content/desktop-catalog.json'), /content|question|verify_ans|storeCategories|BEGIN PRIVATE KEY/i);
});

test('program curriculum is served by authenticated function and excluded from Pages', () => {
  const workflow = read('.github/workflows/deploy-pages.yml');
  const sitemap = read('sitemap.xml');
  assert.match(workflow, /desktop\.js/);
  assert.doesNotMatch(workflow, /cp content\/desktop-library/);
  assert.match(read('desktop.js'), /loadProgramLibrary\(/);
  assert.doesNotMatch(read('desktop.js'), /fetch\(['"]content\/desktop-library/);
  for (const page of ['review', 'operations', 'operation', 'certifications', 'professional', 'notes', 'favorites', 'search', 'settings', 'library-course', 'library-lesson', 'practice-quiz', 'practice-lab', 'practice-challenge']) {
    assert.match(read(`${page}.html`), /id="desktop-main"/);
    assert.match(read(`${page}.html`), /src="desktop\.js/);
    assert.match(workflow, new RegExp(`${page}\.html`));
  }
  for (const category of catalog.categories) {
    assert.ok(!sitemap.includes(`library-course.html?id=${category.id}`));
    for (const lesson of category.lessons) assert.ok(!sitemap.includes(`library-lesson.html?id=${lesson.id}`));
  }
  for (const page of ['library-course', 'library-lesson', 'course-exam', 'profile', 'notes', 'favorites', 'settings']) assert.match(read(`${page}.html`), /name="robots" content="noindex, follow"/);
});

test('client and function agree on Free, Plus and Pro limits', () => {
  for (const [kind, count] of Object.entries({ course: 19, quiz: 13, lab: 8, challenge: 13, tool: 15, operation: 6 })) {
    for (let index = kind === 'course' ? 1 : 0; index < (kind === 'course' ? count + 1 : count); index++) {
      const required = requiredPlan(kind, index);
      assert.equal(required, requiredLibraryPlan(kind, index));
      for (const plan of ['free', 'plus', 'pro']) {
        const membership = { plan, effectivePlan: plan, admin: false };
        assert.equal(canAccess(kind, index, membership) && (required === 'free'), mayAccessLibrary(kind, index, membership, false));
        assert.equal(canAccess(kind, index, membership), mayAccessLibrary(kind, index, membership, true));
      }
      assert.equal(mayAccessLibrary(kind, index, { plan: 'free', admin: true }, false), true);
    }
  }
});
