import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { sandboxBillingConfig, sandboxBillingService, verifyPaddleSignature } from '../functions/academy-progress/src/billing.js';

const suffix = 'a'.repeat(26);
const now = new Date('2026-10-04T10:00:00Z');
const config = { enabled: true, table: 'billing', key: 'pdl_sdbx_test', token: 'test_public', secret: 'server-secret', prices: { plus: `pri_${suffix}`, pro: `pri_${'b'.repeat(26)}` } };
function fixture() {
  const rows = new Map(); let transactions = 0; let apiAvailable = true; let currentIntent;
  const sub = { id: `sub_${suffix}`, customer_id: `ctm_${suffix}`, collection_mode: 'automatic', currency_code: 'USD', status: 'active', items: [{ quantity: 1, price: { id: config.prices.plus } }], billing_cycle: { interval: 'month', frequency: 1 }, current_billing_period: { ends_at: '2026-11-04T10:00:00Z' }, updated_at: now.toISOString() };
  const request = async (url, options = {}) => {
    const rowId = url.split('/rows/')[1];
    if (options.method === 'POST') {
      const input = JSON.parse(options.body);
      assert.deepEqual(input.permissions, []);
      if (rows.has(input.rowId)) return { status: 409, data: {} };
      const row = { $id: input.rowId, ...input.data }; rows.set(input.rowId, row);
      if (row.kind === 'intent') currentIntent = JSON.parse(row.payload);
      return { status: 201, data: row };
    }
    if (options.method === 'PATCH') {
      Object.assign(rows.get(rowId), JSON.parse(options.body).data);
      if (rows.get(rowId).kind === 'intent') currentIntent = JSON.parse(rows.get(rowId).payload);
      return { status: 200, data: rows.get(rowId) };
    }
    if (rowId) return { status: rows.has(rowId) ? 200 : 404, data: rows.get(rowId) || {} };
    const parsed = new URL(url);
    const qs = parsed.searchParams.getAll('queries[]').map(JSON.parse);
    const userId = qs.find(q => q.attribute === 'userId').values[0];
    return { status: 200, data: { rows: [...rows.values()].filter(row => row.userId === userId && row.kind === 'subscription').sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 1) } };
  };
  const paddleRequest = async (path, options = {}) => {
    if (!apiAvailable) return { status: 500, data: {} };
    if (path === '/transactions') {
      const input = JSON.parse(options.body); transactions++;
      assert.equal(input.items[0].quantity, 1); sub.custom_data = input.custom_data;
      return { status: 201, data: { data: { id: `txn_${suffix}` } } };
    }
    if (path.includes('portal-sessions')) return { status: 201, data: { data: { urls: { general: { overview: 'https://sandbox-customer-portal.paddle.com/test' } } } } };
    return { status: 200, data: { data: structuredClone(sub) } };
  };
  const service = sandboxBillingService({ base: 'https://test/v1', request, paddleRequest, config, now: () => now });
  const account = { $id: 'adam', emailVerification: true };
  const event = (eventType = 'subscription.created', key = suffix) => ({ event_id: `evt_${key}`, event_type: eventType, data: { ...sub, transaction_id: `txn_${suffix}` } });
  const notify = async value => {
    const raw = JSON.stringify(value); const timestamp = now.getTime() / 1000;
    const signature = `ts=${timestamp};h1=${createHmac('sha256', config.secret).update(`${timestamp}:${raw}`).digest('hex')}`;
    return service.webhook(raw, signature);
  };
  return { service, account, rows, sub, event, notify, count: () => transactions, stopApi: () => apiAvailable = false, intent: () => currentIntent };
}
test('sandbox cannot enable with live credentials or incomplete configuration', () => {
  assert.equal(sandboxBillingConfig({ ACADEMY_BILLING_ENABLED: 'live' }).enabled, false);
  assert.equal(sandboxBillingConfig({ ACADEMY_BILLING_ENABLED: 'sandbox' }).enabled, false);
});
test('webhooks reject tampering, expired timestamps and malformed signatures', () => {
  const raw = '{}'; const ts = now.getTime() / 1000;
  const signature = `ts=${ts};h1=${createHmac('sha256', config.secret).update(`${ts}:${raw}`).digest('hex')}`;
  assert.equal(verifyPaddleSignature(raw, signature, config.secret, now.getTime()), true);
  assert.equal(verifyPaddleSignature('{"plan":"pro"}', signature, config.secret, now.getTime()), false);
  assert.equal(verifyPaddleSignature(raw, signature, config.secret, now.getTime() + 301000), false);
  assert.equal(verifyPaddleSignature(raw, signature + `;ts=${ts}`, config.secret, now.getTime()), false);
});
test('non-admins cannot open Sandbox checkout or a customer portal', async () => {
  const f = fixture(); assert.equal((await f.service.state('other', false)).enabled, false);
  await assert.rejects(f.service.checkout(f.account, 'plus', false), { status: 403 });
  await assert.rejects(f.service.portal('other', false), { status: 403 });
  assert.equal(f.rows.size, 0);
});
test('checkout requires verified email and a server-known plan', async () => {
  const f = fixture();
  await assert.rejects(f.service.checkout({ ...f.account, emailVerification: false }, 'plus', true), { status: 403 });
  await assert.rejects(f.service.checkout(f.account, 'ultimate', true), { status: 400 });
});
test('checkout retries reuse the private server transaction and cannot switch its price', async () => {
  const f = fixture(); const first = await f.service.checkout(f.account, 'plus', true);
  assert.deepEqual(await f.service.checkout(f.account, 'plus', true), first);
  assert.equal(f.count(), 1);
  await assert.rejects(f.service.checkout(f.account, 'pro', true), { status: 409 });
});
test('uncertain transaction creation blocks a duplicate charge attempt', async () => {
  const f = fixture(); f.stopApi();
  await assert.rejects(f.service.checkout(f.account, 'plus', true));
  await assert.rejects(f.service.checkout(f.account, 'plus', true), { status: 409 });
});
test('subscription event is bound to the original checkout transaction, not client custom data alone', async () => {
  const f = fixture(); await f.service.checkout(f.account, 'plus', true);
  const wrong = f.event(); wrong.data.transaction_id = `txn_${'b'.repeat(26)}`;
  await assert.rejects(f.notify(wrong), { status: 400 });
  assert.equal([...f.rows.values()].filter(row => row.kind === 'subscription').length, 0);
});
test('duplicate webhook delivery is idempotent and billing ownership is isolated', async () => {
  const f = fixture(); await f.service.checkout(f.account, 'plus', true);
  await f.notify(f.event()); await f.notify(f.event());
  assert.equal([...f.rows.values()].filter(row => row.kind === 'subscription').length, 1);
  assert.equal((await f.service.state('adam', true)).subscription.plan, 'plus');
  assert.equal((await f.service.state('other', true)).subscription, null);
});
test('delayed active events cannot restore a canceled subscription', async () => {
  const f = fixture(); await f.service.checkout(f.account, 'plus', true); const old = f.event(); await f.notify(old);
  f.sub.status = 'canceled'; f.sub.updated_at = '2026-10-04T10:00:01Z';
  await f.notify(f.event('subscription.updated', 'b'.repeat(26)));
  await f.notify({ ...old, event_id: `evt_${'c'.repeat(26)}` });
  assert.equal((await f.service.state('adam', true)).subscription.status, 'canceled');
});
test('existing subscription routes to management, with renewal and scheduled cancellation visible', async () => {
  const f = fixture(); await f.service.checkout(f.account, 'plus', true); await f.notify(f.event());
  f.sub.scheduled_change = { action: 'cancel', effective_at: f.sub.current_billing_period.ends_at };
  assert.equal((await f.service.state('adam', true)).subscription.cancelAt, f.sub.current_billing_period.ends_at);
  await assert.rejects(f.service.checkout(f.account, 'pro', true), { status: 409 });
  assert.equal((await f.service.portal('adam', true)).url, 'https://sandbox-customer-portal.paddle.com/test');
});
test('provider failures do not return a stale active billing status', async () => {
  const f = fixture(); await f.service.checkout(f.account, 'plus', true); await f.notify(f.event()); f.stopApi();
  await assert.rejects(f.service.state('adam', true));
});
test('webhooks reject a different price, quantity, currency or billing cycle', async () => {
  for (const change of [s => s.items[0].quantity = 2, s => s.currency_code = 'EUR', s => s.billing_cycle.frequency = 12, s => s.items[0].price.id = config.prices.pro]) {
    const f = fixture(); await f.service.checkout(f.account, 'plus', true); change(f.sub);
    await assert.rejects(f.notify(f.event()), { status: 400 });
  }
});
