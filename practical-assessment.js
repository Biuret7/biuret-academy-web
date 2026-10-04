import { user, loadUser, loadPractical, submitPractical } from './auth.js?v=20261004-ux1';
import { currentLanguage, setPageHeaderTitle } from './i18n.js?v=20260929-1';

const root = document.querySelector('#practical-main');
const pathId = new URLSearchParams(location.search).get('id');
const names = {
  foundations: ['أساسيات الأمن السيبراني', 'Cybersecurity Foundations'],
  path_pentest: ['اختبار الاختراق المصرّح', 'Authorized penetration testing'],
  path_soc: ['عمليات SOC', 'SOC operations'],
  path_dfir: ['الأدلة الرقمية والاستجابة', 'Digital forensics and response'],
  path_cloud: ['أمن السحابة', 'Cloud security'],
  path_grc: ['الحوكمة والمخاطر والامتثال', 'Governance, risk and compliance'],
  path_appsec: ['أمن التطبيقات وDevSecOps', 'Application security and DevSecOps'],
  path_mobile: ['أمن تطبيقات الهاتف', 'Mobile application security'],
  path_threat_intel: ['استخبارات التهديدات وOSINT', 'Threat intelligence and OSINT'],
  path_malware: ['تحليل البرمجيات الخبيثة والهندسة العكسية', 'Malware analysis and reverse engineering'],
};
const tr = (ar, en) => currentLanguage() === 'en' ? en : ar;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let state, busy = false, feedback = '';
const next = () => pathId === 'foundations' ? 'exam.html' : `path-exam.html?id=${encodeURIComponent(pathId)}`;

function frame(body) {
  const title = names[pathId]?.[currentLanguage() === 'en' ? 1 : 0] || tr('تقييم عملي', 'Practical assessment');
  root.innerHTML = `<section class="assessment-hero section-frame"><a class="learning-back" href="paths.html">← ${tr('المسارات', 'Paths')}</a><span class="section-kicker">BIURET ACADEMY / PRACTICAL</span><h1>${esc(title)}</h1><p>${tr('ثلاث مهام مبنية على أدلة تدريبية آمنة. اختر قراراً مبرراً بالدليل في كل مهمة قبل الامتحان النهائي.', 'Three tasks based on safe training evidence. Make an evidence-led decision for each before the final exam.')}</p></section><section class="assessment-body section-frame">${body}</section>`;
}
function render() {
  if (!state) return;
  if (state.passed) return frame(`<div class="assessment-card success"><span class="section-kicker">PRACTICAL / PASSED</span><h2>${tr('أنجزت التقييم العملي', 'Practical assessment passed')}</h2><p>${tr('سُجلت المهام الثلاث في حسابك. الخطوة التالية هي امتحان المسار.', 'All three tasks are recorded in your account. Your next step is the path exam.')}</p><a class="button button-primary" href="${next()}">${tr('افتح امتحان المسار', 'Open path exam')} ↗</a></div>`);
  if (!state.ready) return frame(`<div class="assessment-card"><h2>${tr('أكمل خطوات التعلّم أولاً', 'Finish your learning steps first')}</h2><p>${pathId === 'foundations' ? tr('أكمل الدروس التسعة الموثقة لفتح هذه المهام.', 'Complete the nine verified lessons to unlock these tasks.') : tr('أكمل دروس كل دورات المسار واجتز امتحان كل دورة لفتح هذه المهام.', 'Complete every path course lesson and pass each course exam to unlock these tasks.')}</p><a class="button button-outline" href="${pathId === 'foundations' ? 'paths.html#foundations-roadmap' : 'courses.html'}">${tr('تابع التعلّم', 'Continue learning')} ↗</a></div>`);
  const tasks = state.tasks.map((task, i) => `<fieldset class="practical-task"><legend>${String(i + 1).padStart(2, '0')} · ${esc(task.question)}</legend><pre class="practical-artifact" dir="auto">${esc(task.artifact)}</pre>${task.options.map((option, index) => `<label><input type="radio" name="${esc(task.id)}" value="${index}" required><span>${esc(option)}</span></label>`).join('')}</fieldset>`).join('');
  frame(`<div class="assessment-card"><h2>${tr('حلل الدليل ثم قرر', 'Analyze the evidence, then decide')}</h2><p>${tr('يجب أن تكون القرارات الثلاثة صحيحة. يمكنك العودة للمختبرات والمراجعة ثم المحاولة مجدداً.', 'All three decisions must be correct. Review the labs and retry whenever you are ready.')}</p><a href="labs.html">${tr('راجع المختبرات', 'Review labs')} ↗</a>${feedback ? `<p class="answer-feedback" role="status">${esc(feedback)}</p>` : ''}<form id="practical-form" class="practice-form">${tasks}<button class="button button-primary" type="submit" ${busy ? 'disabled' : ''}>${tr('سلّم القرارات', 'Submit decisions')} ↗</button></form></div>`);
}
async function refresh() {
  if (!names[pathId]) { frame(`<div class="assessment-card"><h2>${tr('المسار غير موجود', 'Path not found')}</h2></div>`); return; }
  setPageHeaderTitle({ ar: names[pathId][0], en: names[pathId][1] });
  if (!user()) await loadUser();
  if (!user()) { frame(`<div class="assessment-card"><h2>${tr('سجّل الدخول للمتابعة', 'Sign in to continue')}</h2><button class="button button-primary" id="practical-signin" type="button">${tr('تسجيل الدخول', 'Sign in')}</button></div>`); return; }
  frame(`<div class="assessment-card"><h2>${tr('جارٍ تحميل المهام…', 'Loading tasks…')}</h2></div>`);
  try { state = await loadPractical(pathId, currentLanguage()); render(); }
  catch (error) { frame(`<div class="assessment-card"><h2>${tr('تعذر فتح التقييم', 'Assessment unavailable')}</h2><p>${esc(error.message)}</p><button class="button button-outline" id="practical-retry" type="button">${tr('إعادة المحاولة', 'Retry')}</button></div>`); }
}
root?.addEventListener('click', (event) => {
  if (event.target.closest('#practical-signin')) document.querySelector('#account-button')?.click();
  if (event.target.closest('#practical-retry')) refresh();
});
root?.addEventListener('submit', async (event) => {
  if (event.target.id !== 'practical-form' || busy) return;
  event.preventDefault();
  const answers = Object.fromEntries([...new FormData(event.target)].map(([key, value]) => [key, Number(value)]));
  busy = true;
  try {
    const result = await submitPractical(pathId, answers);
    feedback = result.passed ? '' : `${tr('النتيجة', 'Score')}: ${result.score}/${result.total}. ${tr('راجع الدليل وحاول مجدداً.', 'Review the evidence and try again.')}`;
    await refresh();
  } catch (error) { feedback = error.message; render(); }
  finally { busy = false; render(); }
});
document.querySelector('#language-toggle')?.addEventListener('click', () => setTimeout(refresh, 0));
window.addEventListener('biuret-auth-changed', refresh);
refresh();
