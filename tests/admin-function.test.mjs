import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../functions/academy-progress/src/main.js';

const DATABASE_ID = '6aa56477002e28054068';
const CREDENTIAL_TABLE = '6ab93416002801b57b3f';
const AUDIT_TABLE = '6ab93e390011ce106893';

test('only configured admin can inspect and revoke, with a private audit event', async () => {
  const oldFetch = globalThis.fetch;
  const oldAdmins = process.env.ACADEMY_ADMIN_USER_IDS;
  process.env.ACADEMY_ADMIN_USER_IDS = 'admin-user';
  let account = 'ordinary-user';
  const id = `c_${'a'.repeat(32)}`;
  const rows = new Map([[`${CREDENTIAL_TABLE}:${id}`, { $id: id, payload: JSON.stringify({ pathId: 'foundations', version: 'foundations-v1', holderName: 'Learner', issuedAt: '2026-09-27T00:00:00.000Z', status: 'active' }), $permissions: ['read("any")'] }]]);
  const response = (status, data = {}) => ({ status, json: async () => data });
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    if (path === '/v1/account') return response(200, { $id: account });
    const match = path.match(new RegExp(`/tablesdb/${DATABASE_ID}/tables/([^/]+)/rows(?:/([^/]+))?$`));
    if (!match) throw new Error('Unexpected API request');
    const [, table, rowId] = match;
    if (options.method === 'POST') {
      const input = JSON.parse(options.body);
      if (rows.has(`${table}:${input.rowId}`)) return response(409);
      const row = { ...input.data, $id: input.rowId, $permissions: input.permissions };
      rows.set(`${table}:${input.rowId}`, row);
      return response(201, row);
    }
    if (options.method === 'PATCH') {
      const row = rows.get(`${table}:${rowId}`);
      if (!row) return response(404);
      const input = JSON.parse(options.body);
      Object.assign(row, input.data, { $permissions: input.permissions });
      return response(200, row);
    }
    return rows.has(`${table}:${rowId}`) ? response(200, rows.get(`${table}:${rowId}`)) : response(404);
  };
  const invoke = (bodyJson) => handler({ req: { headers: { 'x-appwrite-user-jwt': 'valid', 'x-appwrite-key': 'test-key' }, bodyJson }, res: { json: (body, status = 200) => ({ body, status }) }, error: () => {} });
  try {
    assert.equal((await invoke({ action: 'adminStatus' })).status, 403);
    assert.equal((await invoke({ action: 'adminCredential', credentialId: id })).status, 403);
    assert.equal((await invoke({ action: 'adminRevokeCredential', credentialId: id, reason: 'A documented integrity issue' })).status, 403);
    assert.equal(rows.size, 1);
    account = 'admin-user';
    assert.equal((await invoke({ action: 'adminStatus' })).body.admin, true);
    assert.equal((await invoke({ action: 'adminCredential', credentialId: id })).body.status, 'active');
    assert.equal((await invoke({ action: 'adminRevokeCredential', credentialId: id, reason: 'short' })).status, 400);
    const revoked = await invoke({ action: 'adminRevokeCredential', credentialId: id, reason: 'A documented integrity issue' });
    assert.equal(revoked.status, 200);
    assert.equal(revoked.body.status, 'revoked');
    assert.equal(JSON.parse(rows.get(`${CREDENTIAL_TABLE}:${id}`).payload).status, 'revoked');
    assert.equal(rows.get(`${CREDENTIAL_TABLE}:${id}`).payload.includes('integrity issue'), false);
    assert.equal(rows.get(`${CREDENTIAL_TABLE}:${id}`).$permissions[0], 'read("any")');
    const auditRows = [...rows.entries()].filter(([key]) => key.startsWith(`${AUDIT_TABLE}:`));
    assert.equal(auditRows.length, 1);
    assert.deepEqual(auditRows[0][1].$permissions, []);
    assert.equal(JSON.parse(auditRows[0][1].payload).actorId, 'admin-user');
    assert.equal((await invoke({ action: 'adminRevokeCredential', credentialId: id, reason: 'A documented integrity issue' })).body.alreadyRevoked, true);
    assert.equal(rows.size, 2);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldAdmins === undefined) delete process.env.ACADEMY_ADMIN_USER_IDS;
    else process.env.ACADEMY_ADMIN_USER_IDS = oldAdmins;
  }
});
