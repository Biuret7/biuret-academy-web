import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pages = ['courses', 'labs', 'quizzes', 'tools', 'shop'];
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('all Academy catalog pages have a visible route and are included in the public deployment', () => {
  const workflow = read('.github/workflows/deploy-pages.yml');
  const sitemap = read('sitemap.xml');
  for (const page of pages) {
    const html = read(`${page}.html`);
    assert.match(html, new RegExp(`data-page="${page}"`));
    assert.match(html, /id="catalog-main"/);
    assert.match(html, new RegExp(`data-resource="${page}" aria-current="page"`));
    assert.match(html, /src="catalog\.js\?v=/);
    assert.match(workflow, new RegExp(`${page}\.html`));
    assert.match(sitemap, new RegExp(`/${page}\.html`));
    for (const destination of pages) assert.match(html, new RegExp(`href="${destination}\.html"`));
  }
});

test('Academy pages use one navigation with every section available', () => {
  const sections = ['paths', 'courses', 'labs', 'quizzes', 'challenges', 'tools', 'progress', 'shop', 'membership'];
  const allPages = ['index', ...sections, 'course', 'lesson', 'lab', 'exam', 'certificate', 'admin'];
  for (const page of allPages) {
    const html = read(`${page}.html`);
    assert.equal((html.match(/<nav\b/g) || []).length, 1, `${page} must have one navigation`);
    assert.match(html, /id="nav-toggle"[^>]*aria-controls="site-navigation"[^>]*aria-expanded="false"/);
    assert.match(html, /<nav class="desktop-nav" id="site-navigation"/);
    for (const section of sections) assert.match(html, new RegExp(`href="${section}\\.html"`));
  }
});
