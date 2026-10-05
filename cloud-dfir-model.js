// Restricted teaching models, not a cloud-provider policy emulator or real evidence.
export const cloudRequests = ['read:logs', 'write:logs', 'read:payroll', 'write:payroll'];
export function evaluateCloud(request, configuration) {
  if (!cloudRequests.includes(request) || !['drift','repaired'].includes(configuration)) throw new TypeError('Unknown policy sample');
  const [action, resource] = request.split(':');
  const grant = action === 'read'; // identity grant: read:*
  const boundary = configuration === 'drift' ? true : action === 'read' && resource === 'logs';
  const explicitDeny = configuration === 'repaired' && resource === 'payroll';
  const allowed = grant && boundary && !explicitDeny;
  return { grant, boundary, explicitDeny, allowed, intended: request === 'read:logs',
    reason: explicitDeny ? 'explicit-deny' : !grant ? 'no-grant' : !boundary ? 'boundary' : 'allow' };
}
export const evidenceOriginal = 'SYNTHETIC E21\n09:00Z report-service read logs\n09:01Z reader-A denied payroll\n';
export const evidenceCopies = Object.freeze({
  documented: { text:evidenceOriginal, custody:true, label:{ar:'نسخة موثقة',en:'Documented copy'} },
  changed: { text:evidenceOriginal.replace('denied payroll','read payroll'), custody:true, label:{ar:'نسخة تغير محتواها',en:'Changed-content copy'} },
  gap: { text:evidenceOriginal, custody:false, label:{ar:'نسخة بفجوة حيازة',en:'Custody-gap copy'} },
});
export async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function compareEvidence(id) {
  if(!Object.hasOwn(evidenceCopies,id)) throw new TypeError('Unknown copy');
  const c=evidenceCopies[id];
  const [originalHash,copyHash]=await Promise.all([sha256(evidenceOriginal),sha256(c.text)]);
  return {originalHash,copyHash,match:originalHash===copyHash,custody:c.custody,sourceTruth:'unestablished',comparisonUsable:originalHash===copyHash&&c.custody};
}
export const timeline = Object.freeze([
  {id:'E1',time:'2026-10-05T12:00:00+03:00',uncertaintySeconds:2,session:'S17'},
  {id:'E2',time:'2026-10-05T09:00:01Z',uncertaintySeconds:2,session:'S17'},
  {id:'E3',time:'2026-10-05T09:01:00Z',uncertaintySeconds:1,session:'S18'},
]);
export function normalizeTimeline(rows) {
  return rows.map(r=>{const time=Date.parse(r.time); if(!Number.isFinite(time)||!Number.isFinite(r.uncertaintySeconds)||r.uncertaintySeconds<0)throw new TypeError('Invalid event time');
    return {...r,utc:new Date(time).toISOString(),earliest:time-r.uncertaintySeconds*1000,latest:time+r.uncertaintySeconds*1000};});
}
export function temporalOrder(a,b){
  const [x,y]=normalizeTimeline([a,b]);
  return x.latest<y.earliest?'before':y.latest<x.earliest?'after':'uncertain';
}
export function sanitizeCasework(raw,kind){
  const state=raw&&typeof raw==='object'?raw:{};
  const choices=kind==='cloud'?['drift','repaired'].flatMap(v=>cloudRequests.map(r=>`${v}/${r}`)):Object.keys(evidenceCopies);
  const observations=[...new Set((Array.isArray(state.observations)?state.observations:[]).filter(v=>choices.includes(v)))];
  return {observations,reasoning:typeof state.reasoning==='string'?state.reasoning.slice(0,4000):'',
    configuration:['drift','repaired'].includes(state.configuration)?state.configuration:'drift'};
}
export async function caseworkReport(raw,kind,language){
  if(!['cloud','dfir'].includes(kind))throw new TypeError('Unknown practice');
  const state=sanitizeCasework(raw,kind);
  const results=kind==='cloud'?state.observations.map(v=>{const [configuration,request]=v.split('/');return {configuration,request,...evaluateCloud(request,configuration)};}):await Promise.all(state.observations.map(async copy=>({copy,...await compareEvidence(copy)})));
  return {schema:'biuret-cloud-dfir-practice-v1',kind,language:language==='ar'?'ar':'en',...state,results,
    scope:'Local synthetic practice. Not a provider policy evaluator, legal evidence, graded exam or credential.'};
}
