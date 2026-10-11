import { createHash, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ctfRewards, CTF_MAX_ATTEMPTS } from './ctf-policy.js';
import { ctfCatalog } from './ctf-catalog.js';

const DATABASE_ID = '6aa56477002e28054068';
// Private payload rows share the existing ledger, with separate deterministic IDs.
const TABLE_ID = '6ab94864000f11a04188';
const idFor = (kind, userId, reference) => `${kind}_${createHash('sha256').update(`${kind}:${userId}:${reference}`).digest('hex').slice(0, 32)}`;
export const ctfProofId = (userId, challengeId) => idFor('c', userId, challengeId);

function readBank() {
  const bank = JSON.parse(process.env.ACADEMY_CTF_BANK || readFileSync(new URL('../ctf-bank.private.json', import.meta.url), 'utf8'));
  if (!Array.isArray(bank) || !bank.length || new Set(bank.map(c => c.id)).size !== bank.length || bank.some(c =>
    !/^[a-z0-9-]{3,64}$/.test(c.id) || !ctfRewards[c.level] || !Number.isInteger(c.level) ||
    !/^[a-f0-9]{64}$/.test(c.digest) || !/^[a-f0-9]{64}$/.test(c.packageSha256) || typeof c.prefix !== 'string' ||
    !['ar', 'en'].every(lang => typeof c.title?.[lang] === 'string' && c.title[lang]))) throw new Error('CTF bank invalid');
  return bank;
}

export function ctfService({ base, request, now = () => new Date(), bank = ctfCatalog }) {
  const rows = `${base}/tablesdb/${DATABASE_ID}/tables/${TABLE_ID}/rows`;
  async function read(id) {
    const result = await request(`${rows}/${id}`);
    if (result.status === 404) return null;
    if (result.status !== 200) throw new Error('CTF record lookup failed');
    return result.data;
  }
  const create = (id, payload) => request(rows, { method: 'POST', body: JSON.stringify({ rowId: id, data: { payload: JSON.stringify(payload) }, permissions: [] }) });
  function proof(row, userId, c) {
    const p = JSON.parse(row.payload), reward = ctfRewards[c.level];
    if (p.version !== 1 || p.kind !== 'ctf-earned' || p.userId !== userId || p.challengeId !== c.id ||
      p.id !== ctfProofId(userId, c.id) || p.level !== c.level || p.packageSha256 !== c.packageSha256 ||
      p.xp !== reward.xp || p.points !== reward.points || ![0, reward.coins].includes(p.coins) ||
      !Number.isFinite(Date.parse(p.completedAt)) || typeof p.learnerName !== 'string') throw new Error('CTF record mismatch');
    return { id: p.id, challengeId: c.id, title: c.title, learnerName: p.learnerName, level: p.level,
      points: p.points, xp: p.xp, coins: p.coins, completedAt: p.completedAt, packageSha256: p.packageSha256,
      verification: 'server-flag-match' };
  }
  async function state(userId, coinEarning = false) {
    const completions = (await Promise.all(bank.map(async c => {
      const row = await read(ctfProofId(userId, c.id));
      return row ? proof(row, userId, c) : null;
    }))).filter(Boolean).sort((a, b) => b.completedAt.localeCompare(a.completedAt));
    return { completions, coinEarning, maxAttemptsPerDay: CTF_MAX_ATTEMPTS,
      points: completions.reduce((sum, p) => sum + p.points, 0),
      xp: completions.reduce((sum, p) => sum + p.xp, 0), coins: completions.reduce((sum, p) => sum + p.coins, 0) };
  }
  async function submit(account, challengeId, flag, coinEarning) {
    const c = bank.find(item => item.id === challengeId);
    if (!c) return { code: 404, data: { error: 'CTF_UNAVAILABLE' } };
    if (typeof flag !== 'string' || flag.trim().length < 3 || flag.length > 256 || /[\u0000-\u001f\u007f]/.test(flag.trim()))
      return { code: 400, data: { error: 'CTF_INVALID_FLAG' } };
    const id = ctfProofId(account.$id, c.id), existing = await read(id);
    if (existing) return { code: 200, data: { awarded: false, completion: proof(existing, account.$id, c), ...await state(account.$id, coinEarning) } };
    const date = now(), day = date.toISOString().slice(0, 10);
    // Claim a slot before grading. Unique row IDs enforce the limit across executions.
    let slot = 0;
    for (let n = 1; n <= CTF_MAX_ATTEMPTS; n++) {
      const claimed = await create(idFor('r', account.$id, `${c.id}:${day}:${n}`), { version: 1, kind: 'ctf-attempt', userId: account.$id, challengeId: c.id, day, slot: n });
      if (claimed.status === 201) { slot = n; break; }
      if (claimed.status !== 409) throw new Error('CTF attempt write failed');
    }
    const retryAt = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)).toISOString();
    if (!slot) return { code: 429, data: { error: 'CTF_ATTEMPT_LIMIT', retryAt, remaining: 0 } };
    const validator = c.digest ? c : readBank().find(item => item.id === c.id);
    if (!validator || validator.level !== c.level || validator.packageSha256 !== c.packageSha256) throw new Error('CTF validator mismatch');
    const submitted = createHash('sha256').update(validator.prefix + flag.trim()).digest();
    if (!timingSafeEqual(submitted, Buffer.from(validator.digest, 'hex'))) return { code: 422, data: { error: 'CTF_WRONG_FLAG', remaining: CTF_MAX_ATTEMPTS - slot, ...(slot === CTF_MAX_ATTEMPTS ? { retryAt } : {}) } };
    const reward = ctfRewards[c.level];
    const created = await create(id, { version: 1, kind: 'ctf-earned', id, userId: account.$id, challengeId: c.id,
      learnerName: account.name, level: c.level, packageSha256: c.packageSha256, completedAt: date.toISOString(),
      points: reward.points, xp: reward.xp, coins: coinEarning ? reward.coins : 0 });
    if (![201, 409].includes(created.status)) throw new Error('CTF completion write failed');
    const saved = await read(id);
    if (!saved) throw new Error('CTF completion unavailable');
    return { code: 200, data: { awarded: created.status === 201, completion: proof(saved, account.$id, c), ...await state(account.$id, coinEarning) } };
  }
  return { state, submit };
}
