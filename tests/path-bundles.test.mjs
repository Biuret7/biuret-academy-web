import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { academyPaths } from '../path-catalog-data.js';
import { specializations } from '../journey.js';
import { pathAccess, pathCounts, resourceAccess } from '../path-model.js';
import { libraryData } from '../functions/academy-progress/src/library.js';

const foundations = academyPaths.find(p => p.id === 'foundations');
const specialty = academyPaths.find(p => p.id === 'path_pentest');
test('one bilingual directory covers Foundations and every specialty without duplicate paths', () => {
  assert.deepEqual(new Set(academyPaths.map(p => p.id)), new Set(['foundations', ...specializations.map(p => p.pathId)]));
  assert.equal(academyPaths.length, 10);
  assert.equal(academyPaths.filter(p => p.free).length, 1);
  for (const p of academyPaths) {
    for (const lang of ['ar', 'en']) {
      assert.ok(p.title[lang] && p.summary[lang] && p.outcomes[lang].length);
      for (const item of [...p.courses, ...p.quizzes, ...p.labs, ...p.challenges]) assert.ok(item.title[lang]);
    }
    for (const href of [p.exam, p.practical, p.certificate, ...[...p.courses, ...p.quizzes, ...p.labs, ...p.challenges].map(x => x.href)]) {
      assert.ok(existsSync(new URL(`../${href.split('?')[0]}`, import.meta.url)), href);
    }
    assert.ok(p.courses.length && p.quizzes.length && p.labs.length && p.challenges.length);
  }
  assert.deepEqual(pathCounts(foundations), { courses: 3, lessons: 9, quizzes: 1, labs: 2, challenges: 5 });
});

test('public path metadata contains no private teaching bodies or assessment keys', () => {
  const forbidden = new Set(['questions', 'question', 'answer', 'answers', 'options', 'body', 'content', 'solution', 'correctAnswer']);
  const visit = value => {
    if (!value || typeof value !== 'object') return;
    for (const [key, item] of Object.entries(value)) { assert.equal(forbidden.has(key), false, key); visit(item); }
  };
  visit(academyPaths);
  const workflow = readFileSync(new URL('../.github/workflows/deploy-pages.yml', import.meta.url), 'utf8');
  assert.match(workflow, /cp .*path\.html.*path-catalog-data\.js/);
  assert.doesNotMatch(workflow, /cp .*private\.json/);
});

test('path workspace fails closed, keeps Foundations free and does not infer purchases from a plan', () => {
  const free = { plan: 'free' }, pro = { plan: 'pro' };
  assert.equal(pathAccess(foundations, null, false), 'unavailable');
  assert.equal(pathAccess(foundations, free, false), 'free');
  assert.equal(pathAccess(specialty, pro, false), 'foundations');
  assert.equal(pathAccess(specialty, free, true), 'purchase');
  assert.equal(pathAccess(specialty, pro, true), 'existing');
  assert.equal(pathAccess(specialty, { ...free, admin: true }, false), 'admin');
  assert.equal(pathAccess(specialty, { ...free, ownedPathIds: [specialty.id] }, true), 'owned');
  assert.equal(pathAccess(specialty, { ...free, ownedPathIds: ['path_soc'] }, true), 'purchase');
  assert.equal(pathAccess(specialty, { admin: true }, true, false), 'unavailable');
  for (const blocked of ['unavailable', 'foundations', 'purchase']) assert.equal(resourceAccess(specialty, 'course', specialty.courses[0], blocked, pro), false);
  for (const item of foundations.courses) assert.equal(resourceAccess(foundations, 'course', item, 'free', free), true);
});

const banks = ['desktop-library.ar.private.json', 'desktop-library.en.private.json'].every(file => existsSync(new URL(`../functions/academy-progress/${file}`, import.meta.url)));
test('path bundle course and lesson lists match the server certificate requirements', { skip: !banks }, () => {
  for (const language of ['ar', 'en']) {
    const library = libraryData(language);
    for (const p of academyPaths.filter(p => !p.free)) {
      const roadmap = library.roadmapPaths.find(x => x[2] === p.id);
      assert.deepEqual(p.courses.map(x => x.order), roadmap[6], p.id);
      for (const c of p.courses) assert.deepEqual(c.lessonIds, library.categories.find(x => x.order === c.order).lessons.map(x => x.id), c.id);
    }
  }
});
