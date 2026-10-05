// A deterministic teaching simulation. It sends no requests and grants no access.
export const identities = Object.freeze({
  guest: { authenticated: false, tenant: null, role: null },
  'viewer-A': { authenticated: true, tenant: 'A', role: 'viewer' },
  'editor-A': { authenticated: true, tenant: 'A', role: 'editor' },
  'viewer-B': { authenticated: true, tenant: 'B', role: 'viewer' },
});
export const actions = Object.freeze(['read', 'export', 'update']);
export const variants = Object.freeze(['original', 'partial', 'fixed']);
export function validCase(c) {
  return Boolean(c && Object.hasOwn(identities, c.identity) && ['A', 'B'].includes(c.object) && actions.includes(c.action) && variants.includes(c.variant));
}
export function policyAllows(c) {
  if (!validCase(c)) throw new TypeError('Unknown simulation case');
  const i = identities[c.identity];
  return i.authenticated && i.tenant === c.object && (c.action !== 'update' || i.role === 'editor');
}
export function simulate(c) {
  const expected = policyAllows(c);
  const i = identities[c.identity];
  const allowed = c.variant === 'original' ? i.authenticated
    : c.variant === 'partial' && c.action === 'export' ? i.authenticated : expected;
  return { allowed, status: allowed ? 200 : i.authenticated ? 403 : 401, body: allowed ? `synthetic report-${c.object}${c.action === 'update' ? ' updated' : ''}` : '', expected, compliant: allowed === expected };
}
export function sanitizeAttempts(value) {
  const byCase = new Map();
  for (const item of Array.isArray(value) ? value.slice(-200) : []) {
    if (!validCase(item) || !['allow', 'deny'].includes(item.prediction)) continue;
    const c = { variant: item.variant, identity: item.identity, object: item.object, action: item.action, prediction: item.prediction };
    byCase.set([c.variant, c.identity, c.object, c.action].join('/'), c);
  }
  return [...byCase.values()];
}
export function reviewAttempts(attempts, variant) {
  if (!variants.includes(variant)) throw new TypeError('Unknown variant');
  const rows = sanitizeAttempts(attempts).filter(c => c.variant === variant);
  const findings = rows.filter(c => !simulate(c).compliant).length;
  const predictions = rows.filter(c => (c.prediction === 'allow') === policyAllows(c)).length;
  // Passing sampled cases is not the same as complete coverage.
  return { tested: rows.length, total: 24, findings, predictions, outcome: findings ? 'finding' : rows.length === 24 ? 'covered' : 'incomplete' };
}
export function authorizationReport(state, language) {
  return { schema: 'biuret-authorization-practice-v1', language: language === 'ar' ? 'ar' : 'en',
    attempts: sanitizeAttempts(state?.attempts).map(c => ({ ...c, observed: simulate(c) })),
    reasoning: typeof state?.reasoning === 'string' ? state.reasoning.slice(0, 4000) : '',
    scope: 'Synthetic local simulation; no certification or real-system security claim.' };
}
