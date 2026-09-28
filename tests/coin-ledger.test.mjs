import test from 'node:test';
import assert from 'node:assert/strict';
import { coinLedgerService, lessonCoinEventId } from '../functions/academy-progress/src/coins.js';

test('prior lesson awards backfill once and concurrent reads cannot duplicate coins', async () => {
  const rows = new Map();
  const request = async (url, options = {}) => {
    const id = url.split('/').at(-1);
    if (options.method === 'POST') {
      const input = JSON.parse(options.body);
      if (rows.has(input.rowId)) return { status: 409, data: {} };
      const row = { ...input.data, $createdAt: '2026-09-27T00:00:00.000Z' };
      rows.set(input.rowId, row);
      return { status: 201, data: row };
    }
    return rows.has(id) ? { status: 200, data: rows.get(id) } : { status: 404, data: {} };
  };
  const service = coinLedgerService({ base: 'https://example.test/v1', request });
  const awards = [{ lessonId: 'url-parts', coins: 10, completedAt: '2026-09-26T00:00:00.000Z' }];
  const states = await Promise.all([service.state('learner-a', awards, { canEarn: true }), service.state('learner-a', awards, { canEarn: true })]);
  assert.deepEqual(states.map(({ coins }) => coins), [10, 10]);
  assert.equal(rows.size, 1);
  assert.equal(states[0].transactions[0].id, lessonCoinEventId('learner-a', 'url-parts'));
  assert.equal(states[0].transactions[0].earnedAt, awards[0].completedAt);
  assert.deepEqual(await service.state('learner-b', []), { coins: 0, transactions: [] });

  rows.set(lessonCoinEventId('learner-b', 'url-parts'), rows.get(lessonCoinEventId('learner-a', 'url-parts')));
  await assert.rejects(service.state('learner-b', awards), /Coin ledger event mismatch/);
});

test('Free cannot mint a lesson event, while previously earned coins remain visible', async () => {
  const rows = new Map();
  let writes = 0;
  const service = coinLedgerService({ base: 'https://example.test/v1', request: async (url, options = {}) => {
    const id = url.split('/').at(-1);
    if (options.method === 'POST') { writes++; throw new Error('Free must not write'); }
    return rows.has(id) ? { status: 200, data: rows.get(id) } : { status: 404, data: {} };
  } });
  const awards = [{ lessonId: 'url-parts', coins: 10, completedAt: '2026-09-26T00:00:00.000Z' }];
  assert.deepEqual(await service.state('learner-a', awards), { coins: 0, transactions: [] });
  rows.set(lessonCoinEventId('learner-a', 'url-parts'), {
    payload: JSON.stringify({ version: 1, userId: 'learner-a', kind: 'lesson-earned', reference: 'url-parts', delta: 10, awardedAt: awards[0].completedAt }),
  });
  assert.equal((await service.state('learner-a', awards)).coins, 10);
  assert.equal(writes, 0);
});
