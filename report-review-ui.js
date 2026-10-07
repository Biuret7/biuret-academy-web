import { loadReportReview, submitReportReview, user } from './auth.js?v=20261007-stable1';
import { currentLanguage } from './i18n.js?v=20261007-stable1';

export const reportLabels = { evidence: ['الدليل', 'Evidence'], reasoning: ['التبرير', 'Reasoning'], limits: ['الحدود', 'Limits'], retest: ['إعادة الاختبار', 'Retest'] };
const pathNames={foundations:['أساسيات الأمن السيبراني','Cybersecurity Foundations'],path_pentest:['اختبار الاختراق المصرّح','Authorized penetration testing'],path_soc:['عمليات SOC','SOC operations'],path_dfir:['الأدلة الرقمية والاستجابة','Digital forensics and response'],path_cloud:['أمن السحابة','Cloud security'],path_grc:['الحوكمة والمخاطر والامتثال','Governance, risk and compliance'],path_appsec:['أمن التطبيقات وDevSecOps','Application security and DevSecOps'],path_mobile:['أمن تطبيقات الهاتف','Mobile application security'],path_threat_intel:['استخبارات التهديدات وOSINT','Threat intelligence and OSINT'],path_malware:['تحليل البرمجيات الخبيثة والهندسة العكسية','Malware analysis and reverse engineering']};
export const reportPathName=id=>{const pair=pathNames[id];return pair?pair[currentLanguage()==='ar'?0:1]:id;};
export const reviewStatus = status => ({ pending: ['بانتظار المراجعة', 'Awaiting review'], accepted: ['قُبل التقرير', 'Report accepted'], changes_requested: ['تعديلات مطلوبة', 'Changes requested'] })[status] || ['غير مرسل', 'Not submitted'];
export const escReport = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const t = (ar, en) => currentLanguage() === 'ar' ? ar : en;
const errorTranslations = {
  'Complete report fields with 20–4000 characters': ['أكمل الحقول الأربعة، من ٢٠ إلى ٤٠٠٠ حرف لكل حقل.', 'Complete all four fields, 20–4000 characters each.'],
  'Report submission consent required': ['وافق على مشاركة هذا التقرير مع إدارة الأكاديمية.', 'Agree to share this report with Academy administrators.'],
  'Wait for review before resubmitting': ['انتظر المراجعة قبل إرسال نسخة أخرى.', 'Wait for review before resubmitting.'],
  'Report changed; reload before submitting': ['تغيرت نسخة التقرير. حدّث حالة المراجعة قبل الإرسال.', 'The report version changed. Refresh review status before submitting.'],
  'Report changed; reload before reviewing': ['تغيرت نسخة التقرير. حدّثها قبل المراجعة.', 'The report version changed. Refresh before reviewing.'],
  'Report already reviewed; reload to see the decision': ['تمت مراجعة هذه النسخة. حدّث الصفحة لرؤية القرار.', 'This version was reviewed. Refresh to see the decision.'],
  'A reviewer cannot review their own report': ['لا يمكنك مراجعة تقريرك بنفسك.', 'You cannot review your own report.'],
  'Report review is not configured': ['المراجعة غير متاحة الآن. مسودتك محفوظة ويمكن تنزيلها.', 'Review is unavailable. Your draft remains available to download.'],
  'Accepted reports need at least 6/8 with no zero criterion': ['القبول يتطلب ٦ من ٨ على الأقل دون معيار بدرجة صفر.', 'Acceptance requires at least 6/8 with no zero criterion.'],
  'Provide a decision, four scores and 20–2000 character feedback': ['حدد القرار والدرجات الأربع وملاحظات من ٢٠ إلى ٢٠٠٠ حرف.', 'Choose a decision, four scores and feedback of 20–2000 characters.'],
};
export function reportError(error) { const pair = errorTranslations[error?.message]; return pair ? t(...pair) : t('تعذر تنفيذ العملية. حافظ على مسودتك وحاول مجدداً.', 'The action failed. Keep your draft and try again.'); }
export function reportHistoryHTML(history,openLatest=false) {
  return history.map((item,index) => `<details class="report-history" ${index===0&&(openLatest||item.review)?'open':''}><summary>${t('النسخة', 'Version')} ${item.revision} · ${t(...reviewStatus(item.status))} · <bdi>${escReport(new Date(item.createdAt).toLocaleString(currentLanguage()))}</bdi></summary>${item.review ? `<div class="review-feedback"><strong>${t(...reviewStatus(item.review.decision))}</strong><p class="report-text" dir="auto">${escReport(item.review.feedback)}</p><p>${t('المراجع', 'Reviewer')}: ${escReport(item.review.reviewerName)} · ${Object.values(item.review.scores).reduce((a,b)=>a+b,0)}/8</p><ul>${Object.entries(reportLabels).map(([key,pair])=>`<li>${t(...pair)}: ${item.review.scores[key]}/2</li>`).join('')}</ul></div>` : ''}${Object.entries(reportLabels).map(([key, pair]) => `<h4>${t(...pair)}</h4><p class="report-text" dir="auto">${escReport(item.fields[key])}</p>`).join('')}</details>`).join('');
}

export function attachReportSubmission(section, pathId, getDraft, eligible) {
  const owner = user()?.$id;
  let state, busy = false, message = '', loading = false;
  const panel = document.createElement('div'); panel.className = 'report-submission'; section.append(panel);
  const current = () => section.isConnected && user()?.$id === owner;
  function render() {
    if (!current()) return;
    const canSubmit = eligible && state?.enabled && (!state.current || state.current.status === 'changes_requested') && (state.nextRevision || 1) <= 20;
    panel.innerHTML = `<h3>${t('مراجعة الإدارة', 'Administrator review')}</h3><p>${t('التسليم اختياري. عند الإرسال تُحفظ نسخة خاصة باسمك وحقول التقرير لتراها إدارة الأكاديمية. القبول لا يفتح الشهادة ولا يعد اعتماداً مهنياً.', 'Submission is optional. Sending stores a private copy with your name and report fields for Academy administrators. Acceptance does not unlock a certificate or confer professional accreditation.')}</p>${loading ? `<p role="status">${t('جارٍ تحميل حالة المراجعة…', 'Loading review status…')}</p>` : state?.enabled ? `<p class="review-state">${state.current ? t(...reviewStatus(state.current.status)) : t('لم ترسل تقريراً بعد', 'No report submitted yet')}</p>${canSubmit ? `<label class="report-consent"><input type="checkbox" id="report-consent">${t('أوافق على إرسال اسمي وهذه النسخة إلى إدارة الأكاديمية للمراجعة. راجعت النص وأزلت الأسرار وبيانات الآخرين.', 'I agree to send my name and this copy to Academy administrators for review. I checked the text and removed secrets and other people’s data.')}</label><button class="button button-primary" type="button" data-report-submit ${busy ? 'disabled' : ''}>${state.current ? t('إرسال نسخة معدلة', 'Submit revised copy') : t('إرسال للمراجعة', 'Submit for review')} ↗</button>` : `<p>${!eligible ? t('أكمل دروس المسار وامتحانات الدورات قبل التسليم.', 'Complete path lessons and course exams before submitting.') : state.current?.status === 'pending' ? t('نسختك محفوظة. يمكنك متابعة التعلّم إلى أن تصل الملاحظات.', 'Your copy is saved. Continue learning while you wait for feedback.') : state.current?.status === 'accepted' ? t('قُبل هذا التقرير. سجل المراجعة محفوظ أدناه.', 'This report was accepted. Its review history is below.') : t('وصلت إلى حد النسخ؛ تواصل مع الإدارة.', 'Revision limit reached; contact an administrator.')}</p>`}${reportHistoryHTML(state.history)}` : `<p>${t('المراجعة لم تُفعّل بعد؛ يمكنك حفظ مسودتك وتنزيلها.', 'Review is not enabled yet; save and download your draft.')}</p>`}<p role="status">${escReport(message)}</p><button class="button button-outline" type="button" data-report-refresh ${busy || loading ? 'disabled' : ''}>${t('تحديث حالة المراجعة', 'Refresh review status')} ↻</button>`;
  }
  async function refresh() {
    if (busy || loading) return; loading = true; render();
    try { const value = await loadReportReview(pathId); if (current()) { state = value; message = ''; } }
    catch (error) { if (current()) message = reportError(error); }
    finally { loading = false; render(); }
  }
  panel.addEventListener('click', async event => {
    if (event.target.closest('[data-report-refresh]')) return refresh();
    if (!event.target.closest('[data-report-submit]') || busy || loading || !current()) return;
    const consent = panel.querySelector('#report-consent')?.checked === true;
    if (!consent) { message = t(...errorTranslations['Report submission consent required']); render(); return; }
    const fields = getDraft(), language = currentLanguage(), baseRevision = state.current?.revision || 0;
    busy = true; message = ''; render();
    try { const value = await submitReportReview(pathId, fields, language, baseRevision, consent); if (current()) { state = value; message = t('تم إرسال النسخة. يمكنك متابعة التعلم.', 'Copy submitted. You can continue learning.'); } }
    catch (error) { if (current()) message = reportError(error); }
    finally { busy = false; render(); }
  });
  void refresh();
}
