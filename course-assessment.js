import { attachAssessmentProgress } from './assessment-ui.js?v=20261009-ux2';
import { user, loadUser, loadCourseExam, submitCourseExam } from './auth.js?v=20261009-ux2';
import { currentLanguage, setPageHeaderTitle } from './i18n.js?v=20261009-ux2';

const root = document.querySelector('#course-assessment-main');
const order = Number(new URLSearchParams(location.search).get('order'));
const tr = (ar, en) => currentLanguage() === 'en' ? en : ar;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let state, busy = false, feedback = '';

function frame(body) {
  root.innerHTML = `<section class="assessment-hero section-frame"><a class="learning-back" href="courses.html">← ${tr('جميع الدورات', 'All courses')}</a><span class="section-kicker">BIURET ACADEMY / COURSE EXAM</span><h1>${esc(state?.title || tr('امتحان الدورة', 'Course exam'))}</h1><p>${tr('أكمل دروس الدورة، ثم اختبر فهمك قبل الانتقال إلى تقييم المسار العملي والنهائي.', 'Finish the course lessons, then check your understanding before the path practical and final exam.')}</p></section><section class="assessment-body section-frame">${body}</section>`;
  attachAssessmentProgress(root,state?.formId);
}
function render() {
  if (!state) return;
  const progress = `<div class="assessment-card"><span class="section-kicker">COURSE / PROGRESS</span><h2>${state.completedLessons} / ${state.requiredLessons} ${tr('دروس مقروءة', 'lessons read')}</h2><p>${tr('يظهر الامتحان بعد توثيق قراءة جميع دروس هذه الدورة.', 'The exam opens after every lesson in this course is recorded.')}</p><a class="button button-outline" href="library-course.html?id=${encodeURIComponent(state.courseId)}">${tr('افتح الدورة', 'Open course')} ↗</a></div>`;
  if (!state.access) return frame(`<div class="assessment-card"><h2>${tr('الدورة مقفلة ضمن خطتك الحالية', 'This course is locked in your current plan')}</h2><a class="button button-primary" href="membership.html">${tr('عرض الخطط', 'View plans')} ↗</a></div>`);
  if (state.passed) return frame(progress + `<div class="assessment-card success"><span class="section-kicker">COURSE / PASSED</span><h2>${tr('اجتزت امتحان الدورة', 'Course exam passed')}</h2><p>${tr('النتيجة محفوظة في حسابك وتحتسب عند التأهل لامتحانات المسارات التي تضم هذه الدورة.', 'Your result is saved in your account and counts toward paths containing this course.')} <bdi dir="ltr">${state.score}/${state.totalQuestions}</bdi></p><a class="button button-primary" href="paths.html#specializations">${tr('تابع إلى المسارات', 'Continue to paths')} ↗</a></div>`);
  if (!state.eligible) return frame(progress);
  const fields = state.questions.map((question, i) => `<fieldset><legend>${i + 1}. ${esc(question.question)}</legend>${question.options.map((option, index) => `<label><input type="radio" name="${esc(question.id)}" value="${index}" required><span>${esc(option)}</span></label>`).join('')}</fieldset>`).join('');
  frame(progress + `<div class="assessment-card"><h2>${tr('اختبر فهمك', 'Check your understanding')}</h2><p>${state.totalQuestions} ${tr('أسئلة، النجاح من', 'questions; pass at')} ${state.passScore}/${state.totalQuestions}. ${tr('يمكنك إعادة المحاولة بعد المراجعة.', 'You may retry after review.')}</p>${feedback ? `<p class="answer-feedback" role="status">${esc(feedback)}</p>` : ''}<form id="course-exam-form" class="practice-form">${fields}<button class="button button-primary" type="submit" ${busy ? 'disabled' : ''}>${tr('سلّم الإجابات', 'Submit answers')} ↗</button></form></div>`);
}
async function refresh() {
  if (!Number.isInteger(order) || order < 1 || order > 19) { frame(`<div class="assessment-card"><h2>${tr('الدورة غير موجودة', 'Course not found')}</h2></div>`); return; }
  if (!user()) await loadUser();
  if (!user()) { frame(`<div class="assessment-card"><h2>${tr('سجّل الدخول للمتابعة', 'Sign in to continue')}</h2><button class="button button-primary" id="course-signin" type="button">${tr('تسجيل الدخول', 'Sign in')}</button></div>`); return; }
  frame(`<div class="assessment-card"><h2>${tr('جارٍ تحميل الامتحان…', 'Loading exam…')}</h2></div>`);
  try { state = await loadCourseExam(order, currentLanguage()); setPageHeaderTitle({ ar: state.title, en: state.title }); render(); }
  catch (error) { frame(`<div class="assessment-card"><h2>${tr('تعذر فتح الامتحان', 'Exam unavailable')}</h2><p>${esc(error.message)}</p><button class="button button-outline" id="course-retry" type="button">${tr('إعادة المحاولة', 'Retry')}</button></div>`); }
}
root?.addEventListener('click', (event) => {
  if (event.target.closest('#course-signin')) document.querySelector('#account-button')?.click();
  if (event.target.closest('#course-retry')) refresh();
});
root?.addEventListener('submit', async (event) => {
  if (event.target.id !== 'course-exam-form') return;
  event.preventDefault(); if(busy)return; busy = true;
  const answers = Object.fromEntries([...new FormData(event.target)].map(([key, value]) => [key, Number(value)]));
  event.target.querySelector('button[type="submit"]').disabled = true;
  try {
    const result = await submitCourseExam(order, answers, state.formId);
    feedback = result.passed ? '' : `${tr('النتيجة', 'Score')}: ${result.score}/${result.total}. ${tr('راجع الدروس وحاول مجدداً.', 'Review the lessons and try again.')}`;
    await refresh();
  } catch (error) { feedback = error.message; render(); }
  finally { busy = false; render(); }
});
document.querySelector('#language-toggle')?.addEventListener('click', () => setTimeout(refresh, 0));
window.addEventListener('biuret-auth-changed', refresh);
refresh();
