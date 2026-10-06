import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { mayAccessLibrary } from './library.js';

let cached;
const failure = (message, status) => Object.assign(new Error(message), { status });
function bank() {
  if (!cached) {
    const source = JSON.parse(readFileSync(new URL('../soc-investigation-bank.private.json', import.meta.url), 'utf8'));
    const ids = new Set();
    if (source.id !== 'soc-export-v1' || !source.version || !Array.isArray(source.files) || source.files.length !== 6 || !source.solution ||
      !['ar','en'].every(lang => ['title','brief'].every(field => typeof source[field]?.[lang] === 'string') && ['objectives','hints','rubric'].every(field => Array.isArray(source[field]?.[lang]) && source[field][lang].length >= 3))) throw failure('SOC case unavailable', 503);
    for (const file of source.files) {
      if (!/^[a-z-]+\.json$/.test(file.name) || !['identity','application','proxy','endpoint','changes','collection'].includes(file.source) || !Number.isInteger(file.clockOffsetSeconds) || !Array.isArray(file.rows) || !['ar','en'].every(lang => typeof file.description?.[lang] === 'string')) throw failure('SOC case unavailable',503);
      for (const row of file.rows) {
        if (!/^[A-Z]\d{2}$/.test(row.id) || ids.has(row.id) || !Number.isFinite(Date.parse(row.timestamp)) || !['host','actor','session','event','detail'].every(field => typeof row[field] === 'string') || !Number.isSafeInteger(row.bytes) || row.bytes < 0) throw failure('SOC case unavailable',503);
        ids.add(row.id);
      }
    }
    if (ids.size !== 33 || !['required','unrelated','timeline'].every(field => Array.isArray(source.solution[field]) && source.solution[field].every(id => ids.has(id)))) throw failure('SOC case unavailable',503);
    cached = source;
  }
  return cached;
}
export function canInvestigateSoc(membership, foundationsPassed) {
  // Same course access as the SOC bundle, including the current transition plans.
  return Boolean(membership) && [2, 4, 7].every(order => mayAccessLibrary('course', order, membership, foundationsPassed));
}
function guard(membership, foundationsPassed) {
  if (!canInvestigateSoc(membership, foundationsPassed)) throw failure('SOC path access and Foundations exam required', 403);
}
const localize = (value, language) => value?.[language] ?? value;
const fileText = file => JSON.stringify(file.rows, null, 2) + '\n';
export function socCase(membership, foundationsPassed, language = 'ar') {
  guard(membership, foundationsPassed);
  const source = bank(), lang = language === 'en' ? 'en' : 'ar';
  return { id: source.id, version: source.version, pathId: 'path_soc', practiceOnly: true,
    title: localize(source.title, lang), brief: localize(source.brief, lang),
    objectives: source.objectives[lang], hints: source.hints[lang], rubric: source.rubric[lang],
    baselineBytes: source.baselineBytes, window: source.window, sources: source.sources,
    files: source.files.map(file => ({ name: file.name, source: file.source,
      description: file.description[lang], clockOffsetSeconds: file.clockOffsetSeconds,
      rows: file.rows, sha256: createHash('sha256').update(fileText(file)).digest('hex') })) };
}
export function checkSocInvestigation(membership, foundationsPassed, input) {
  guard(membership, foundationsPassed);
  const source = bank();
  if (!input || typeof input !== 'object') throw failure('Invalid SOC findings', 400);
  if (input.caseId !== source.id || input.version !== source.version) throw failure('SOC case changed; reload before checking', 409);
  const findings = input.findings;
  if (!findings || typeof findings !== 'object' || !Array.isArray(findings.evidenceIds) || findings.evidenceIds.length > 40 ||
    !Array.isArray(findings.timeline) || findings.timeline.length > 10 ||
    findings.evidenceIds.some(id => typeof id !== 'string' || !source.files.some(file => file.rows.some(row => row.id === id))) ||
    findings.timeline.some(id => typeof id !== 'string' || !source.solution.timeline.includes(id)) ||
    !['session', 'nat', 'organization', 'none'].includes(findings.scope) ||
    !['needs-validation', 'confirmed-theft', 'benign'].includes(findings.conclusion) ||
    !Number.isSafeInteger(findings.outboundBytes) || findings.outboundBytes < 0 || findings.outboundBytes > 1e12 ||
    typeof findings.baselineMultiple !== 'number' || !Number.isFinite(findings.baselineMultiple) || findings.baselineMultiple < 0 || findings.baselineMultiple > 1e6)
    throw failure('Invalid SOC findings', 400);
  const selected = new Set(findings.evidenceIds), answer = source.solution;
  const checks = {
    evidence: answer.required.every(id => selected.has(id)) && !answer.unrelated.some(id => selected.has(id)),
    timeline: JSON.stringify(findings.timeline) === JSON.stringify(answer.timeline),
    volume: findings.outboundBytes === answer.outboundBytes && findings.baselineMultiple === answer.baselineMultiple,
    scope: findings.scope === answer.scope,
    conclusion: findings.conclusion === answer.conclusion,
  };
  return { caseId: source.id, version: source.version, practiceOnly: true, checks,
    feedback: answer.feedback[input.language === 'en' ? 'en' : 'ar'],
    checked: Object.values(checks).filter(Boolean).length, total: 5,
    reportGraded: false, certificateEligible: false };
}
