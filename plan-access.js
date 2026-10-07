// Public catalog policy. The progress function is the authority for the active plan.
export const PLAN_RANK = Object.freeze({ free: 0, plus: 1, pro: 2 });

export function requiredPlan(kind, index) {
  if (!Number.isInteger(index) || index < 0) return 'pro';
  const free = { course: 1, quiz: 1, lab: 1, challenge: 3, tool: 4, operation: 1, coreChallenge: 5 };
  const plus = { course: 8, quiz: 8, lab: 4, challenge: 8, tool: 10, operation: 3, coreChallenge: 10 };
  if (!(kind in free)) return 'pro';
  // Starter curriculum is free in full, regardless of catalog order.
  const starters = { course: [1, 2, 4, 9], quiz: [0, 1, 3, 8], lab: [0, 1, 5] };
  if (starters[kind]?.includes(index)) return 'free';
  if ((kind === 'course' && index === 19) || (kind === 'quiz' && index === 12)) return 'plus';
  // Course indices use the desktop curriculum's one-based order.
  const position = kind === 'course' ? index : index + 1;
  return position <= free[kind] ? 'free' : position <= plus[kind] ? 'plus' : 'pro';
}

export function canAccess(kind, index, membership) {
  if (!membership) return false;
  if (membership.admin) return true;
  const plan = membership.effectivePlan || membership.plan;
  return (PLAN_RANK[plan] ?? -1) >= PLAN_RANK[requiredPlan(kind, index)];
}

// Suggestions use the same access policy as the destination, without granting access.
export function coursePracticeTarget(courseId, practice, membership, foundationsPassed) {
  const starterUnits = { 'desktop-1': 'scope', 'desktop-2': 'network', 'desktop-4': 'crypto', 'desktop-9': 'linux' };
  if (Object.hasOwn(starterUnits, courseId)) return { kind: 'starter', href: `free-studio.html?unit=${starterUnits[courseId]}` };
  if (!practice) return null;
  if (!Number.isInteger(practice.index) || practice.index < 0 || typeof practice.context !== 'string') return { kind: 'locked', plan: 'pro' };
  const plan = requiredPlan('lab', practice.index);
  const open = Boolean(membership?.admin || (canAccess('lab', practice.index, membership) && (plan === 'free' || foundationsPassed)));
  return open ? { kind: 'specialty', href: `practice-lab.html?id=${practice.index}&context=${encodeURIComponent(practice.context)}` } : { kind: 'locked', plan };
}
