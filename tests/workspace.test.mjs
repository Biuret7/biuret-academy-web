import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { workspaces, destinations, parseWorkspace, workspaceHref, workspaceDownload } from '../workspace-model.js';
const base = 'https://academy.biuret.dev/';
const context = { workspace: 'learn', path: 'soc' };
test('workspace exports accept only bounded certificate files with matching MIME and safe filenames', () => {
  const filename = `Biuret-Academy-c_${'a'.repeat(32)}.png`, blob = new Blob(['synthetic'], {type:'image/png'});
  assert.deepEqual(workspaceDownload({blob,filename}), {blob,filename});
  for (const bad of ['https://other.example/file', new Blob(['script'],{type:'text/html'}), new Blob(), new Blob([new Uint8Array(8*1024*1024+1)],{type:'image/png'})]) assert.equal(workspaceDownload({blob:bad,filename}),null);
  for (const bad of ['../secret.png', 'credential.html', filename.replace('.png','.exe')]) assert.equal(workspaceDownload({blob,filename:bad}),null);
});
test('every learning destination opens an allowed document, preserving its query', () => {
  for (const [screen, workspace] of Object.entries(destinations)) {
    const href = workspaceHref(`${screen}.html?id=training&track=network#example`);
    const parsed = parseWorkspace(href);
    assert.equal(parsed.workspace, workspace);
    assert.equal(parsed.screen, screen);
    assert.equal(new URL(parsed.child, base).searchParams.get('id'), 'training');
    assert.equal(new URL(parsed.child, base).hash, '#example');
  }
});
test('course, lesson, practice and assessment navigation retains the learning route', () => {
  for (const screen of ['library-course', 'library-lesson', 'practice-lab', 'practice-quiz', 'operation', 'certificate']) {
    const href = workspaceHref(`${screen}.html?id=0`, context);
    assert.equal(new URL(href, base).pathname, '/learn.html');
    assert.equal(parseWorkspace(href).path, 'soc');
    assert.equal(parseWorkspace(href).screen, screen);
  }
  assert.equal(parseWorkspace(workspaceHref('path.html?id=cloud', context)).path, 'cloud');
  assert.equal(parseWorkspace(workspaceHref('paths.html', context)).path, '');
  assert.equal(parseWorkspace(workspaceHref('exam.html', context)).path, 'foundations');
});
test('a direct Foundations course or lesson link discovers its path context', () => {
  assert.equal(parseWorkspace(workspaceHref('course.html?id=identity-access')).path, 'foundations');
  assert.equal(parseWorkspace(workspaceHref('lesson.html?id=identity-passwords')).path, 'foundations');
  assert.equal(parseWorkspace(workspaceHref('free-studio.html')).path, 'foundations');
});
test('shared verification links, downloads, external links and private files never enter the workspace', () => {
  for (const href of ['https://other.example/lesson.html', 'javascript:alert(1)', 'assets/player.zip', 'functions/academy-progress/main.js', 'admin.html', `certificate.html?id=c_${'a'.repeat(32)}`]) assert.equal(workspaceHref(href, context), null);
});
test('untrusted screen and path values cannot select arbitrary frame documents', () => {
  for (const screen of ['constructor', '__proto__', '../admin', '//evil.example', 'javascript:alert(1)', 'admin']) {
    const route = parseWorkspace(`learn.html?screen=${encodeURIComponent(screen)}&path=${encodeURIComponent('../secret')}`);
    assert.equal(route.child, 'paths.html');
    assert.equal(route.path, '');
  }
  assert.equal(parseWorkspace('practice.html?screen=profile').screen, 'labs');
  assert.equal(parseWorkspace('constructor.html'), null);
});
test('workspace containers keep the existing signed-in learning gate and public-only deployment', () => {
  const workflow = readFileSync(new URL('../.github/workflows/deploy-pages.yml', import.meta.url), 'utf8');
  for (const name of Object.keys(workspaces)) {
    const source = readFileSync(new URL(`../${name}.html`, import.meta.url), 'utf8');
    assert.match(source, /id="workspace-main"/);
    assert.match(source, /src="app.js\?v=/);
    assert.match(source, /src="workspace.js\?v=/);
    assert.match(workflow, new RegExp(`${name}\\.html`));
  }
  const host = readFileSync(new URL('../workspace.js', import.meta.url), 'utf8');
  assert.match(host, /event\.origin !== location\.origin \|\| event\.source !== frame\.contentWindow/);
  assert.match(host, /!nextOwner \|\| !fullName\(user\(\)\?\.name\)/);
  assert.doesNotMatch(workflow, /cp -r functions/);
});
