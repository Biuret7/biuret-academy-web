import test from 'node:test';
import assert from 'node:assert/strict';
import { challenges } from '../content.js';
import { emptyProgress, assignDaily, dailyChallenge, completeChallenge, isUnlocked, totalXp, streak, mergeProgress, dayKey } from '../engine.js';

const saturday = new Date(2026, 8, 26, 11);

test('each track opens with its first challenge and unlocks the next on completion', () => {
  let state = emptyProgress();
  for (const track of ['foundations', 'web', 'forensics']) {
    const first = challenges.find((challenge) => challenge.track === track && challenge.order === 1);
    const second = challenges.find((challenge) => challenge.track === track && challenge.order === 2);
    assert.equal(isUnlocked(first, state), true);
    assert.equal(isUnlocked(second, state), false);
    const result = completeChallenge(state, first.id, { today: saturday });
    state = result.progress;
    assert.equal(result.firstCompletion, true);
    assert.equal(isUnlocked(second, state), true);
  }
});

test('daily assignment remains stable and awards its bonus once', () => {
  const state = assignDaily(emptyProgress(), saturday);
  const challenge = dailyChallenge(state, saturday);
  assert.equal(dailyChallenge(state, saturday).id, challenge.id);
  const first = completeChallenge(state, challenge.id, { today: saturday });
  assert.equal(first.awardedXp, challenge.xp + 30);
  const repeat = completeChallenge(first.progress, challenge.id, { today: saturday });
  assert.equal(repeat.awardedXp, 0);
  assert.equal(first.progress.dailyBonus[dayKey(saturday)], challenge.id);
  assert.equal(totalXp(repeat.progress), challenge.xp + 30);
});

test('merging local and cloud work preserves distinct completions and streak', () => {
  const friday = new Date(2026, 8, 25, 10);
  const local = completeChallenge(emptyProgress(), 'f-domain', { today: friday }).progress;
  const cloud = completeChallenge(emptyProgress(), 'w-method', { today: saturday }).progress;
  const merged = mergeProgress(local, cloud);
  assert.deepEqual(Object.keys(merged.completed).sort(), ['f-domain', 'w-method']);
  assert.equal(streak(merged, saturday), 2);
});

test('a completed challenge can become a daily replay after all starter missions', () => {
  let state = emptyProgress();
  for (const challenge of challenges) state = completeChallenge(state, challenge.id, { today: saturday }).progress;
  const sunday = new Date(2026, 8, 27, 11);
  state = assignDaily(state, sunday);
  const assigned = dailyChallenge(state, sunday);
  assert.ok(state.completed[assigned.id]);
  const replay = completeChallenge(state, assigned.id, { today: sunday });
  assert.equal(replay.firstCompletion, false);
  assert.equal(replay.awardedXp, 30);
  assert.equal(streak(replay.progress, sunday), 2);
  assert.equal(completeChallenge(replay.progress, assigned.id, { today: sunday }).awardedXp, 0);
});
