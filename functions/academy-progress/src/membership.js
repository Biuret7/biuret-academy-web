import { createHash } from 'node:crypto';

const DATABASE_ID = '6aa56477002e28054068';
const TABLE_ID = '6ab9848d000d14a9332f';
const KNOWN_STATUSES = new Set(['active', 'trialing', 'past_due', 'paused', 'canceled']);

export function membershipRowId(userId) {
  return `m_${createHash('sha256').update(userId).digest('hex').slice(0, 32)}`;
}

export function membershipFromRecord(record, userId, now = new Date()) {
  const free = { plan: 'free', status: 'free', currentPeriodEnd: null, access: { foundations: true, advancedLabs: false, coinEarning: false } };
  if (!record) return free;
  let payload;
  try { payload = JSON.parse(record.payload); }
  catch { throw new Error('Invalid membership record'); }
  if (payload.version !== 1 || payload.userId !== userId || payload.provider !== 'paddle' ||
      typeof payload.subscriptionId !== 'string' || !payload.subscriptionId.startsWith('sub_') ||
      !KNOWN_STATUSES.has(payload.status) || typeof payload.currentPeriodEnd !== 'string' ||
      (payload.plan !== undefined && !['plus', 'pro'].includes(payload.plan))) {
    throw new Error('Membership record mismatch');
  }
  const end = Date.parse(payload.currentPeriodEnd);
  if (!Number.isFinite(end)) throw new Error('Invalid membership period');
  const active = payload.status === 'active' && end > now.getTime();
  // Records created before Plus existed represented Pro; keep their access intact.
  const paidPlan = payload.plan || 'pro';
  return {
    plan: active ? paidPlan : 'free',
    status: payload.status,
    currentPeriodEnd: payload.currentPeriodEnd,
    access: { foundations: true, advancedLabs: active && paidPlan === 'pro', coinEarning: active },
  };
}

export function membershipService({ base, request, now = () => new Date() }) {
  return {
    async state(userId) {
      const url = `${base}/tablesdb/${DATABASE_ID}/tables/${TABLE_ID}/rows/${membershipRowId(userId)}`;
      const result = await request(url);
      if (result.status === 404) return membershipFromRecord(null, userId, now());
      if (result.status !== 200) throw new Error('Membership lookup failed');
      return membershipFromRecord(result.data, userId, now());
    },
  };
}
