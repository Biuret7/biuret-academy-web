import { pilotTasks, pilotResults, cleanPilot, pilotSummary, pilotReport } from './pilot-model.js?v=20261009-ux2';
import { user, loadUser } from './auth.js?v=20261009-ux2';
import { fullName } from './full-name.js?v=20261009-ux2';
import { currentLanguage, setPageHeaderTitle } from './i18n.js?v=20261009-ux2';

const root = document.querySelector('#pilot-main');
const tr = (ar, en) => currentLanguage() === 'ar' ? ar : en;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[c]);
const labels = { untried: ['لم أجرب بعد', 'Not tried'], independent: ['أنجزتها دون مساعدة', 'Completed without help'], help: ['احتجت إلى مساعدة', 'Needed help'], blocked: ['توقفت بسبب مشكلة', 'Blocked by a problem'], locked: ['المحتوى مقفل لحسابي', 'Content locked for my account'] };
let owner = null, observations = cleanPilot({}), storageFailed = false;
const key = () => `biuret-learning-pilot-v1:${owner}`;
function ready() { return owner && user()?.$id === owner && fullName(user()?.name); }
function saveStatus() {
  const target = root.querySelector('[data-pilot-save]');
  if (target) target.textContent = storageFailed ? tr('تعذر الحفظ في المتصفح. نزّل التقرير قبل المغادرة.', 'Browser storage unavailable. Download your report before leaving.') : tr('محفوظ لحسابك في هذا المتصفح فقط. لا يُرسل تلقائياً.', 'Saved only for your account in this browser. Nothing is submitted automatically.');
}
function save() {
  try { localStorage.setItem(key(), JSON.stringify(observations)); storageFailed = false; } catch { storageFailed = true; }
  updateSummary(); saveStatus();
}
function updateSummary() {
  const result = pilotSummary(observations);
  root.querySelector('[data-pilot-count]').textContent = tr(`${result.recorded} من ${result.total} خطوات لها ملاحظات`, `${result.recorded} of ${result.total} steps recorded`);
  root.querySelector('[data-pilot-progress]').value = result.recorded;
  root.querySelector('[data-pilot-issues]').textContent = tr(`${result.blockers} عوائق · ${result.locks} خطوات مقفلة`, `${result.blockers} blockers · ${result.locks} locked steps`);
}
function render() {
  if (!ready()) { root.replaceChildren(); return; }
  setPageHeaderTitle({ar:'تجربة رحلة التعلّم', en:'Learning journey trial'});
  const language = currentLanguage();
  root.innerHTML = `<section class="catalog-hero section-frame"><a class="learning-back" href="review.html">${tr('المراجعة الذكية', 'Smart review')} ↗</a><span class="section-kicker">BIURET / LEARNING TRIAL</span><h1>${tr('جرّب الرحلة، وقل لنا أين تعثّرت.', 'Try the journey. Tell us where you got stuck.')}</h1><p>${tr('ابدأ بالأساسيات، ثم انتقل إلى SOC إن كان متاحاً لحسابك. افتح الخطوة في تبويب آخر، جرّبها، ثم عد وسجّل ملاحظتك. يمكنك التوقف والعودة لاحقاً.', 'Start with Foundations, then try SOC if available to your account. Open a step in another tab, try it, then return and record an observation. You can pause and return later.')}</p></section><section class="catalog-body section-frame pilot-body" dir="${language === 'ar' ? 'rtl' : 'ltr'}"><div class="pilot-overview"><div><strong data-pilot-count></strong><progress data-pilot-progress max="${pilotTasks.length}" aria-label="${tr('الخطوات المسجلة', 'Recorded steps')}"></progress><small data-pilot-issues></small></div><a class="button button-outline" href="#pilot-export">${tr('تنزيل ملاحظاتي', 'Download my observations')}</a></div><p class="library-note">${tr('هذه تجربة لتحسين الاستخدام وليست اختبار نجاح أو شهادة. لا تغيّر تقدمك أو XP أو صلاحيات الوصول. اكتب موضع المشكلة وما توقّعته وما حدث، دون أسماء أو كلمات مرور أو بيانات شخصية.', 'This is a usability trial, not a pass/fail exam or credential. It does not change progress, XP or access. Describe the problem location, what you expected and what happened, without names, passwords or personal data.')}</p><nav class="lesson-section-nav" aria-label="${tr('أقسام التجربة', 'Trial sections')}"><a href="#pilot-foundations">${tr('١ · الأساسيات', '1 · Foundations')}</a><a href="#pilot-soc">${tr('٢ · SOC', '2 · SOC')}</a></nav>${['foundations','soc'].map(group => `<section id="pilot-${group}" class="library-section"><h2>${group === 'foundations' ? tr('الأساسيات المجانية', 'Free Foundations') : tr('التخصص: مركز العمليات الأمنية SOC', 'Specialty: Security Operations Center (SOC)')}</h2>${group === 'soc' ? `<p>${tr('القفل المتوقع ليس خطأً تلقائياً. ميّز بين قفل واضح بسبب المتطلبات، وقفل غير مفهوم أو يمنع محتوى يفترض أن يكون متاحاً.', 'An expected access lock is not automatically a defect. Distinguish clear prerequisites from an unexplained lock or one preventing content that should be available.')}</p>` : ''}<ol class="pilot-task-list">${pilotTasks.filter(task => task.group === group).map(task => `<li class="pilot-task"><div class="pilot-task-heading"><h3>${esc(task.title[language === 'ar' ? 0 : 1])}</h3><a class="button button-outline" href="${task.href}" target="_blank" rel="noopener">${tr('افتح الخطوة في تبويب آخر', 'Open step in another tab')} ↗</a></div><p>${esc(task.prompt[language === 'ar' ? 0 : 1])}</p><label for="result-${task.id}">${tr('كيف كانت تجربتك؟', 'How did it go?')}</label><select id="result-${task.id}" data-task="${task.id}" data-field="result">${pilotResults.map(value => `<option value="${value}" ${observations[task.id].result === value ? 'selected' : ''}>${labels[value][language === 'ar' ? 0 : 1]}</option>`).join('')}</select><div class="pilot-measures"><label for="minutes-${task.id}">${tr('الوقت التقريبي بالدقائق (اختياري)', 'Approximate minutes (optional)')}<input id="minutes-${task.id}" data-task="${task.id}" data-field="minutes" type="number" min="0" max="240" step="0.5" value="${observations[task.id].minutes ?? ''}"></label><label for="confidence-${task.id}">${tr('ثقتك بشرح القرار (اختياري)', 'Confidence explaining the decision (optional)')}<select id="confidence-${task.id}" data-task="${task.id}" data-field="confidence"><option value="">${tr('لم أقيم بعد', 'Not rated')}</option>${[1,2,3,4,5].map(n => `<option value="${n}" ${observations[task.id].confidence === n ? 'selected' : ''}>${n} / 5</option>`).join('')}</select></label></div><label for="note-${task.id}">${tr('ما الذي كان واضحاً؟ وأين احتجت إلى توضيح؟', 'What was clear? Where did you need clarification?')}</label><textarea id="note-${task.id}" data-task="${task.id}" data-field="note" rows="3" maxlength="2000" placeholder="${tr('مثال: لم أعرف إن كان الزر يبدأ محاولة امتحان أو يعرض الشروط…', 'Example: I could not tell whether the button starts an exam attempt or shows the rules…')}">${esc(observations[task.id].note)}</textarea></li>`).join('')}</ol></section>`).join('')}<section class="pilot-export library-section" id="pilot-export"><h2>${tr('احتفظ بالملاحظات لنراجعها معاً', 'Keep your observations for review')}</h2><p>${tr('نزّل تقرير JSON ثم أرفقه في هذه المحادثة. لا يتضمن التقرير اسمك أو بريدك أو معرّف حسابك تلقائياً؛ راجع النص الذي كتبته قبل مشاركته. سنرتّب الإصلاحات حسب أثرها على التعلّم.', 'Download the JSON report and attach it to this conversation. Your name, email and account ID are not automatically included; review your written text before sharing. We will prioritize fixes by their impact on learning.')}</p><button class="button button-primary" data-pilot-export type="button">${tr('تنزيل تقرير التجربة', 'Download trial report')}</button><p data-pilot-save role="status"></p></section></section>`;
  updateSummary(); saveStatus();
}
async function initialize() {
  if (!user()) { try { await loadUser(); } catch {} }
  const nextOwner = user()?.$id || null;
  if (nextOwner !== owner) {
    owner = nextOwner; observations = cleanPilot({}); storageFailed = false;
    if (owner) { try { observations = cleanPilot(JSON.parse(localStorage.getItem(key()) || '{}')); } catch { storageFailed = true; } }
  }
  render();
}
root.addEventListener('input', event => {
  if (!ready()) return;
  const { task, field } = event.target.dataset;
  if (!observations[task] || !['result', 'note', 'minutes', 'confidence'].includes(field)) return;
  observations[task][field] = event.target.value; observations = cleanPilot(observations); save();
});
root.addEventListener('click', event => {
  if (!ready() || !event.target.closest('[data-pilot-export]')) return;
  const report = pilotReport(observations, currentLanguage());
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], {type:'application/json'}));
  const link = document.createElement('a'); link.href = url; link.download = 'biuret-learning-trial.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.querySelector('#language-toggle')?.addEventListener('click', () => setTimeout(render, 0));
window.addEventListener('biuret-auth-changed', initialize);
initialize();
