import test from 'node:test';
import assert from 'node:assert/strict';
import { membershipFromRecord, membershipRowId, membershipService } from '../functions/academy-progress/src/membership.js';

const now = new Date('2026-09-28T12:00:00Z');
const record = (userId, status, currentPeriodEnd, plan) => ({
  payload: JSON.stringify({ version: 1, userId, provider: 'paddle', subscriptionId: 'sub_example', status, currentPeriodEnd, ...(plan ? { plan } : {}) }),
});

test('missing membership is free and scoped to its own deterministic row', async () => {
  let requested;
  const service = membershipService({
    base: 'https://example.test/v1', now: () => now,
    request: async (url) => { requested = url; return { status: 404 }; },
  });
  const state = await service.state('learner-a');
  assert.equal(state.plan, 'free');
  assert.deepEqual(state.access, { foundations: true, advancedLabs: false, coinEarning: false });
  assert.ok(requested.endsWith(`/rows/${membershipRowId('learner-a')}`));
  assert.notEqual(membershipRowId('learner-a'), membershipRowId('learner-b'));
});

test('only a current active server record grants Pro access', () => {
  const pro = membershipFromRecord(record('learner-a', 'active', '2026-10-28T00:00:00Z'), 'learner-a', now);
  assert.equal(pro.plan, 'pro'); // Legacy paid records remain Pro.
  assert.deepEqual(pro.access, { foundations: true, advancedLabs: true, coinEarning: true });
  const plus = membershipFromRecord(record('learner-a', 'active', '2026-10-28T00:00:00Z', 'plus'), 'learner-a', now);
  assert.equal(plus.plan, 'plus');
  assert.deepEqual(plus.access, { foundations: true, advancedLabs: false, coinEarning: true });
  for (const status of ['trialing', 'past_due', 'paused', 'canceled']) {
    assert.equal(membershipFromRecord(record('learner-a', status, '2026-10-28T00:00:00Z'), 'learner-a', now).plan, 'free');
  }
  assert.equal(membershipFromRecord(record('learner-a', 'active', '2026-09-27T00:00:00Z'), 'learner-a', now).plan, 'free');
});

test('another user or malformed record cannot grant access', () => {
  assert.throws(() => membershipFromRecord(record('learner-a', 'active', '2026-10-28T00:00:00Z'), 'learner-b', now));
  assert.throws(() => membershipFromRecord({ payload: '{' }, 'learner-a', now));
  assert.throws(() => membershipFromRecord(record('learner-a', 'active', 'not-a-date'), 'learner-a', now));
  assert.throws(() => membershipFromRecord(record('learner-a', 'active', '2026-10-28T00:00:00Z', 'enterprise'), 'learner-a', now));
});
