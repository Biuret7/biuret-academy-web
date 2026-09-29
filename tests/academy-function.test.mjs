import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { awardId, levelForXp } from '../functions/academy-progress/src/main.js';
import { membershipRowId } from '../functions/academy-progress/src/membership.js';

function response(status, data) {
  return { status, json: async () => data };
}

test('levels rise with cumulative verified lesson XP', () => {
  assert.deepEqual(levelForXp(0), { level: 1, xpIntoLevel: 0, xpToNextLevel: 100 });
  assert.deepEqual(levelForXp(100), { level: 2, xpIntoLevel: 0, xpToNextLevel: 150 });
  assert.deepEqual(levelForXp(300), { level: 3, xpIntoLevel: 50, xpToNextLevel: 200 });
  assert.equal(awardId('user-a', 'url-parts'), awardId('user-a', 'url-parts'));
  assert.notEqual(awardId('user-a', 'url-parts'), awardId('user-b', 'url-parts'));
});

test('membership state follows the verified account, never a submitted user ID', async () => {
  const priorFetch = globalThis.fetch;
  let accountId = 'learner-a';
  const proRow = { payload: JSON.stringify({ version: 1, userId: 'learner-a', provider: 'paddle', subscriptionId: 'sub_example', status: 'active', currentPeriodEnd: '2099-01-01T00:00:00Z' }) };
  globalThis.fetch = async (url, options = {}) => {
    if (new URL(url).pathname === '/v1/account') return options.headers['X-Appwrite-JWT'] === 'valid' ? response(200, { $id: accountId }) : response(401, {});
    const rowId = new URL(url).pathname.split('/').at(-1);
    return rowId === membershipRowId('learner-a') ? response(200, proRow) : response(404, {});
  };
  const invoke = (jwt) => handler({
    req: { headers: { 'x-appwrite-user-jwt': jwt, 'x-appwrite-key': 'test-key' }, bodyJson: { action: 'membershipState', userId: 'learner-a' } },
    res: { json: (body, status = 200) => ({ body, status }) }, error: () => {},
  });
  try {
    assert.equal((await invoke('valid')).body.plan, 'pro');
    accountId = 'learner-b';
    assert.equal((await invoke('valid')).body.plan, 'free');
    assert.equal((await invoke('invalid')).status, 401);
  } finally { globalThis.fetch = priorFetch; }
});

test('Free earns XP without coins; Plus earns coins once; users remain isolated', async () => {
  const priorFetch = globalThis.fetch;
  const rows = new Map();
  let userId = 'learner-a';
  rows.set(membershipRowId('learner-plus'), { payload: JSON.stringify({ version: 1, userId: 'learner-plus', provider: 'paddle', subscriptionId: 'sub_plus', status: 'active', currentPeriodEnd: '2099-01-01T00:00:00Z', plan: 'plus' }) });
  rows.set(membershipRowId('learner-pro'), { payload: JSON.stringify({ version: 1, userId: 'learner-pro', provider: 'paddle', subscriptionId: 'sub_pro', status: 'active', currentPeriodEnd: '2099-01-01T00:00:00Z', plan: 'pro' }) });
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    if (path === '/v1/account') return response(200, { $id: userId, name: 'Test Learner' });
    const rowId = path.split('/').at(-1);
    if (options.method === 'POST') {
      const input = JSON.parse(options.body);
      if (rows.has(input.rowId)) return response(409, {});
      rows.set(input.rowId, { ...input.data, $createdAt: '2026-09-26T00:00:00.000Z' });
      return response(201, rows.get(input.rowId));
    }
    return rows.has(rowId) ? response(200, rows.get(rowId)) : response(404, {});
  };
  const invoke = (bodyJson, jwt = 'valid') => handler({
    req: { headers: { 'x-appwrite-user-jwt': jwt, 'x-appwrite-key': 'test-key' }, bodyJson },
    res: { json: (body, status = 200) => ({ body, status }) },
    error: () => {},
  });
  try {
    assert.equal((await invoke({ action: 'completeLesson', lessonId: 'url-parts', answerIndex: 0 })).status, 422);
    assert.equal((await invoke({ action: 'completeLesson', lessonId: 'url-traps', answerIndex: 1 })).status, 409);
    const first = await invoke({ action: 'completeLesson', lessonId: 'url-parts', answerIndex: 1 });
    assert.equal(first.status, 200);
    assert.deepEqual([first.body.xp, first.body.coins, first.body.level, first.body.awarded, first.body.coinEarning], [100, 0, 2, true, false]);
    assert.deepEqual(first.body.transactions, []);
    assert.equal(rows.get(awardId('learner-a', 'url-parts')).coins, 0);
    const repeat = await invoke({ action: 'completeLesson', lessonId: 'url-parts', answerIndex: 1 });
    assert.deepEqual([repeat.body.xp, repeat.body.coins, repeat.body.awarded], [100, 0, false]);
    assert.equal((await invoke({ action: 'completeLesson', lessonId: 'identity-sessions', answerIndex: 1 })).status, 409);
    assert.equal((await invoke({ action: 'completeLesson', lessonId: 'evidence-integrity', answerIndex: 0 })).status, 409);
    const identity = await invoke({ action: 'completeLesson', lessonId: 'identity-passwords', answerIndex: 1 });
    assert.deepEqual([identity.status, identity.body.xp, identity.body.coins], [200, 200, 0]);
    assert.equal((await invoke({ action: 'completeLesson', lessonId: 'evidence-logs', answerIndex: 0 })).status, 422);
    userId = 'learner-plus';
    const paid = await invoke({ action: 'completeLesson', lessonId: 'url-parts', answerIndex: 1 });
    assert.deepEqual([paid.status, paid.body.xp, paid.body.coins, paid.body.coinEarning, paid.body.plan], [200, 100, 10, true, 'plus']);
    assert.deepEqual(paid.body.transactions.map(({ kind, reference, delta }) => [kind, reference, delta]), [['lesson-earned', 'url-parts', 10]]);
    userId = 'learner-pro';
    const pro = await invoke({ action: 'completeLesson', lessonId: 'url-parts', answerIndex: 1 });
    assert.deepEqual([pro.status, pro.body.xp, pro.body.coins, pro.body.coinEarning, pro.body.plan], [200, 100, 10, true, 'pro']);
    userId = 'learner-b';
    const other = await invoke({ action: 'state' });
    assert.deepEqual([other.body.xp, other.body.coins, other.body.awards.length], [0, 0, 0]);
    assert.equal(rows.size, 8); // Two memberships, four immutable awards, two paid ledger events.
  } finally { globalThis.fetch = priorFetch; }
});
