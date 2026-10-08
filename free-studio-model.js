import { studioUnits, studioCases } from './free-studio-content.js?v=20261008-ux1';

const unitIds = new Set(studioUnits.map(u => u.id));
const caseIds = new Set(studioCases.map(c => c.id));
const text = value => typeof value === 'string' ? value.slice(0,4000) : '';
const date = value => Number.isFinite(value) && value >= 0 && value <= 8640000000000000 ? value : 0;
export function studioStorageKey(owner) {
  if (typeof owner !== 'string' || !owner.trim() || owner === 'guest') return null;
  return `biuret-free-studio-v1:${encodeURIComponent(owner)}`;
}
export function cleanStudio(value) {
  const state = { units:{}, cases:{}, portfolio:{}, pace:20 };
  if (!value || typeof value !== 'object') return state;
  if ([10,20,30].includes(value.pace)) state.pace=value.pace;
  for (const id of unitIds) {
    const row = value.units?.[id]; if (!row || typeof row !== 'object') continue;
    const check = studioUnits.find(u=>u.id===id);
    state.units[id]={ note:text(row.note), answer:Number.isInteger(row.answer)&&row.answer>=0&&row.answer<check.options.length?row.answer:null,
      confidence:[1,2,3].includes(row.confidence)?row.confidence:1, reviewedAt:date(row.reviewedAt), due:date(row.due) };
  }
  for (const id of caseIds) {
    const row = value.cases?.[id]; if (!row || typeof row !== 'object') continue;
    state.cases[id]={variant:row.variant===1?1:0, answer:text(row.answer), note:text(row.note)};
  }
  for (const field of ['scope','evidence','finding','limitations','action','validation']) state.portfolio[field]=text(value.portfolio?.[field]);
  return state;
}
export function recordRecall(state, id, answer, confidence, now=Date.now()) {
  const unit=studioUnits.find(u=>u.id===id);
  if (!unit || !Number.isInteger(answer) || answer<0 || answer>=unit.options.length || ![1,2,3].includes(confidence)) return null;
  const next=cleanStudio(state), correct=answer===unit.answer;
  const days=correct ? [1,3,7][confidence-1] : 0;
  next.units[id]={...next.units[id],note:next.units[id]?.note||'',answer,confidence,reviewedAt:now,due:now+days*86400000};
  return {state:next,correct};
}
export function studioSummary(state, now=Date.now()) {
  const s=cleanStudio(state);
  const checked=studioUnits.filter(u=>s.units[u.id]?.answer===u.answer);
  const due=studioUnits.filter(u=>!s.units[u.id]?.reviewedAt || s.units[u.id].due<=now);
  const next=due[0] || studioUnits.find(u=>!checked.includes(u)) || studioUnits[0];
  return {checked:checked.length,total:studioUnits.length,due:due.length,next:next.id,
    cases:studioCases.filter(c=>gradeStudioCase(c.id,s.cases[c.id]?.variant,s.cases[c.id]?.answer)).length};
}
export function gradeStudioCase(id, variant, answer) {
  const exercise=studioCases.find(c=>c.id===id);
  if (!exercise || ![0,1].includes(variant) || typeof answer!=='string' || !answer.trim()) return false;
  return answer.trim().toLowerCase()===exercise.variants[variant].expected;
}
export function permissionMode(bits) {
  if (!Array.isArray(bits) || bits.length!==9 || bits.some(x=>typeof x!=='boolean')) return null;
  return [0,3,6].map(offset=>bits.slice(offset,offset+3).reduce((sum,bit,i)=>sum+(bit?[4,2,1][i]:0),0)).join('');
}
export function studioExport(state,language='ar') {
  const s=cleanStudio(state);
  return {version:'free-studio-20261006',language:language==='en'?'en':'ar',
    notice:language==='en'?'Personal formative practice. Not a certificate or verified Academy assessment. Notes may contain information you entered; inspect before sharing.':'تدريب شخصي للمراجعة. ليس شهادة أو تقييماً موثقاً للأكاديمية. راجع ما أدخلته في الملاحظات قبل المشاركة.',
    units:studioUnits.map(u=>({topic:u.title, note:s.units[u.id]?.note||'', practiceCorrect:s.units[u.id]?.answer===u.answer})),
    cases:studioCases.map(c=>({title:c.title,sample:c.variants[s.cases[c.id]?.variant||0].sample,note:s.cases[c.id]?.note||'',
      extractionCorrect:gradeStudioCase(c.id,s.cases[c.id]?.variant,s.cases[c.id]?.answer)})),
    portfolio:s.portfolio};
}
