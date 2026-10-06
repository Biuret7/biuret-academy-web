import { adminReportQueue, adminReportDetail, adminReviewReport, user } from './auth.js?v=20261006-free1';
import { currentLanguage } from './i18n.js?v=20261006-free1';
import { reportLabels, reviewStatus, reportPathName, escReport as esc, reportError, reportHistoryHTML } from './report-review-ui.js?v=20261006-free1';

const t = (ar,en) => currentLanguage() === 'ar' ? ar : en;
let owner, state = { items: [], nextCursor: null }, selected = null, cursor, previous = [], loaded = false, message = '', busy = false;
let generation=0, repaint=()=>{};
const drafts = new Map();
export function attachAdminReports(root) {
  if (!user()) return;
  if (owner !== user().$id) { generation++; owner = user().$id; state = {items:[],nextCursor:null}; selected=null; cursor=undefined; previous=[]; loaded=false; busy=false; message=''; drafts.clear(); }
  const session=generation, panelOwner=owner;
  const section=document.createElement('section'); section.className='assessment-card report-admin'; root.querySelector('.assessment-body')?.prepend(section);
  const valid=()=>generation===session && user()?.$id===panelOwner;
  const current=()=>section.isConnected && valid();
  function render() {
    if (!current()) return;
    const draft = selected && (drafts.get(selected.id) || { decision:'changes_requested', feedback:'', scores:{} });
    section.innerHTML=`<span class="section-kicker">PRACTICAL / REVIEW</span><h2>${t('مراجعة التقارير العملية','Practical report review')}</h2><p>${t('أحدث التسليمات، مع سجل محفوظ لكل نسخة. هذه مراجعة تعليمية مستقلة عن الشهادات. لا تراجع تقريرك بنفسك.','Recent submissions, with a saved history for each copy. This educational review is separate from certificates. You cannot review your own report.')}</p><div class="report-queue">${state.items.map(item=>`<button type="button" class="report-queue-item" data-report-id="${esc(item.id)}"><strong>${esc(item.holderName)}</strong><span><bdi>${esc(reportPathName(item.pathId))}</bdi> · ${t('نسخة','Version')} ${item.revision}</span><span>${t(...reviewStatus(item.status))}${!item.current ? t(' · نسخة سابقة',' · Previous copy') : ''}</span></button>`).join('') || `<p>${loaded ? t('لا توجد تسليمات في هذه الصفحة.','No submissions on this page.') : t('جارٍ تحميل التسليمات…','Loading submissions…')}</p>`}</div><div class="report-actions"><button type="button" class="button button-outline" data-queue-refresh ${busy?'disabled':''}>${t('تحديث','Refresh')} ↻</button><button type="button" class="button button-outline" data-queue-back ${busy||!previous.length?'disabled':''}>${t('السابق','Previous')}</button><button type="button" class="button button-outline" data-queue-next ${busy||!state.nextCursor?'disabled':''}>${t('التالي','Next')}</button></div>${selected ? `<div class="report-detail"><h3>${esc(selected.holderName)} · <bdi>${esc(reportPathName(selected.pathId))}</bdi></h3>${reportHistoryHTML([selected],true)}${selected.current && selected.status==='pending' && !selected.selfReview ? `<form class="report-review-form"><h3>${t('تقييم النسخة','Review this copy')}</h3><p>${t('٠: غير مدعوم، ١: جزئي، ٢: قابل لإعادة التحقق. القبول يحتاج ٦/٨ دون أي صفر؛ اشرح الأدلة والتحسين المطلوب.','0: unsupported, 1: partial, 2: reconstructable. Acceptance requires 6/8 with no zero; explain the evidence and needed improvements.')}</p><div class="report-score-fields">${Object.entries(reportLabels).map(([field,pair])=>`<label>${t(...pair)}<select name="${field}" required><option value="">${t('اختر الدرجة','Choose score')}</option>${[0,1,2].map(score=>`<option value="${score}" ${draft.scores[field]===score?'selected':''}>${score}/2</option>`).join('')}</select></label>`).join('')}</div><label>${t('قرار المراجعة','Review decision')}<select name="decision"><option value="changes_requested" ${draft.decision==='changes_requested'?'selected':''}>${t('طلب تعديلات','Request changes')}</option><option value="accepted" ${draft.decision==='accepted'?'selected':''}>${t('قبول التقرير','Accept report')}</option></select></label><label>${t('ملاحظات واضحة للمتعلم','Clear feedback for the learner')}<textarea name="feedback" minlength="20" maxlength="2000" rows="5" required dir="auto">${esc(draft.feedback)}</textarea></label><p>${t('القرار يُحفظ باسمك لهذه النسخة ولا يمكن استبداله. مراجعة نسخة معدلة تسجل قراراً جديداً.','The decision is saved under your name for this copy and cannot be replaced. A revised copy receives a new review.')}</p><button type="submit" class="button button-primary" ${busy?'disabled':''}>${t('حفظ وإرسال الملاحظات','Save and send feedback')} ↗</button></form>` : `<p>${selected.selfReview ? t('هذه نسختك؛ تحتاج مراجعاً آخر.','This is your copy; another reviewer is required.') : !selected.current ? t('افتح أحدث نسخة للمراجعة.','Open the latest copy to review.') : t('تمت مراجعة هذه النسخة.','This copy has already been reviewed.')}</p>`}</div>` : ''}<p role="status">${esc(message)}</p>`;
  }
  async function load() {
    if (busy) return; busy=true; message=''; render();
    try { const value=await adminReportQueue(cursor); if(valid()){state=value;loaded=true;} }
    catch(error){if(valid()){message=reportError(error);loaded=true;}}
    finally{if(valid()){busy=false;repaint();}}
  }
  function saveDraft(form) {
    if(!selected || !form) return;
    const values=new FormData(form), scores={};
    for(const field of Object.keys(reportLabels)){ const value=values.get(field); if(value!=='') scores[field]=Number(value); }
    drafts.set(selected.id,{decision:values.get('decision'),feedback:values.get('feedback')||'',scores});
  }
  section.addEventListener('input',event=>saveDraft(event.target.closest('.report-review-form')));
  section.addEventListener('change',event=>saveDraft(event.target.closest('.report-review-form')));
  section.addEventListener('click',async event=>{
    if(busy||!current())return;
    const button=event.target.closest('[data-report-id]');
    if(button){busy=true;message='';render();try{const value=await adminReportDetail(button.dataset.reportId);if(valid())selected=value;}catch(error){if(valid())message=reportError(error);}finally{if(valid()){busy=false;repaint();}}return;}
    if(event.target.closest('[data-queue-next]')&&state.nextCursor){previous.push(cursor);cursor=state.nextCursor;selected=null;return load();}
    if(event.target.closest('[data-queue-back]')&&previous.length){cursor=previous.pop();selected=null;return load();}
    if(event.target.closest('[data-queue-refresh]')){selected=null;return load();}
  });
  section.addEventListener('submit',async event=>{
    event.preventDefault(); event.stopPropagation(); if(busy||!current()||!selected||!event.target.reportValidity())return;
    saveDraft(event.target);const draft=drafts.get(selected.id), id=selected.id;busy=true;message='';render();
    try{const value=await adminReviewReport(id,draft.decision,draft.scores,draft.feedback);if(valid()){selected=value;state.items=state.items.map(item=>item.id===id?value:item);drafts.delete(id);message=t('حُفظ القرار ووصلت الملاحظات إلى سجل المتعلم.','Decision saved; feedback is available in the learner’s history.');}}
    catch(error){if(valid())message=reportError(error);}
    finally{if(valid()){busy=false;repaint();}}
  });
  repaint=render; render(); if(!loaded)void load();
}
