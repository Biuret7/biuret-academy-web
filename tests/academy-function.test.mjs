import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { awardId, levelForXp } from '../functions/academy-progress/src/main.js';

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

test('one verified lesson gives 100 XP and 10 coins once; users remain isolated', async () => {
  const priorFetch = globalThis.fetch;
  const rows = new Map();
  let userId = 'learner-a';
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    if (path === '/v1/account') return response(200, { $id: userId });
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
    assert.deepEqual([first.body.xp, first.body.coins, first.body.level, first.body.awarded], [100, 10, 2, true]);
    assert.deepEqual(first.body.transactions.map(({ kind, reference, delta }) => [kind, reference, delta]), [['lesson-earned', 'url-parts', 10]]);
    const repeat = await invoke({ action: 'completeLesson', lessonId: 'url-parts', answerIndex: 1 });
    assert.deepEqual([repeat.body.xp, repeat.body.coins, repeat.body.awarded], [100, 10, false]);
    assert.equal((await invoke({ action: 'completeLesson', lessonId: 'identity-sessions', answerIndex: 1 })).status, 409);
    assert.equal((await invoke({ action: 'completeLesson', lessonId: 'evidence-integrity', answerIndex: 0 })).status, 409);
    const identity = await invoke({ action: 'completeLesson', lessonId: 'identity-passwords', answerIndex: 1 });
    assert.deepEqual([identity.status, identity.body.xp, identity.body.coins], [200, 200, 20]);
    assert.equal((await invoke({ action: 'completeLesson', lessonId: 'evidence-logs', answerIndex: 0 })).status, 422);
    userId = 'learner-b';
    const other = await invoke({ action: 'state' });
    assert.deepEqual([other.body.xp, other.body.coins, other.body.awards.length], [0, 0, 0]);
    assert.equal(rows.size, 4); // Two immutable awards and two matching ledger events.
  } finally { globalThis.fetch = priorFetch; }
});
