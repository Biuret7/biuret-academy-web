import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const DB = '6aa56477002e28054068';
const id = (prefix, value) => `${prefix}_${createHash('sha256').update(value).digest('hex').slice(0, 32)}`;
const paddleId = (prefix, value) => typeof value === 'string' && new RegExp(`^${prefix}_[a-z0-9]{26}$`).test(value);
const fail = (message, code = 503) => Object.assign(new Error(message), { status: code });
export function verifyPaddleSignature(raw, signature, secret, now = Date.now()) {
  if (!secret || typeof raw !== 'string' || typeof signature !== 'string') return false;
  const parts = signature.split(';').map(part => part.trim().split('='));
  const timestamps = parts.filter(([key]) => key === 'ts').map(([, value]) => value);
  const signatures = parts.filter(([key]) => key === 'h1').map(([, value]) => value);
  if (timestamps.length !== 1 || !/^\d+$/.test(timestamps[0]) || Math.abs(now / 1000 - Number(timestamps[0])) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${timestamps[0]}:${raw}`).digest();
  return signatures.some(value => /^[a-f0-9]{64}$/i.test(value || '') && timingSafeEqual(expected, Buffer.from(value, 'hex')));
}

export function sandboxBillingConfig(env = process.env) {
  // Live billing is deliberately not enabled by this release.
  const prices = { plus: env.ACADEMY_PADDLE_PLUS_PRICE, pro: env.ACADEMY_PADDLE_PRO_PRICE };
  const checks = { billingMode: env.ACADEMY_BILLING_ENABLED === 'sandbox', table: Boolean(env.ACADEMY_BILLING_TABLE_ID), webhookSecret: Boolean(env.ACADEMY_PADDLE_WEBHOOK_SECRET), sandboxApiKey: Boolean(env.ACADEMY_PADDLE_API_KEY?.includes('_sdbx')), sandboxClientToken: Boolean(env.ACADEMY_PADDLE_CLIENT_TOKEN?.startsWith('test_')), plusPrice: paddleId('pri', prices.plus), proPrice: paddleId('pri', prices.pro), distinctPrices: prices.plus !== prices.pro };
  return {
    missing: Object.entries(checks).filter(([, valid]) => !valid).map(([name]) => name),
    table: env.ACADEMY_BILLING_TABLE_ID || '', key: env.ACADEMY_PADDLE_API_KEY || '',
    secret: env.ACADEMY_PADDLE_WEBHOOK_SECRET || '', token: env.ACADEMY_PADDLE_CLIENT_TOKEN || '', prices,
    enabled: env.ACADEMY_BILLING_ENABLED === 'sandbox' && Boolean(env.ACADEMY_BILLING_TABLE_ID && env.ACADEMY_PADDLE_WEBHOOK_SECRET &&
      env.ACADEMY_PADDLE_API_KEY?.includes('_sdbx') && env.ACADEMY_PADDLE_CLIENT_TOKEN?.startsWith('test_') &&
      paddleId('pri', prices.plus) && paddleId('pri', prices.pro) && prices.plus !== prices.pro),
  };
}

export function sandboxBillingService({ base, request, paddleRequest, config = sandboxBillingConfig(), now = () => new Date() }) {
  const rows = `${base}/tablesdb/${DB}/tables/${config.table}/rows`;
  const ready = () => { if (!config.enabled) throw fail('Sandbox billing is not configured'); };
  const onlyAdmin = admin => { ready(); if (!admin) throw fail('Sandbox checkout is restricted to the administrator', 403); };
  const read = async rowId => {
    const result = await request(`${rows}/${rowId}`);
    if (result.status === 404) return null;
    if (result.status !== 200) throw fail('Billing record unavailable');
    return result.data;
  };
  const latest = async userId => {
    const queries = [JSON.stringify({ method: 'equal', attribute: 'userId', values: [userId] }), JSON.stringify({ method: 'equal', attribute: 'kind', values: ['subscription'] }), JSON.stringify({ method: 'orderDesc', attribute: 'occurredAt' }), JSON.stringify({ method: 'limit', values: [1] })];
    const result = await request(`${rows}?${queries.map(q => `queries[]=${encodeURIComponent(q)}`).join('&')}`);
    if (result.status !== 200) throw fail('Billing history unavailable');
    const row = result.data.rows?.[0];
    if (!row) return null;
    const payload = JSON.parse(row.payload);
    if (row.userId !== userId || payload.userId !== userId || !paddleId('sub', payload.subscriptionId)) throw fail('Billing ownership mismatch');
    return payload;
  };
  const api = async (path, options = {}) => {
    const result = await paddleRequest(path, options);
    if (result.status < 200 || result.status >= 300 || !result.data?.data) throw fail('Payment provider unavailable');
    return result.data.data;
  };
  const validateSubscription = (subscription, intent) => {
    const item = subscription.items?.[0];
    if (!paddleId('sub', subscription.id) || !paddleId('ctm', subscription.customer_id) ||
      subscription.collection_mode !== 'automatic' || subscription.currency_code !== 'USD' ||
      !['active', 'trialing', 'past_due', 'paused', 'canceled'].includes(subscription.status) ||
      subscription.items?.length !== 1 || item.quantity !== 1 || item.price?.id !== intent.priceId ||
      subscription.billing_cycle?.interval !== 'month' || subscription.billing_cycle?.frequency !== 1 ||
      subscription.custom_data?.academy_intent_id !== intent.id) throw fail('Subscription does not match its server checkout intent', 400);
    const end = subscription.current_billing_period?.ends_at || subscription.canceled_at || subscription.updated_at;
    if (!Number.isFinite(Date.parse(end))) throw fail('Invalid subscription period', 400);
    return { environment: 'sandbox', userId: intent.userId, subscriptionId: subscription.id, customerId: subscription.customer_id,
      plan: intent.plan, status: subscription.status, currentPeriodEnd: end,
      cancelAt: subscription.scheduled_change?.action === 'cancel' ? subscription.scheduled_change.effective_at : null };
  };
  const current = async userId => {
    const saved = await latest(userId);
    if (!saved) return null;
    const subscription = await api(`/subscriptions/${saved.subscriptionId}`);
    const intentId = subscription.custom_data?.academy_intent_id;
    if (!/^i_[a-f0-9]{32}$/.test(intentId || '')) throw fail('Invalid subscription checkout');
    const row = await read(intentId);
    if (!row) throw fail('Subscription checkout unavailable');
    const intent = JSON.parse(row.payload);
    if (intent.userId !== userId || row.kind !== 'intent') throw fail('Subscription ownership mismatch', 403);
    return validateSubscription(subscription, intent);
  };
  return {
    async state(userId, admin) {
      if (!admin) return { environment: 'sandbox', enabled: false, subscription: null };
      if (!config.enabled) return { environment: 'sandbox', enabled: false, subscription: null, setupMissing: config.missing || [] };
      return { environment: 'sandbox', enabled: true, subscription: await current(userId) };
    },
    async checkout(account, plan, admin) {
      onlyAdmin(admin);
      if (!['plus', 'pro'].includes(plan)) throw fail('Unknown membership plan', 400);
      if (!account?.$id || !account.emailVerification) throw fail('Verify your account email before testing checkout', 403);
      const existing = await current(account.$id);
      if (existing && existing.status !== 'canceled') throw fail('Manage your existing test subscription instead of purchasing another', 409);
      // A retry reuses today's intent. An uncertain provider response stays locked
      // for reconciliation instead of creating a second potentially charged transaction.
      const intentId = id('i', `${account.$id}:${now().toISOString().slice(0, 10)}`);
      let row = await read(intentId);
      if (!row) {
        const intent = { id: intentId, userId: account.$id, plan, priceId: config.prices[plan], nonce: randomUUID(), environment: 'sandbox' };
        const result = await request(rows, { method: 'POST', body: JSON.stringify({ rowId: intentId, data: { userId: account.$id, kind: 'intent', occurredAt: now().toISOString(), payload: JSON.stringify(intent) }, permissions: [] }) });
        if (result.status === 409) row = await read(intentId);
        else if (result.status === 201) {
          const transaction = await api('/transactions', { method: 'POST', body: JSON.stringify({ items: [{ price_id: intent.priceId, quantity: 1 }], collection_mode: 'automatic', currency_code: 'USD', custom_data: { academy_intent_id: intentId } }) });
          if (!paddleId('txn', transaction.id)) throw fail('Invalid checkout transaction');
          intent.transactionId = transaction.id;
          const updated = await request(`${rows}/${intentId}`, { method: 'PATCH', body: JSON.stringify({ data: { payload: JSON.stringify(intent) } }) });
          if (updated.status !== 200) throw fail('Checkout requires reconciliation');
          row = updated.data;
        } else throw fail('Could not create checkout intent');
      }
      const intent = JSON.parse(row.payload);
      if (intent.userId !== account.$id || intent.plan !== plan) throw fail('A different test checkout already exists today', 409);
      if (!paddleId('txn', intent.transactionId)) throw fail('A previous checkout is awaiting reconciliation', 409);
      return { environment: 'sandbox', transactionId: intent.transactionId, clientToken: config.token };
    },
    async portal(userId, admin) {
      onlyAdmin(admin);
      const subscription = await current(userId);
      if (!subscription) throw fail('No test subscription exists', 404);
      const portal = await api(`/customers/${subscription.customerId}/portal-sessions`, { method: 'POST', body: JSON.stringify({ subscription_ids: [subscription.subscriptionId] }) });
      const url = portal.urls?.general?.overview;
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || parsed.hostname !== 'sandbox-customer-portal.paddle.com') throw fail('Unexpected customer portal');
      return { url };
    },
    async webhook(raw, signature) {
      ready();
      if (!verifyPaddleSignature(raw, signature, config.secret, now().getTime())) throw fail('Invalid webhook signature', 401);
      const event = JSON.parse(raw);
      if (!event.event_type?.startsWith('subscription.')) return { ignored: true };
      if (!paddleId('evt', event.event_id) || !paddleId('sub', event.data?.id)) throw fail('Invalid subscription event', 400);
      const intentId = event.data.custom_data?.academy_intent_id;
      if (!/^i_[a-f0-9]{32}$/.test(intentId || '')) return { ignored: true };
      const intentRow = await read(intentId);
      if (!intentRow || intentRow.kind !== 'intent') throw fail('Unknown checkout intent', 400);
      const intent = JSON.parse(intentRow.payload);
      if (intent.environment !== 'sandbox' || config.prices[intent.plan] !== intent.priceId || intentRow.userId !== intent.userId) throw fail('Invalid checkout intent', 400);
      const bindingId = id('b', intentId);
      let binding = await read(bindingId);
      if (!binding) {
        if (event.event_type !== 'subscription.created') throw fail('Waiting for subscription creation notification');
        if (event.data.transaction_id !== intent.transactionId) throw fail('Subscription transaction does not match checkout', 400);
        const result = await request(rows, { method: 'POST', body: JSON.stringify({ rowId: bindingId, data: { userId: intent.userId, kind: 'binding', occurredAt: now().toISOString(), payload: JSON.stringify({ subscriptionId: event.data.id, intentId }) }, permissions: [] }) });
        if (result.status === 409) binding = await read(bindingId);
        else if (result.status === 201) binding = result.data;
        else throw fail('Could not bind subscription');
      }
      if (JSON.parse(binding.payload).subscriptionId !== event.data.id || binding.userId !== intent.userId) throw fail('Subscription binding mismatch', 400);
      // Read the authoritative snapshot: duplicate, delayed and out-of-order
      // notifications cannot restore an old subscription status.
      const subscription = await api(`/subscriptions/${event.data.id}`);
      const payload = validateSubscription(subscription, intent);
      const occurredAt = subscription.updated_at;
      if (!Number.isFinite(Date.parse(occurredAt))) throw fail('Invalid provider timestamp', 400);
      const result = await request(rows, { method: 'POST', body: JSON.stringify({ rowId: id('e', event.event_id), data: { userId: intent.userId, kind: 'subscription', occurredAt, payload: JSON.stringify(payload) }, permissions: [] }) });
      if (![201, 409].includes(result.status)) throw fail('Could not persist billing event');
      return { accepted: true };
    },
  };
}
