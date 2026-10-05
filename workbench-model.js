// Synthetic practice only. These answers never award XP or issue credentials.
export const evidenceRows = [
  { id: 'E1', time: '09:11:00Z', source: 'identity', host: 'ws-04', user: 'learner', event: 'LOGIN_FAIL', ip: '198.51.100.42', detail: 'session=none' },
  { id: 'E2', time: '09:11:06Z', source: 'identity', host: 'ws-04', user: 'learner', event: 'LOGIN_FAIL', ip: '198.51.100.42', detail: 'session=none' },
  { id: 'E3', time: '09:11:12Z', source: 'identity', host: 'ws-04', user: 'learner', event: 'LOGIN_FAIL', ip: '198.51.100.42', detail: 'session=none' },
  { id: 'E4', time: '09:12:00Z', source: 'identity', host: 'ws-04', user: 'learner', event: 'LOGIN_OK', ip: '198.51.100.42', detail: 'session=S-17; MFA=not-recorded' },
  { id: 'E5', time: '09:12:35Z', source: 'application', host: 'ws-04', user: 'learner', event: 'EXPORT', ip: '198.51.100.42', detail: 'session=S-17; rows=250; job=not-recorded' },
  { id: 'E6', time: '09:12:40Z', source: 'identity', host: 'ws-02', user: 'backup', event: 'LOGIN_OK', ip: '192.0.2.20', detail: 'session=S-18; approved-backup=true' },
  { id: 'E7', time: '09:13:00Z', source: 'network', host: 'ws-04', user: 'unknown', event: 'TLS_CONNECT', ip: '198.51.100.42', detail: 'dst=203.0.113.9:443; bytes=500000; session=not-recorded' },
  { id: 'E8', time: '09:14:00Z', source: 'sensor', host: 'ws-04', user: 'unknown', event: 'COLLECTION_GAP', ip: 'n/a', detail: 'endpoint sensor offline; reason=unknown' },
];
export function filterEvidence(rows, query = '', source = 'all') {
  const term = String(query).trim().toLowerCase();
  return rows.filter(row => (source === 'all' || row.source === source) && Object.values(row).join(' ').toLowerCase().includes(term));
}
export function checkFindings({ selected = [], failures, conclusion, next }) {
  const ids = [...new Set(selected)].filter(id => evidenceRows.some(row => row.id === id));
  return {
    correlation: ['E1', 'E2', 'E3', 'E4', 'E5'].every(id => ids.includes(id)) && !ids.includes('E6'),
    count: String(failures).trim() === '3',
    conclusion: conclusion === 'investigate',
    next: next === 'preserve',
  };
}
export function practiceReport(state, context, language) {
  // Deliberately exclude account IDs, names, email, and authentication material.
  return { schemaVersion: 1, kind: 'learner-practice-feedback', context, language,
    evidenceIds: state.selected || [], findings: { failures: state.failures || '', conclusion: state.conclusion || '', next: state.next || '', reasoning: state.reasoning || '' },
    feedback: { clarity: state.clarity || '', friction: state.friction || '' },
    practiceOnly: true, exportedAt: new Date().toISOString() };
}
