import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../functions/academy-progress/src/main.js';

test('public function execution never grants unauthenticated learning or billing access', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Unauthenticated request reached storage'); };
  try {
    for (const action of ['membershipState', 'completeLesson', 'libraryCourse', 'billingCheckout', 'billingPortal', 'adminRevoke']) {
      const result = await handler({ req: { headers: { 'x-appwrite-key': 'test-key' }, bodyJson: { action } },
        res: { json: (body, status = 200) => ({ body, status }) }, error: () => {} });
      assert.equal(result.status, 401);
      assert.equal(result.body.error, 'Sign in required');
    }
  } finally { globalThis.fetch = originalFetch; }
});

test('public handler rejects forged webhook signatures before touching storage or Paddle', async () => {
  const values = { ACADEMY_BILLING_ENABLED: 'sandbox', ACADEMY_BILLING_TABLE_ID: 'test-table',
    ACADEMY_PADDLE_WEBHOOK_SECRET: 'test-webhook-secret', ACADEMY_PADDLE_API_KEY: 'pdl_sdbx_test',
    ACADEMY_PADDLE_CLIENT_TOKEN: 'test_public', ACADEMY_PADDLE_PLUS_PRICE: `pri_${'a'.repeat(26)}`,
    ACADEMY_PADDLE_PRO_PRICE: `pri_${'b'.repeat(26)}` };
  const prior = Object.fromEntries(Object.keys(values).map(name => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  Object.assign(process.env, values);
  globalThis.fetch = () => { throw new Error('Forged webhook reached external services'); };
  try {
    const result = await handler({ req: { headers: { 'x-appwrite-key': 'test-key', 'paddle-signature': 'ts=0;h1=invalid' }, bodyText: '{}' },
      res: { json: (body, status = 200) => ({ body, status }) }, error: () => {} });
    assert.equal(result.status, 401);
    assert.equal(result.body.error, 'Invalid webhook signature');
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of Object.entries(prior)) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});
