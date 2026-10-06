import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const privateFile = name => new URL(`functions/academy-progress/${name}.private.json`, root);
const available = existsSync(privateFile('desktop-library.en'));
const read = name => JSON.parse(readFileSync(privateFile(name), 'utf8'));

test('the Academy inventory audit rejects structural, reference and locale defects', () => {
  const result = spawnSync(process.execPath, ['scripts/audit-academy.mjs', '--strict'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.inventory.pages, 37);
  assert.equal(report.inventory.paths, 10);
  assert.equal(report.summary.errors, 0);
  if (available) {
    assert.equal(report.inventory.programLessons, 105);
    assert.equal(report.inventory.programCourses, 19);
    assert.equal(report.inventory.practiceQuizSets, 13);
  }
});

test('practice prompts are case-specific and the network-discovery case uses network evidence', { skip: !available }, () => {
  for (const lang of ['ar', 'en']) {
    const library = read(`desktop-library.${lang}`);
    for (const kind of ['labs', 'challenges']) {
      assert.equal(new Set(library[kind].map(x => x.verify_q)).size, library[kind].length);
    }
    const network = library.challenges[0];
    assert.match(network.sample, /443\/tcp=open/);
    assert.match(network.sample, /22\/tcp=filtered/);
    assert.equal(network.verify_ans, 0);
    assert.doesNotMatch(network.sample, /lockout-threshold/);
    for (const credential of library.certifications) assert.doesNotMatch(credential.description + credential.note, /♪|8570|24 hours|الأفضل|أصعب/);
  }
});
