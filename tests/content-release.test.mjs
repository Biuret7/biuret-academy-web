import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { digest, renderLearningModule, validatePack } from '../scripts/content-rules.mjs';

const livePack = JSON.parse(readFileSync(new URL('../content/releases/foundations-2026-09-27.json', import.meta.url), 'utf8'));

test('content review checks localization and protects server-verified lesson answers', () => {
  assert.deepEqual(validatePack(livePack), []);
  const missingEnglish = structuredClone(livePack);
  missingEnglish.lessons[0].sections[0].body.en = '';
  assert.ok(validatePack(missingEnglish).some((error) => error.includes('Arabic and English')));
  const changedAnswer = structuredClone(livePack);
  changedAnswer.lessons[0].check.answer = 0;
  assert.ok(validatePack(changedAnswer).some((error) => error.includes('server-verified answer changed')));
  const changedOption = structuredClone(livePack);
  changedOption.lessons[0].check.options[1].en = 'A different answer';
  assert.ok(validatePack(changedOption).some((error) => error.includes('published check wording')));
});

test('reviewed draft publishes and rollback restores the prior release', () => {
  const temp = mkdtempSync(join(tmpdir(), 'biuret-content-'));
  const realTemp = realpathSync(temp);
  const realTmpRoot = realpathSync(tmpdir());
  assert.ok(realTemp.startsWith(`${realTmpRoot}${sep}`));
  const releaseScript = fileURLToPath(new URL('../scripts/content-release.mjs', import.meta.url));
  const run = (...args) => spawnSync(process.execPath, [releaseScript, ...args], { env: { ...process.env, ACADEMY_CONTENT_ROOT: temp }, encoding: 'utf8' });
  try {
    for (const dir of ['releases', 'drafts', 'reviews']) mkdirSync(join(temp, 'content', dir), { recursive: true });
    const base = 'foundations-base';
    writeFileSync(join(temp, 'content', 'releases', `${base}.json`), `${JSON.stringify(livePack, null, 2)}\n`);
    writeFileSync(join(temp, 'learning-content.js'), renderLearningModule(livePack));
    writeFileSync(join(temp, 'content', 'active.json'), `${JSON.stringify({ activeRelease: base, activeDigest: digest(livePack), history: [{ releaseId: base }] })}\n`);
    assert.equal(run('verify').status, 0);
    assert.equal(run('start', 'copy-update', 'author').status, 0);
    const draftPath = join(temp, 'content', 'drafts', 'copy-update.json');
    const draft = JSON.parse(readFileSync(draftPath, 'utf8'));
    draft.lessons[0].summary.en = 'Identify every part of a web address before making a decision.';
    writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`);
    assert.equal(run('review', 'copy-update', 'author').status, 1);
    assert.equal(run('review', 'copy-update', 'editor').status, 0);
    draft.lessons[0].summary.en = 'Changed after review';
    writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`);
    assert.equal(run('publish', 'copy-update', 'foundations-update').status, 1);
    draft.lessons[0].summary.en = 'Identify every part of a web address before making a decision.';
    writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`);
    assert.equal(run('publish', 'copy-update', 'foundations-update').status, 0);
    assert.equal(run('verify').status, 0);
    assert.equal(run('rollback', base).status, 0);
    assert.equal(run('verify').status, 0);
    assert.equal(JSON.parse(readFileSync(join(temp, 'content', 'active.json'), 'utf8')).history.length, 3);
  } finally { rmSync(realTemp, { recursive: true, force: true }); }
});
