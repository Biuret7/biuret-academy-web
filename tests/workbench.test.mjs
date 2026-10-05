import test from 'node:test';
import assert from 'node:assert/strict';
import { evidenceRows, filterEvidence, checkFindings, practiceReport } from '../workbench-model.js';

test('evidence filters combine source and case-insensitive text without losing source rows', () => {
  assert.deepEqual(filterEvidence(evidenceRows, 's-17', 'identity').map(row => row.id), ['E4']);
  assert.deepEqual(filterEvidence(evidenceRows, 'S-17').map(row => row.id), ['E4', 'E5']);
  assert.equal(filterEvidence(evidenceRows, 'missing').length, 0);
  assert.equal(evidenceRows.length, 8);
});

test('practice rejects incorrect correlation, counts and unsupported compromise claims', () => {
  const valid = { selected: ['E1','E2','E3','E4','E5'], failures: '3', conclusion: 'investigate', next: 'preserve' };
  assert.deepEqual(checkFindings(valid), { correlation: true, count: true, conclusion: true, next: true });
  assert.equal(checkFindings({ ...valid, selected: [...valid.selected, 'E6'] }).correlation, false);
  assert.equal(checkFindings({ ...valid, selected: ['E1','E2','E3','E4'] }).correlation, false);
  assert.deepEqual(checkFindings({ selected: ['E6'], failures: '4', conclusion: 'compromised', next: 'delete' }), { correlation: false, count: false, conclusion: false, next: false });
  assert.equal(checkFindings({ ...valid, selected: [...valid.selected, 'E7', 'E8'] }).correlation, true);
});

test('feedback export is practice-only and excludes automatic account data and arbitrary fields', () => {
  const report = practiceReport({ selected: ['E4'], reasoning: 'Need approval context', friction: 'Need a field glossary', email: 'private', owner: 'private', password: 'private', clarity: 'partly' }, 'soc', 'ar');
  assert.equal(report.practiceOnly, true);
  assert.equal(report.feedback.friction, 'Need a field glossary');
  assert.equal(report.findings.reasoning, 'Need approval context');
  assert.doesNotMatch(JSON.stringify(report), /private|password|email|owner/);
});
