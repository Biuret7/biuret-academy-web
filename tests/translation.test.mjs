import test from 'node:test';
import assert from 'node:assert/strict';
import { tracks, challenges } from '../content.js';
import { englishTracks, englishChallenges } from '../content-en.js';

test('every path and mission has complete English learning copy', () => {
  for (const track of tracks) {
    for (const field of ['name', 'summary', 'level']) assert.ok(englishTracks[track.id]?.[field], `${track.id}.${field}`);
  }
  for (const challenge of challenges) {
    const copy = englishChallenges[challenge.id];
    for (const field of ['title', 'subtitle', 'difficulty', 'scenario', 'artifactLabel', 'question', 'hint', 'explanation', 'takeaway']) {
      assert.ok(copy?.[field], `${challenge.id}.${field}`);
    }
    if (challenge.kind === 'choice') assert.equal(copy.options.length, challenge.options.length, challenge.id);
    else assert.ok(copy.placeholder, `${challenge.id}.placeholder`);
  }
});
