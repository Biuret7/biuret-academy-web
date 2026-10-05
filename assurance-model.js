// Supplied facts for a synthetic supplier-review exercise, not a real audit.
export const assurancePractice = Object.freeze({index:7,path:'path_grc',course:'desktop-19',title:{ar:'مراجعة المورّد: النطاق والدليل وقرار المتابعة',en:'Supplier review: scope, evidence and follow-up'}});
export const supplierReviewAt = Date.parse('2026-11-30T10:00:00Z');
export const supplierCases = Object.freeze({
  'wrong-scope': {service:'storage',control:'encryption',period:'2026-11',evidenceAt:'2026-11-29T10:00:00Z',allowedTest:true,deniedTest:true,owner:'service-owner',authorized:true,expires:'2026-12-02T10:00:00Z'},
  expired: {service:'mail-api',control:'session-revocation',period:'2026-11',evidenceAt:'2026-11-29T10:00:00Z',allowedTest:true,deniedTest:true,owner:'service-owner',authorized:true,expires:'2026-11-30T10:00:00Z'},
  supported: {service:'mail-api',control:'session-revocation',period:'2026-11',evidenceAt:'2026-11-29T10:00:00Z',allowedTest:true,deniedTest:true,owner:'service-owner',authorized:true,expires:'2026-12-02T10:00:00Z'},
});
export function assessSupplier(id){
  if(!Object.hasOwn(supplierCases,id))throw new TypeError('Unknown supplier case');
  const c=supplierCases[id],age=supplierReviewAt-Date.parse(c.evidenceAt);
  const scopeMatches=c.service==='mail-api'&&c.control==='session-revocation'&&c.period==='2026-11';
  const fresh=Number.isFinite(age)&&age>=0&&age<=7*86400000;
  const tested=c.allowedTest===true&&c.deniedTest===true;
  const activeDecision=Boolean(c.owner&&c.authorized&&Date.parse(c.expires)>supplierReviewAt);
  return {id,scopeMatches,fresh,tested,activeDecision,decision:scopeMatches&&fresh&&tested&&activeDecision?'review-ready':'open-gap',scope:'One synthetic requirement only; evidence matching and owned decision do not establish supplier-wide or legal compliance.'};
}
export function supplierState(raw){
  const s=raw&&typeof raw==='object'?raw:{};
  return {observations:[...new Set((Array.isArray(s.observations)?s.observations:[]).filter(id=>Object.hasOwn(supplierCases,id)))],reasoning:typeof s.reasoning==='string'?s.reasoning.slice(0,4000):''};
}
export function supplierReport(raw,language){
  const s=supplierState(raw);
  return {schema:'biuret-supplier-practice-v1',language:language==='ar'?'ar':'en',...s,results:s.observations.map(assessSupplier),scope:'Local synthetic facts, not external verification. No automatic identity, XP, credential or written-report grading.'};
}
