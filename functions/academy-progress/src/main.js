import { createHash } from 'node:crypto';
import { examService } from './exam.js';
import { credentialAdminService, isAcademyAdmin } from './admin.js';
import { coinLedgerService } from './coins.js';
import { membershipService } from './membership.js';
import { libraryItem, mayAccessLibrary, publicLibraryFor, scoreLibraryPractice } from './library.js';
import { pathExamService } from './path-exam.js';

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

function membershipFor(key) {
  return membershipService({
    base: ENDPOINT,
    request: (url, options = {}) => appwrite(url, { ...options, headers: { 'X-Appwrite-Key': key, 'Content-Type': 'application/json' } }),
  });
}

async function membershipForAccount(key, account) {
  const membership = await membershipFor(key).state(account.$id);
  return isAcademyAdmin(account)
    ? { ...membership, admin: true, effectivePlan: 'pro', access: { ...membership.access, advancedLabs: true, coinEarning: true } }
    : { ...membership, admin: false, effectivePlan: membership.plan };
}

async function getState(key, userId, membership) {
  membership ||= await membershipFor(key).state(userId);
  const learning = await getAwardState(key, userId);
  const ledger = coinLedgerService({
    base: ENDPOINT,
    request: (url, options = {}) => appwrite(url, { ...options, headers: { 'X-Appwrite-Key': key, 'Content-Type': 'application/json' } }),
  });
  const { coins, transactions } = await ledger.state(userId, learning.awards, { canEarn: membership.access.coinEarning });
  return { ...learning, coins, transactions, coinEarning: membership.access.coinEarning, plan: membership.plan, effectivePlan: membership.effectivePlan || membership.plan, admin: Boolean(membership.admin) };
}

async function complete(key, account, lessonId, answerIndex) {
  const userId = account.$id;
  const course = COURSE_LESSONS.find((items) => items.some((lesson) => lesson.id === lessonId));
  const index = course?.findIndex((lesson) => lesson.id === lessonId) ?? -1;
  if (index < 0 || !Number.isInteger(answerIndex)) return { status: 400, body: { error: 'Invalid lesson submission' } };
  if (course[index].answer !== answerIndex) return { status: 422, body: { error: 'Incorrect answer' } };
  if (index > 0 && !await getAward(key, userId, course[index - 1].id)) {
    return { status: 409, body: { error: 'Complete the previous lesson first' } };
  }
  const membership = await membershipForAccount(key, account);
  if (await getAward(key, userId, lessonId)) return { status: 200, body: { ...await getState(key, userId, membership), awarded: false } };

  const result = await appwrite(`${ENDPOINT}/tablesdb/${DATABASE_ID}/tables/${TABLE_ID}/rows`, {
    method: 'POST',
    headers: { 'X-Appwrite-Key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ rowId: awardId(userId, lessonId), data: { userId, lessonId, xp: LESSON_XP, coins: membership.access.coinEarning ? LESSON_COINS : 0 }, permissions: [] }),
  });
  if (result.status !== 201 && result.status !== 409) throw new Error('Award creation failed');
  return { status: 200, body: { ...await getState(key, userId, membership), awarded: result.status === 201 } };
}

async function libraryContext(key, account) {
  const membership = await membershipForAccount(key, account);
  const exam = examService({
    base: ENDPOINT,
    request: (url, options = {}) => appwrite(url, { ...options, headers: { 'X-Appwrite-Key': key, 'Content-Type': 'application/json' } }),
    getLessonState: async () => ({ awards: [] }),
  });
  const foundationsPassed = membership.admin || (await exam.state(account.$id)).passed;
  return { membership, foundationsPassed };
}

async function markLibraryLesson(key, account, lessonId) {
  const found = libraryItem('lesson', lessonId);
  if (!found) return { code: 404, data: { error: 'Lesson not found' } };
  const { membership, foundationsPassed } = await libraryContext(key, account);
  if (!mayAccessLibrary('course', found.category.order, membership, foundationsPassed)) return { code: 403, data: { error: 'Membership or Foundations exam required' } };
  const index = found.category.lessons.findIndex((item) => item.id === lessonId);
  if (index > 0 && !await getAward(key, account.$id, found.category.lessons[index - 1].id)) return { code: 409, data: { error: 'Read the previous lesson first' } };
  if (await getAward(key, account.$id, lessonId)) return { code: 200, data: { read: true, new: false } };
  const result = await appwrite(`${ENDPOINT}/tablesdb/${DATABASE_ID}/tables/${TABLE_ID}/rows`, {
    method: 'POST',
    headers: { 'X-Appwrite-Key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ rowId: awardId(account.$id, lessonId), data: { userId: account.$id, lessonId, xp: 0, coins: 0 }, permissions: [] }),
  });
  if (![201, 409].includes(result.status)) throw new Error('Library lesson record failed');
  return { code: 200, data: { read: true, new: result.status === 201 } };
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
      return res.json(await membershipForAccount(key, account));
    }
    if (input.action === 'state') return res.json(await getState(key, account.$id, await membershipForAccount(key, account)));
    if (input.action === 'libraryData') {
      const language = input.language === 'en' ? 'en' : 'ar';
      const context = await libraryContext(key, account);
      return res.json({ ...context, language,
        library: publicLibraryFor(language, context.membership, context.foundationsPassed) });
    }
    if (input.action === 'libraryMarkLesson') {
      const result = await markLibraryLesson(key, account, input.lessonId);
      return res.json(result.data, result.code);
    }
    if (input.action === 'libraryPractice') {
      const kind = input.kind;
      const index = input.index;
      if (!['quiz', 'lab', 'challenge'].includes(kind) || !Number.isInteger(index)) return res.json({ error: 'Invalid practice' }, 400);
      const context = await libraryContext(key, account);
      if (!mayAccessLibrary(kind, index, context.membership, context.foundationsPassed)) return res.json({ error: 'Membership or Foundations exam required' }, 403);
      const scored = scoreLibraryPractice(kind, index, input.answers, input.language);
      return scored ? res.json(scored) : res.json({ error: 'Invalid practice submission' }, 400);
    }
    if (['pathExamState', 'pathSubmitExam', 'pathCredential', 'pathShareCredential'].includes(input.action)) {
      const context = await libraryContext(key, account);
      const paths = pathExamService({
        base: ENDPOINT,
        request: (url, options = {}) => appwrite(url, { ...options, headers: { 'X-Appwrite-Key': key, 'Content-Type': 'application/json' } }),
        getRead: async (userId, lessonId) => Boolean(await getAward(key, userId, lessonId)),
        membership: context.membership,
        foundationsPassed: context.foundationsPassed,
      });
      const result = input.action === 'pathExamState' ? await paths.state(account.$id, input.pathId, input.language)
        : input.action === 'pathSubmitExam' ? await paths.submit(account.$id, account.name, input.pathId, input.answers)
          : input.action === 'pathCredential' ? await paths.credential(account.$id, input.pathId)
            : await paths.share(account.$id, input.pathId, input.enabled);
      return res.json(result.data, result.code);
    }
    if (input.action === 'completeLesson') {
      const result = await complete(key, account, input.lessonId, input.answerIndex);
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
