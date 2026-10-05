// Synthetic practice only. These rules are not an Android runtime, attribution
// engine, compliance certification or a graded credential assessment.
export const specialistPractices = Object.freeze({
  mobile: {index:2,path:'path_mobile',course:'desktop-14',title:{ar:'حدود تطبيق الهاتف وتفويض البيانات',en:'Mobile boundaries and data authorization'}},
  intel: {index:6,path:'path_threat_intel',course:'desktop-15',title:{ar:'استقلال المصادر وحدود الإسناد',en:'Source independence and attribution limits'}},
  grc: {index:7,path:'path_grc',course:'desktop-1',title:{ar:'أدلة الضوابط وقرارات المخاطر',en:'Control evidence and risk decisions'}},
});
export function specialistVariant(index,context){return Object.hasOwn(specialistPractices,context)&&specialistPractices[context].index===index?context:null;}
export const mobileRequests=Object.freeze([
  {id:'owner',actor:'A',owner:'A',authenticated:true},
  {id:'other',actor:'A',owner:'B',authenticated:true},
  {id:'signed-out',actor:null,owner:'B',authenticated:false},
]);
export function mobileDecision(id,configuration){
  const r=mobileRequests.find(v=>v.id===id);
  if(!r||!['before','after'].includes(configuration))throw new TypeError('Unknown mobile case');
  const allowed=r.authenticated&&(configuration==='before'||r.actor===r.owner);
  return {id,configuration,allowed,status:!r.authenticated?401:allowed?200:403,recordData:allowed,
    intended:r.authenticated&&r.actor===r.owner,reason:!r.authenticated?'no-session':allowed?'allow':'not-owner'};
}
export const sourceCases=Object.freeze({
  copies:[{id:'A',origin:'O1',stance:'supports'},{id:'B',origin:'O1',stance:'supports'},{id:'C',origin:'O1',stance:'supports'}],
  independent:[{id:'A',origin:'O1',stance:'supports'},{id:'B',origin:'O2',stance:'supports'},{id:'C',origin:'O1',stance:'supports'}],
  conflict:[{id:'A',origin:'O1',stance:'supports'},{id:'B',origin:'O2',stance:'contradicts'},{id:'C',origin:'O1',stance:'supports'}],
});
export function assessSources(id){
  if(!Object.hasOwn(sourceCases,id))throw new TypeError('Unknown source case');
  const rows=sourceCases[id],support=[...new Set(rows.filter(v=>v.stance==='supports').map(v=>v.origin))],against=[...new Set(rows.filter(v=>v.stance==='contradicts').map(v=>v.origin))];
  return {id,independentSupport:support.length,contradictingOrigins:against.length,decision:against.length?'unresolved':support.length>=2?'corroborated':'single-origin',attribution:'unestablished'};
}
export const reviewAt=Date.parse('2026-10-05T10:00:00Z');
export const controlCases=Object.freeze({
  policy:{design:true,deployed:false,testsPassed:false,owner:null,acceptance:null,evidenceAt:null},
  tested:{design:true,deployed:true,testsPassed:true,owner:'risk-owner-A',acceptance:'approve',evidenceAt:'2026-10-05T09:00:00Z',expires:'2026-10-12T10:00:00Z'},
  expired:{design:true,deployed:true,testsPassed:true,owner:'risk-owner-A',acceptance:'approve',evidenceAt:'2026-09-01T09:00:00Z',expires:'2026-10-04T10:00:00Z'},
});
export function assessControl(id){
  if(!Object.hasOwn(controlCases,id))throw new TypeError('Unknown control case');
  const c=controlCases[id],age=reviewAt-Date.parse(c.evidenceAt),fresh=Number.isFinite(age)&&age>=0&&age<=7*86400000,
    activeAcceptance=!!c.owner&&c.acceptance==='approve'&&Date.parse(c.expires)>reviewAt;
  const verified=c.design&&c.deployed&&c.testsPassed&&fresh;
  return {id,design:c.design,verified,fresh,activeAcceptance,decision:verified&&activeAcceptance?'review-ready':'open-gap',
    scope:'One report-service control; seven-day synthetic evidence policy. Not organization-wide assurance or certification.'};
}
export function sanitizeSpecialist(raw,kind){
  if(!Object.hasOwn(specialistPractices,kind))throw new TypeError('Unknown practice');
  const s=raw&&typeof raw==='object'?raw:{},choices=kind==='mobile'?['before','after'].flatMap(c=>mobileRequests.map(r=>`${c}/${r.id}`)):Object.keys(kind==='intel'?sourceCases:controlCases);
  return {configuration:s.configuration==='after'?'after':'before',observations:[...new Set((Array.isArray(s.observations)?s.observations:[]).filter(v=>choices.includes(v)))],reasoning:typeof s.reasoning==='string'?s.reasoning.slice(0,4000):''};
}
export function specialistReport(raw,kind,language){
  const s=sanitizeSpecialist(raw,kind),results=s.observations.map(v=>kind==='mobile'?mobileDecision(v.split('/')[1],v.split('/')[0]):kind==='intel'?assessSources(v):assessControl(v));
  return {schema:'biuret-specialist-practice-v1',kind,language:language==='ar'?'ar':'en',...s,results,scope:'Local synthetic practice; no automatic identity fields, XP, credential or manual-report grading.'};
}
