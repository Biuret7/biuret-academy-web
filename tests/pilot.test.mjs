import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanPilot, pilotSummary, pilotReport, pilotTasks } from '../pilot-model.js';
import { existsSync } from 'node:fs';

test('pilot observations sanitize malformed and unknown data', () => {
  const cleaned = cleanPilot({ route: { result:'admin', note: { password:'secret' } }, practice: { result:'blocked', note:'x'.repeat(2500) }, forged: { result:'independent' } });
  assert.equal(cleaned.route.result, 'untried'); assert.equal(cleaned.route.note, '');
  assert.equal(cleaned.practice.note.length, 2000); assert.equal(cleaned.forged, undefined);
  assert.equal(Object.keys(cleaned).length, pilotTasks.length);
  assert.doesNotThrow(() => cleanPilot(null));
});
test('pilot report exports only observations, never account fields or earned awards', () => {
  const report = pilotReport({ email:'private@example.invalid', owner:'secret', token:'secret', route:{ result:'independent', note:'Navigation clear', name:'private' } }, 'en', new Date('2026-10-05T12:00:00Z'));
  assert.equal(report.selfReported, true); assert.equal(report.assessmentResult, false);
  assert.equal(report.observations[0].result, 'independent');
  const text = JSON.stringify(report); assert.ok(!text.includes('secret')); assert.ok(!text.includes('private'));
});
test('expected access locks and task failures remain distinct in summary', () => {
  assert.deepEqual(pilotSummary({ route:{result:'independent'}, lesson:{result:'help'}, practice:{result:'blocked'}, 'soc-route':{result:'locked'} }), {recorded:4,total:9,blockers:1,locks:1});
  assert.equal(pilotReport({}, 'unexpected').language, 'ar');
  assert.ok(pilotTasks.every(task => !task.href.includes('start') && !task.href.includes('checkout')));
  for (const task of pilotTasks) assert.ok(existsSync(new URL(`../${task.href.split(/[?#]/)[0]}`, import.meta.url)), task.id);
});
