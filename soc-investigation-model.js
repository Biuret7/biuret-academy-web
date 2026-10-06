export const SOC_CASE_ID = 'soc-export-v1';
export function normalizedCaseTime(row, file) {
  const ms = Date.parse(row.timestamp);
  return Number.isFinite(ms) ? new Date(ms - file.clockOffsetSeconds * 1000).toISOString() : '';
}
export function investigationRows(bundle, { query = '', source = 'all', session = '' } = {}) {
  const term = String(query).trim().toLowerCase(), token = String(session).trim().toLowerCase();
  return bundle.files.flatMap(file => file.rows.map(row => ({ ...row, source: file.source,
    file: file.name, correctedTime: normalizedCaseTime(row, file) })))
    .filter(row => (source === 'all' || source === row.source) && (!token || row.session.toLowerCase().includes(token)) &&
      (!term || Object.values(row).join(' ').toLowerCase().includes(term)));
}
export function cleanInvestigation(value = {}, version) {
  if (!value || typeof version !== 'string' || value.version !== version) return { version, evidenceIds: [], timeline: '', outboundBytes: '', baselineMultiple: '', scope: '', conclusion: '', query: '', source: 'all', session: '' };
  const clean = cleanInvestigation({}, version);
  for (const key of ['timeline', 'outboundBytes', 'baselineMultiple', 'scope', 'conclusion', 'query', 'source', 'session'])
    if (typeof value[key] === 'string') clean[key] = value[key].slice(0, key === 'timeline' ? 120 : 100);
  clean.evidenceIds = Array.isArray(value.evidenceIds) ? [...new Set(value.evidenceIds.filter(id => typeof id === 'string' && /^[A-Z]\d{2}$/.test(id)))].slice(0, 40) : [];
  return clean;
}
export function investigationFindings(state) {
  const numeric = value => String(value).trim() === '' ? null : Number(value);
  return { evidenceIds: state.evidenceIds, timeline: String(state.timeline).toUpperCase().split(/[\s,،;]+/).filter(Boolean),
    outboundBytes: numeric(state.outboundBytes), baselineMultiple: numeric(state.baselineMultiple), scope: state.scope, conclusion: state.conclusion };
}
export const evidenceFileText = file => JSON.stringify(file.rows, null, 2) + '\n';
export function evidenceCsv(file) {
  const columns = ['id', 'timestamp', 'host', 'actor', 'session', 'event', 'detail', 'bytes'];
  const cell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  return columns.map(cell).join(',') + '\n' + file.rows.map(row => columns.map(c => cell(row[c])).join(',')).join('\n') + '\n';
}
export async function verifyEvidenceFile(file) {
  const bytes = new TextEncoder().encode(evidenceFileText(file));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('') === file.sha256;
}
