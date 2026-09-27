import { createHash } from 'node:crypto';

const DATABASE_ID = '6aa56477002e28054068';
const LEDGER_TABLE = '6ab94864000f11a04188';
const LESSON_COINS = 10;

export function lessonCoinEventId(userId, lessonId) {
  return `l_${createHash('sha256').update(`lesson-earned:${userId}:${lessonId}`).digest('hex').slice(0, 32)}`;
}

export function coinLedgerService({ base, request }) {
  const rows = `${base}/tablesdb/${DATABASE_ID}/tables/${LEDGER_TABLE}/rows`;

  async function read(id) {
    const result = await request(`${rows}/${id}`);
    if (result.status === 404) return null;
    if (result.status !== 200) throw new Error('Coin ledger lookup failed');
    return result.data;
  }

  async function ensureLessonEvent(userId, award) {
    if (award.coins !== LESSON_COINS) throw new Error('Lesson coin award mismatch');
    const id = lessonCoinEventId(userId, award.lessonId);
    let row = await read(id);
    if (!row) {
      const payload = JSON.stringify({ version: 1, userId, kind: 'lesson-earned', reference: award.lessonId, delta: LESSON_COINS, awardedAt: award.completedAt });
      const created = await request(rows, {
        method: 'POST',
        body: JSON.stringify({ rowId: id, data: { payload }, permissions: [] }),
      });
      if (created.status === 201) row = created.data;
      else if (created.status === 409) row = await read(id);
      else throw new Error('Coin ledger write failed');
    }
    if (!row) throw new Error('Coin ledger event unavailable');
    let event;
    try { event = JSON.parse(row.payload); }
    catch { throw new Error('Coin ledger event invalid'); }
    if (event.version !== 1 || event.userId !== userId || event.kind !== 'lesson-earned' ||
        event.reference !== award.lessonId || event.delta !== LESSON_COINS ||
        (event.awardedAt && event.awardedAt !== award.completedAt)) {
      throw new Error('Coin ledger event mismatch');
    }
    return { id, kind: event.kind, reference: event.reference, delta: event.delta, earnedAt: event.awardedAt || award.completedAt, recordedAt: row.$createdAt || award.completedAt };
  }

  async function state(userId, awards) {
    const transactions = await Promise.all(awards.map((award) => ensureLessonEvent(userId, award)));
    transactions.sort((a, b) => b.earnedAt.localeCompare(a.earnedAt) || a.id.localeCompare(b.id));
    return { coins: transactions.reduce((sum, event) => sum + event.delta, 0), transactions };
  }

  return { state };
}
