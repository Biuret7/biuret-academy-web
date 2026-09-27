import { createHash } from 'node:crypto';

const DATABASE_ID = '6aa56477002e28054068';
const CREDENTIAL_TABLE = '6ab93416002801b57b3f';
const AUDIT_TABLE = '6ab93e390011ce106893';
const CREDENTIAL_ID = /^c_[a-f0-9]{32}$/;

export function isAcademyAdmin(account) {
  const ids = (process.env.ACADEMY_ADMIN_USER_IDS || '').split(',').map((id) => id.trim()).filter(Boolean);
  return Boolean(account?.$id && ids.includes(account.$id));
}

export function credentialAdminService({ base, request }) {
  const credentials = `${base}/tablesdb/${DATABASE_ID}/tables/${CREDENTIAL_TABLE}/rows`;
  const audit = `${base}/tablesdb/${DATABASE_ID}/tables/${AUDIT_TABLE}/rows`;
  async function lookup(id) {
    if (!CREDENTIAL_ID.test(id || '')) return { code: 400, data: { error: 'Invalid credential ID' } };
    const result = await request(`${credentials}/${id}`);
    if (result.status === 404) return { code: 404, data: { error: 'Credential not found' } };
    if (result.status !== 200) throw new Error('Credential lookup failed');
    const payload = JSON.parse(result.data.payload);
    if (payload.pathId !== 'foundations' || payload.version !== 'foundations-v1') throw new Error('Credential data invalid');
    return { code: 200, data: { id, holderName: payload.holderName, issuedAt: payload.issuedAt, status: payload.status, revokedAt: payload.revokedAt || null, shared: result.data.$permissions?.includes('read("any")') || false }, row: result.data, payload };
  }

  async function revoke(id, actorId, reason) {
    if (typeof reason !== 'string' || reason.trim().length < 12 || reason.trim().length > 500) return { code: 400, data: { error: 'Provide a reason of 12–500 characters' } };
    const found = await lookup(id);
    if (found.code !== 200) return found;
    if (found.payload.status === 'revoked') return { code: 200, data: { ...found.data, alreadyRevoked: true } };
    if (found.payload.status !== 'active') return { code: 409, data: { error: 'Credential status cannot be revoked' } };
    const auditId = `r_${createHash('sha256').update(`revoke:${id}`).digest('hex').slice(0, 32)}`;
    const requestedAt = new Date().toISOString();
    const auditPayload = JSON.stringify({ credentialId: id, actorId, action: 'revoke_requested', reason: reason.trim(), requestedAt });
    const recorded = await request(audit, { method: 'POST', body: JSON.stringify({ rowId: auditId, data: { payload: auditPayload }, permissions: [] }) });
    if (![201, 409].includes(recorded.status)) throw new Error('Revocation audit write failed');
    let event = recorded.data;
    if (recorded.status === 409) {
      const existing = await request(`${audit}/${auditId}`);
      if (existing.status !== 200) throw new Error('Revocation audit lookup failed');
      event = existing.data;
    }
    const previous = JSON.parse(event.payload);
    if (previous.credentialId !== id || previous.action !== 'revoke_requested') throw new Error('Revocation audit mismatch');
    const payload = JSON.stringify({ ...found.payload, status: 'revoked', revokedAt: previous.requestedAt });
    const updated = await request(`${credentials}/${id}`, { method: 'PATCH', body: JSON.stringify({ data: { payload }, permissions: found.row.$permissions || [] }) });
    if (updated.status !== 200) throw new Error('Credential revocation failed');
    return { code: 200, data: { ...found.data, status: 'revoked', revokedAt: previous.requestedAt, alreadyRevoked: false } };
  }

  return { lookup, revoke };
}
