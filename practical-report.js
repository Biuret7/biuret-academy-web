import { practicalDraft, practicalReport } from './practical-report-model.js?v=20261006-soccase1';
import { user } from './auth.js?v=20261006-soccase1';
import { currentLanguage } from './i18n.js?v=20261006-soccase1';
import { attachReportSubmission } from './report-review-ui.js?v=20261006-soccase1';

const labels={evidence:['الدليل: المعرف والمصدر والوقت','Evidence: ID, source and time'],reasoning:['القرار: كيف يبرره الدليل؟','Decision: how does the evidence support it?'],limits:['الحدود: ما الذي لم تثبته العينة؟','Limits: what did the sample not establish?'],retest:['إعادة الاختبار: السماح والرفض والنتيجة المتوقعة','Retest: allowed/denied cases and expected outcome']};
export function attachPracticalReport(root,pathId,eligible = false) {
  const owner=user()?.$id;
  if (!owner || root.querySelector('.practical-report') || !root.querySelector('.assessment-body')) return;
  const ar=currentLanguage()==='ar',t=(a,e)=>ar?a:e,key=`biuret-practical-report-v1:${owner}:${pathId}`;
  let draft=practicalDraft(),storageAvailable=true;
  try{draft=practicalDraft(JSON.parse(localStorage.getItem(key)||'{}'));}catch{storageAvailable=false;}
  const section=document.createElement('section');section.className='assessment-card practical-report';
  section.innerHTML=`<span class="section-kicker">PRACTICAL / SELF REVIEW</span><h2>${t('جهّز تقريراً عن تحليلك','Prepare a report of your analysis')}</h2><p>${t('اختيار القرار يفحص فهم العينة، ولا يثبت تشغيل الأدوات بصورة مستقلة. اربط قرارك بالدليل وحدوده، ثم جهّز تقريرك للمراجعة.','Selecting a decision checks sample understanding, not independent tool execution. Link your decision to evidence and its limits, then prepare your report for review.')}</p><div class="practical-report-fields"></div><p class="muted">${t('مسودتك محلية ولا تُرسل إلا عند اختيار إرسال للمراجعة والموافقة عليه. التنزيل لا يرسلها ولا يفتح الشهادة. لا تكتب أسراراً أو بيانات أشخاص.','Your draft is local until you explicitly choose and consent to submit it for review. Downloading does not send it or unlock a certificate. Omit secrets and personal data.')}</p><button class="button button-outline" type="button">${t('تنزيل مسودة التقرير','Download report draft')} ↧</button><p role="status" class="muted practical-report-status"></p>`;
  const container=section.querySelector('.practical-report-fields'),status=section.querySelector('.practical-report-status');
  for(const [field,label] of Object.entries(labels)){
    const group=document.createElement('label');group.textContent=label[ar?0:1];
    const input=document.createElement('textarea');input.name=field;input.rows=3;input.maxLength=4000;input.value=draft[field];input.dir='auto';
    input.addEventListener('input',()=>{draft[field]=input.value;try{localStorage.setItem(key,JSON.stringify(practicalDraft(draft)));status.textContent=t('حُفظت المسودة في هذا المتصفح','Draft saved in this browser');}catch{storageAvailable=false;status.textContent=t('تعذر الحفظ المحلي؛ نزّل المسودة قبل المغادرة','Local saving unavailable; download before leaving');}});
    group.append(input);container.append(group);
  }
  if(!storageAvailable)status.textContent=t('الحفظ المحلي غير متاح؛ يمكنك التنزيل','Local saving unavailable; download remains available');
  section.querySelector('button').addEventListener('click',()=>{
    const report=practicalReport(draft,pathId,currentLanguage()),url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=`biuret-practical-${pathId}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent=t('المسودة للتقييم الذاتي؛ لم تُرسل للمراجعة','Self-review draft; not submitted for review');
  });
  root.querySelector('.assessment-body').append(section);
  attachReportSubmission(section,pathId,()=>practicalDraft(draft),eligible);
}
