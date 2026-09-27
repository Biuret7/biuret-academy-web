import { challenges, challengeById, challengesForTrack } from './content.js';
import { courseById, lessonById } from './learning-content.js?v=20260927-7';

export const DAILY_BONUS_XP = 30;
export const STORAGE_KEY = 'biuret-academy-progress-v1';

export function dayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function emptyProgress() {
  return { version: 1, completed: {}, activity: {}, dailyAssignments: {}, dailyBonus: {}, lessons: {} };
}

export function cleanProgress(value) {
  const base = emptyProgress();
  if (!value || typeof value !== 'object') return base;
  for (const [id, entry] of Object.entries(value.completed || {})) {
    if (!challengeById[id] || !entry || typeof entry !== 'object') continue;
    base.completed[id] = {
      at: typeof entry.at === 'string' ? entry.at : new Date(0).toISOString(),
      attempts: Math.max(1, Math.min(999, Number(entry.attempts) || 1)),
      hintUsed: Boolean(entry.hintUsed),
    };
  }
  for (const [date, count] of Object.entries(value.activity || {})) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Number(count))) {
      base.activity[date] = Math.max(0, Math.min(100, Number(count)));
    }
  }
  for (const [date, id] of Object.entries(value.dailyAssignments || {})) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && challengeById[id]) base.dailyAssignments[date] = id;
  }
  for (const [date, id] of Object.entries(value.dailyBonus || {})) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && challengeById[id]) base.dailyBonus[date] = id;
  }
  for (const [id, entry] of Object.entries(value.lessons || {})) {
    if (lessonById[id] && typeof entry === 'string' && !Number.isNaN(Date.parse(entry))) base.lessons[id] = entry;
  }
  return base;
}

export function mergeProgress(left, right) {
  const a = cleanProgress(left);
  const b = cleanProgress(right);
  const merged = emptyProgress();
  for (const id of new Set([...Object.keys(a.completed), ...Object.keys(b.completed)])) {
    const first = a.completed[id];
    const second = b.completed[id];
    merged.completed[id] = !first ? second : !second ? first : {
      at: first.at < second.at ? first.at : second.at,
      attempts: Math.max(first.attempts, second.attempts),
      hintUsed: first.hintUsed || second.hintUsed,
    };
  }
  for (const date of new Set([...Object.keys(a.activity), ...Object.keys(b.activity)])) {
    merged.activity[date] = Math.max(a.activity[date] || 0, b.activity[date] || 0);
  }
  merged.dailyAssignments = { ...b.dailyAssignments, ...a.dailyAssignments };
  merged.dailyBonus = { ...b.dailyBonus, ...a.dailyBonus };
  for (const id of new Set([...Object.keys(a.lessons), ...Object.keys(b.lessons)])) {
    const first = a.lessons[id], second = b.lessons[id];
    merged.lessons[id] = !first ? second : !second ? first : first < second ? first : second;
  }
  return merged;
}

export function isLessonUnlocked(lessonId, progress) {
  const lesson = lessonById[lessonId];
  if (!lesson) return false;
  const course = courseById[lesson.courseId];
  const index = course?.lessonIds.indexOf(lessonId) ?? -1;
  return index === 0 || (index > 0 && Boolean(cleanProgress(progress).lessons[course.lessonIds[index - 1]]));
}

export function completeLesson(progress, lessonId, today = new Date()) {
  const safe = cleanProgress(progress);
  if (!isLessonUnlocked(lessonId, safe) || safe.lessons[lessonId]) return { progress: safe, completed: false };
  safe.lessons[lessonId] = today.toISOString();
  return { progress: safe, completed: true };
}

export function courseLearningProgress(progress, courseId) {
  const course = courseById[courseId];
  if (!course) return null;
  const safe = cleanProgress(progress);
  return { completed: course.lessonIds.filter((id) => safe.lessons[id]).length, total: course.lessonIds.length,
    challengeComplete: Boolean(safe.completed[course.challengeId]) };
}

export function isUnlocked(challenge, progress) {
  if (challenge.order === 1) return true;
  const prior = challengesForTrack(challenge.track).find((item) => item.order === challenge.order - 1);
  return Boolean(prior && cleanProgress(progress).completed[prior.id]);
}

export function totalXp(progress) {
  const safe = cleanProgress(progress);
  const challengeXp = Object.keys(safe.completed).reduce((sum, id) => sum + challengeById[id].xp, 0);
  return challengeXp + Object.keys(safe.dailyBonus).length * DAILY_BONUS_XP;
}

export function streak(progress, today = new Date()) {
  const safe = cleanProgress(progress);
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!safe.activity[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (safe.activity[dayKey(cursor)] > 0) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function weekActivity(progress, today = new Date()) {
  const safe = cleanProgress(progress);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    date.setDate(date.getDate() - (6 - index));
    return { date: dayKey(date), count: safe.activity[dayKey(date)] || 0, weekday: date.toLocaleDateString('ar', { weekday: 'short' }) };
  });
}

function dateSeed(date) {
  return [...date].reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 7);
}

export function dailyChallenge(progress, today = new Date()) {
  const safe = cleanProgress(progress);
  const date = dayKey(today);
  const assigned = safe.dailyAssignments[date];
  if (assigned) return challengeById[assigned];
  const available = challenges.filter((challenge) => isUnlocked(challenge, safe) && !safe.completed[challenge.id]);
  const pool = available.length ? available : challenges.filter((challenge) => isUnlocked(challenge, safe));
  return pool[dateSeed(date) % pool.length];
}

export function assignDaily(progress, today = new Date()) {
  const safe = cleanProgress(progress);
  const date = dayKey(today);
  if (!safe.dailyAssignments[date]) safe.dailyAssignments[date] = dailyChallenge(safe, today).id;
  return safe;
}

export function completeChallenge(progress, challengeId, { attempts = 1, hintUsed = false, today = new Date() } = {}) {
  const safe = assignDaily(progress, today);
  const challenge = challengeById[challengeId];
  if (!challenge || !isUnlocked(challenge, safe)) return { progress: safe, firstCompletion: false, awardedXp: 0 };
  const date = dayKey(today);
  const firstCompletion = !safe.completed[challengeId];
  const dailyEligible = safe.dailyAssignments[date] === challengeId && !safe.dailyBonus[date];
  if (!firstCompletion && !dailyEligible) return { progress: safe, firstCompletion: false, awardedXp: 0 };
  if (firstCompletion) safe.completed[challengeId] = { at: today.toISOString(), attempts: Math.max(1, attempts), hintUsed };
  safe.activity[date] = (safe.activity[date] || 0) + 1;
  let awardedXp = firstCompletion ? challenge.xp : 0;
  if (dailyEligible) {
    safe.dailyBonus[date] = challengeId;
    awardedXp += DAILY_BONUS_XP;
  }
  return { progress: safe, firstCompletion, awardedXp };
}

export function nextChallenge(progress, trackId) {
  const safe = cleanProgress(progress);
  const source = trackId ? challengesForTrack(trackId) : challenges;
  return source.find((challenge) => isUnlocked(challenge, safe) && !safe.completed[challenge.id]) || null;
}

export function trackProgress(progress, trackId) {
  const safe = cleanProgress(progress);
  const source = challengesForTrack(trackId);
  return { completed: source.filter((challenge) => safe.completed[challenge.id]).length, total: source.length };
}
