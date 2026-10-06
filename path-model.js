import { canAccess } from './plan-access.js?v=20261006-quality1';

export function pathAccess(path, membership, foundationsPassed, ready = true) {
  if (!ready || !membership) return 'unavailable';
  if (path.free) return 'free';
  if (membership.admin) return 'admin';
  if (!foundationsPassed) return 'foundations';
  // Purchases will be supplied by the authenticated server in the billing phase.
  if (Array.isArray(membership.ownedPathIds) && membership.ownedPathIds.includes(path.id)) return 'owned';
  if (path.courses.every(course => canAccess('course', course.order, membership))) return 'existing';
  return 'purchase';
}

export function pathCounts(path) {
  return { courses: path.courses.length, lessons: path.courses.reduce((sum, c) => sum + c.lessonIds.length, 0),
    quizzes: path.quizzes.length, labs: path.labs.length, challenges: path.challenges.length };
}

export function resourceAccess(path, kind, item, access, membership) {
  if (!membership || !['free', 'admin', 'owned', 'existing'].includes(access)) return false;
  if (path.free || access === 'admin' || access === 'owned') return true;
  if (item.socCase) return path.id === 'path_soc' && path.courses.every(course => canAccess('course', course.order, membership));
  if (item.core) return canAccess('coreChallenge', item.index ?? 0, membership);
  return canAccess(kind, kind === 'course' ? item.order : item.index, membership);
}
