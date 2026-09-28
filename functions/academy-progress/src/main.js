import { createHash } from 'node:crypto';
import { examService } from './exam.js';
import { credentialAdminService, isAcademyAdmin } from './admin.js';
import { coinLedgerService } from './coins.js';
import { membershipService } from './membership.js';

const ENDPOINT = process.env.APPWRITE_FUNCTION_API_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID || '6aa55a88003959a536e9';
const DATABASE_ID = '6aa56477002e28054068';
const TABLE_ID = '6ab81dce000e6188b664';
// Published lesson checks are formative; final exam answers live only in the function deployment.
const COURSE_LESSONS = [
  [{ id: 'url-parts', answer: 1 }, { id: 'url-traps', answer: 1 }, { id: 'url-decision', answer: 2 }],
  [{ id: 'identity-passwords', answer: 1 }, { id: 'identity-sessions', answer: 1 }, { id: 'identity-least-privilege', answer: 1 }],
  [{ id: 'evidence-logs', answer: 1 }, { id: 'evidence-integrity', answer: 0 }, { id: 'evidence-triage', answer: 2 }],
];
const LESSONS = COURSE_LESSONS.flat();
const LESSON_XP = 100;
const LESSON_COINS = 10;

export function levelForXp(xp) {
  let level = 1;
  let floor = 0;
  let step = 100;
  while (xp >= floor + step) {
    floor += step;
    level += 1;
    step += 50;
  }
  return { level, xpIntoLevel: xp - floor, xpToNextLevel: step };
}

export function awardId(userId, lessonId) {
  return `a_${createHash('sha256').update(`${userId}:${lessonId}`).digest('hex').slice(0, 32)}`;
}

function rowUrl(rowId) {
  return `${ENDPOINT}/tablesdb/${DATABASE_ID}/tables/${TABLE_ID}/rows/${rowId}`;
}

async function appwrite(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'X-Appwrite-Project': PROJECT_ID, ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

async function accountFromJwt(jwt) {
  if (!jwt) return null;
  const result = await appwrite(`${ENDPOINT}/account`, { headers: { 'X-Appwrite-JWT': jwt } });
  if (result.status === 401) return null;
  if (result.status !== 200) throw new Error('Account verification failed');
  return result.data;
}

async function getAward(key, userId, lessonId) {
  const result = await appwrite(rowUrl(awardId(userId, lessonId)), { headers: { 'X-Appwrite-Key': key } });
  if (result.status === 404) return null;
  if (result.status !== 200) throw new Error('Award lookup failed');
  if (result.data.userId !== userId || result.data.lessonId !== lessonId) throw new Error('Award ownership mismatch');
  return result.data;
}

async function getAwardState(key, userId) {
  const rows = await Promise.all(LESSONS.map((lesson) => getAward(key, userId, lesson.id)));
  const awards = rows.filter(Boolean).map((row) => ({
    lessonId: row.lessonId,
    xp: row.xp,
    coins: row.coins,
    completedAt: row.$createdAt,
  }));
  const xp = awards.reduce((sum, award) => sum + award.xp, 0);
  return { awards, xp, ...levelForXp(xp) };
}

async function getState(key, userId) {
  const learning = await getAwardState(key, userId);
  const ledger = coinLedgerService({
    base: ENDPOINT,
    request: (url, options = {}) => appwrite(url, { ...options, headers: { 'X-Appwrite-Key': key, 'Content-Type': 'application/json' } }),
  });
  const { coins, transactions } = await ledger.state(userId, learning.awards);
  return { ...learning, coins, transactions };
}

async function complete(key, userId, lessonId, answerIndex) {
  const course = COURSE_LESSONS.find((items) => items.some((lesson) => lesson.id === lessonId));
  const index = course?.findIndex((lesson) => lesson.id === lessonId) ?? -1;
  if (index < 0 || !Number.isInteger(answerIndex)) return { status: 400, body: { error: 'Invalid lesson submission' } };
  if (course[index].answer !== answerIndex) return { status: 422, body: { error: 'Incorrect answer' } };
  if (index > 0 && !await getAward(key, userId, course[index - 1].id)) {
    return { status: 409, body: { error: 'Complete the previous lesson first' } };
  }
  if (await getAward(key, userId, lessonId)) return { status: 200, body: { ...await getState(key, userId), awarded: false } };

  const result = await appwrite(`${ENDPOINT}/tablesdb/${DATABASE_ID}/tables/${TABLE_ID}/rows`, {
    method: 'POST',
    headers: { 'X-Appwrite-Key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ rowId: awardId(userId, lessonId), data: { userId, lessonId, xp: LESSON_XP, coins: LESSON_COINS }, permissions: [] }),
  });
  if (result.status !== 201 && result.status !== 409) throw new Error('Award creation failed');
  return { status: 200, body: { ...await getState(key, userId), awarded: result.status === 201 } };
}

export default async ({ req, res, error }) => {
  try {
    const headers = Object.fromEntries(Object.entries(req.headers || {}).map(([name, value]) => [name.toLowerCase(), value]));
    const account = await accountFromJwt(headers['x-appwrite-user-jwt']);
    if (!account?.$id) return res.json({ error: 'Sign in required' }, 401);
    const key = headers['x-appwrite-key'];
    if (!key) throw new Error('Function key unavailable');
    const input = req.bodyJson || JSON.parse(req.bodyText || '{}');
    if (input.action === 'membershipState') {
      const membership = membershipService({
        base: ENDPOINT,
        request: (url, options = {}) => appwrite(url, { ...options, headers: { 'X-Appwrite-Key': key, 'Content-Type': 'application/json' } }),
      });
      return res.json(await membership.state(account.$id));
    }
    if (input.action === 'state') return res.json(await getState(key, account.$id));
    if (input.action === 'completeLesson') {
      const result = await complete(key, account.$id, input.lessonId, input.answerIndex);
      return res.json(result.body, result.status);
    }
    const exam = examService({
      base: ENDPOINT,
      request: (url, options = {}) => appwrite(url, { ...options, headers: { 'X-Appwrite-Key': key, 'Content-Type': 'application/json' } }),
      getLessonState: (userId) => getAwardState(key, userId),
    });
    if (input.action === 'examState') return res.json(await exam.state(account.$id));
    if (input.action === 'submitExam') {
      const result = await exam.submit(account.$id, account.name, input.answers);
      return res.json(result.data, result.code);
    }
    if (input.action === 'credential') {
      const result = await exam.credential(account.$id);
      return res.json(result.data, result.code);
    }
    if (input.action === 'shareCredential' && typeof input.enabled === 'boolean') {
      const result = await exam.share(account.$id, input.enabled);
      return res.json(result.data, result.code);
    }
    if (['adminStatus', 'adminCredential', 'adminRevokeCredential'].includes(input.action)) {
      if (!isAcademyAdmin(account)) return res.json({ error: 'Academy admin access required' }, 403);
      if (input.action === 'adminStatus') return res.json({ admin: true });
      const admin = credentialAdminService({
        base: ENDPOINT,
        request: (url, options = {}) => appwrite(url, { ...options, headers: { 'X-Appwrite-Key': key, 'Content-Type': 'application/json' } }),
      });
      const result = input.action === 'adminCredential'
        ? await admin.lookup(input.credentialId)
        : await admin.revoke(input.credentialId, account.$id, input.reason);
      return res.json(result.data, result.code);
    }
    return res.json({ error: 'Unknown action' }, 400);
  } catch (cause) {
    error(cause.message);
    return res.json({ error: 'Learning progress is temporarily unavailable' }, 503);
  }
};
