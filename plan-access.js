// Public catalog policy. The progress function is the authority for the active plan.
export const PLAN_RANK = Object.freeze({ free: 0, plus: 1, pro: 2 });

export function requiredPlan(kind, index) {
  if (!Number.isInteger(index) || index < 0) return 'pro';
  const free = { course: 1, quiz: 1, lab: 1, challenge: 3, tool: 4, operation: 1, coreChallenge: 5 };
  const plus = { course: 8, quiz: 8, lab: 4, challenge: 8, tool: 10, operation: 3, coreChallenge: 10 };
  if (!(kind in free)) return 'pro';
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
