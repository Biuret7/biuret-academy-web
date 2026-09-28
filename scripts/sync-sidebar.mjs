import { readFileSync, writeFileSync } from 'node:fs';
import { pageContext } from './page-context.mjs';

const root = new URL('../', import.meta.url);
const home = readFileSync(new URL('index.html', root), 'utf8');
const sidebar = home.match(/    <aside class="academy-sidebar"[\s\S]*?    <button class="sidebar-scrim"[^>]*><\/button>/)?.[0];
if (!sidebar) throw new Error('Could not find the Academy sidebar in index.html');

for (const page of ['paths', 'challenges', 'progress']) {
  const file = new URL(`${page}.html`, root);
  let html = readFileSync(file, 'utf8');
  const currentSidebar = sidebar
    .replace('href="index.html" aria-current="page"', 'href="index.html"')
    .replace(`href="${page}.html"`, `href="${page}.html" aria-current="page"`);

  if (html.includes('<aside class="academy-sidebar"')) {
    html = html.replace(/    <aside class="academy-sidebar"[\s\S]*?    <button class="sidebar-scrim"[^>]*><\/button>/, currentSidebar);
  } else {
    html = html.replace(/(<div class="site-shell" data-page="[^"]+">\r?\n)/, `$1${currentSidebar}\n`);
  }
  html = html
    .replace(/      <nav class="desktop-nav" id="site-navigation"[\s\S]*?      <\/nav>\r?\n/, '')
    .replace('aria-controls="site-navigation"', 'aria-controls="academy-sidebar"');
  if (html.includes('class="page-header-context"')) {
    html = html.replace(/<div class="page-header-context">[\s\S]*?<\/div>/, pageContext(page));
  } else {
    html = html.replace(/(      <button class="nav-toggle"[^\n]+\r?\n)/, `$1      ${pageContext(page)}\n`);
  }
  writeFileSync(file, html);
}
