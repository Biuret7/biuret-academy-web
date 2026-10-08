import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pageContexts } from '../scripts/page-context.mjs';

const pages = ['courses', 'labs', 'quizzes', 'tools', 'shop'];
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('all Academy catalog pages have a visible route and are included in the public deployment', () => {
  const workflow = read('.github/workflows/deploy-pages.yml');
  const sitemap = read('sitemap.xml');
  for (const page of pages) {
    const html = read(`${page}.html`);
    assert.match(html, new RegExp(`data-page="${page}"`));
    assert.match(html, /id="catalog-main"/);
    assert.match(html, new RegExp(`<a href="${page}\\.html" aria-current="page"`));
    assert.match(html, /src="catalog\.js\?v=/);
    assert.match(workflow, new RegExp(`${page}\.html`));
    if (page === 'shop') {
      assert.doesNotMatch(sitemap, /\/shop\.html/);
      assert.match(html, /name="robots" content="noindex, follow"/);
    } else assert.match(sitemap, new RegExp(`/${page}\.html`));
    for (const destination of pages) assert.match(html, new RegExp(`href="${destination}\.html"`));
  }
});

test('Academy pages use one navigation with every section available', () => {
  const sections = ['index', 'paths', 'review', 'courses', 'operations', 'labs', 'quizzes', 'challenges', 'tools', 'progress', 'certifications', 'professional', 'notes', 'favorites', 'exam', 'certificate', 'membership', 'shop', 'search', 'settings', 'profile'];
  const allPages = ['index', ...sections, 'path', 'course', 'lesson', 'lab', 'admin', 'library-course', 'library-lesson', 'practice-quiz', 'practice-lab', 'practice-challenge', 'operation', 'course-exam', 'practical', 'path-exam'];
  const activeSection = { path: 'paths', course: 'courses', lesson: 'courses', lab: 'labs', 'library-course': 'courses', 'library-lesson': 'courses', 'course-exam': 'courses', practical: 'paths', 'path-exam': 'paths', 'practice-quiz': 'quizzes', 'practice-lab': 'labs', 'practice-challenge': 'challenges', operation: 'operations', admin: null };
  const homeSidebar = read('index.html').match(/<nav class="sidebar-nav"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(homeSidebar);
  for (const page of new Set(allPages)) {
    const html = read(`${page}.html`);
    assert.equal((html.match(/<nav\b/g) || []).length, 1, `${page} must have one navigation`);
    assert.match(html, /<aside class="academy-sidebar" id="academy-sidebar"/);
    assert.match(html, /id="nav-toggle"[^>]*aria-controls="academy-sidebar"[^>]*aria-expanded="false"/);
    assert.match(html, /sidebar-brand-mark"><img src="\/assets\/biuret-logo-20261005\.png"/);
    assert.match(html, /id="sidebar-scrim"/);
    const [label, arabic, english] = pageContexts[page === 'index' ? 'home' : page];
    assert.match(html, new RegExp(`ACADEMY / ${label}`));
    assert.ok(html.includes(`data-ar="${arabic}" data-en="${english}"`), `${page} must have a bilingual page heading`);
    const sidebar = html.match(/<nav class="sidebar-nav"[\s\S]*?<\/nav>/)?.[0];
    assert.ok(sidebar, `${page} must contain sidebar navigation`);
    assert.equal(sidebar.replace(/ aria-current="page"/g, ''), homeSidebar.replace(/ aria-current="page"/g, ''), `${page} must match the home navigation`);
    for (const section of sections) assert.match(sidebar, new RegExp(`href="${section}\\.html"`));
    const current = [...sidebar.matchAll(/<a href="([^"]+)" aria-current="page"/g)].map((match) => match[1]);
    const expected = activeSection[page] === null ? [] : [`${activeSection[page] || page}.html`];
    assert.deepEqual(current, expected, `${page} must highlight its current section`);
  }
});
