import { mountWorkbench } from './workbench.js?v=20261010-guide6';
import { mountAuthorizationLab } from './authorization-lab.js?v=20261010-guide6';
import { mountCloudDfir } from './cloud-dfir-lab.js?v=20261010-guide6';
import { mountSpecialist } from './specialist-lab.js?v=20261010-guide6';
import { specialistPractices, specialistVariant } from './specialist-model.js?v=20261010-guide6';
import { mountReverse } from './reverse-lab.js?v=20261010-guide6';
import { reversePractice } from './reverse-model.js?v=20261010-guide6';
import { mountAssurance } from './assurance-lab.js?v=20261010-guide6';
import { assurancePractice } from './assurance-model.js?v=20261010-guide6';
import { currentLanguage, setPageHeaderTitle } from './i18n.js?v=20261010-guide6';
import { user, loadUser, loadProgramLibrary, markProgramLesson, checkProgramPractice, loadProgramLessonState } from './auth.js?v=20261010-guide6';
import { requiredPlan, canAccess, coursePracticeTarget } from './plan-access.js?v=20261010-guide6';

const page = document.querySelector('.site-shell')?.dataset.page;
const root = document.querySelector('#desktop-main');
const params = new URLSearchParams(location.search);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const tr = (ar, en) => currentLanguage() === 'en' ? en : ar;
const key = () => `biuret-academy-desktop-library-v2:${user()?.$id || 'guest'}`;
let data, dataAr, dataEn;
let membership;
let foundationsPassed = false;
let libraryOwner = null;
const languageLoads = new Map();
let state = {};
let lessonStatus = null;
let checkpointAnswer;
let checkpointFeedback = '';
function loadPersonalState() {
  try { state = JSON.parse(localStorage.getItem(key())) || {}; } catch { state = {}; }
  state.completed ||= {};
  state.favorites ||= [];
  state.notes ||= {};
  state.practice ||= {};
  state.reviewed ||= {};
  state.reviewCards ||= {};
  if (state.practiceQuizBankVersion !== 3 && user()) {
    for (const id of Object.keys(state.reviewCards)) {
      if (/^quiz-\d+-question-\d+$/.test(id)) delete state.reviewCards[id];
    }
    for (const id of Object.keys(state.practice)) {
      if (/^quiz-\d+$/.test(id)) delete state.practice[id];
    }
    state.practiceQuizBankVersion = 3;
    try { localStorage.setItem(key(), JSON.stringify(state)); } catch { /* Practice history can still be reset in memory. */ }
  }
}
loadPersonalState();
const save = () => { if (!user()) return; try { localStorage.setItem(key(), JSON.stringify(state)); } catch { announce(tr('تعذر حفظ البيانات على هذا المتصفح.', 'Could not save data in this browser.')); } };
const announce = (message) => { const toast = document.querySelector('#toast'); if (toast) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3800); } };
const allLessons = () => data.categories.flatMap((category) => category.lessons.map((lesson) => ({ ...lesson, category })));
const lessonById = (id) => allLessons().find((item) => item.id === id);
const categoryById = (id) => data.categories.find((item) => item.id === id);
const localizedTitle = (source, kind, id, field) => {
  const items = kind === 'lesson' ? source?.categories?.flatMap((item) => item.lessons) : source?.[kind];
  return items?.find((item) => item.id === id)?.[field] || id;
};
const titles = (kind, id, field = 'title') => ({
  ar: localizedTitle(dataAr || data, kind, id, field),
  en: localizedTitle(dataEn || data, kind, id, field),
});
const allowed = (kind, index) => Boolean(membership?.admin || (canAccess(kind, index, membership) && (requiredPlan(kind, index) === 'free' || foundationsPassed)));
const tierBadge = (kind, index) => `<span class="library-tier tier-${requiredPlan(kind, index)}">${requiredPlan(kind, index) === 'free' ? tr('مجاني', 'Free') : tr('محتوى تخصص', 'Specialty content')}</span>`;
const lockedBody = (kind, index) => `<div class="library-locked"><span class="section-kicker">BIURET ACADEMY</span><h2>${tr('خطوة التعلّم التالية مقفلة حالياً.', 'Your next learning step is locked.')}</h2><p>${!foundationsPassed && !membership?.admin && requiredPlan(kind, index) !== 'free' ? tr('أكمل الأساسيات المجانية وامتحانها أولاً، ثم استكشف التخصص المناسب لك.', 'Complete free Foundations and its exam first, then explore your specialty.') : tr('هذا المحتوى غير متاح لحسابك حالياً. شراء المسارات لم يُفتح بعد؛ صلاحيات الحسابات السابقة محفوظة أثناء الانتقال للنظام الجديد.', 'This content is not currently available to your account. Path purchases are not open yet; existing account access is preserved during the transition.')}</p><a class="button button-primary" href="${!foundationsPassed && requiredPlan(kind, index) !== 'free' ? 'paths.html#foundations-roadmap' : 'membership.html'}">${!foundationsPassed && requiredPlan(kind, index) !== 'free' ? tr('ابدأ الأساسيات', 'Start Foundations') : tr('تفاصيل الوصول والمشتريات', 'Access and purchase details')} ↗</a></div>`;
const notice = () => `<details class="catalog-callout library-notice guidance-disclosure"><summary>${tr('كيف تتعلّم وتوثّق إنجازك؟', 'How do learning and verified progress work?')}</summary><p>${tr('ابدأ بالأساسيات، ثم اتبع دورات مسارك بالترتيب. أكمل أسئلة تحقق الدروس وامتحانات الدورات، وتدرّب على الأدلة قبل التقييم العملي والامتحان النهائي. الملاحظات والمراجعة تبقى في هذا المتصفح.', 'Start with Foundations, then follow your path courses in order. Complete lesson checkpoints and course exams, and practice with evidence before the practical assessment and final exam. Notes and practice review stay in this browser.')}</p><a href="paths.html">${tr('خطة التعلم', 'Learning route')} ↗</a></details>`;
const frame = (label, title, intro, body) => `<section class="catalog-hero section-frame"><a class="learning-back" href="paths.html">← ${tr('خطة التعلّم', 'Learning route')}</a><span class="section-kicker">${label}</span><h1>${esc(title)}</h1><p>${intro}</p></section><section class="catalog-body section-frame">${body}</section>`;
const section = (title, body) => `<section class="library-section"><h2>${title}</h2>${body}</section>`;
const empty = (message) => `<p class="library-empty">${message}</p>`;
const courseCard = (category) => `<a class="library-card ${allowed('course', category.order) ? '' : 'is-locked'}" href="library-course.html?id=${encodeURIComponent(category.id)}"><span>${esc(category.icon)} &nbsp; COURSE / ${String(category.order).padStart(2, '0')} ${tierBadge('course', category.order)}</span><h3>${esc(category.title)}</h3><p>${esc(category.description)}</p><small>${category.lessons.length} ${tr('دروس', 'lessons')} · ${category.lessons.filter((item) => state.completed[item.id]).length} ${tr('مقروءة', 'read')}</small><b>${allowed('course', category.order) ? tr('افتح الكورس', 'Open course') : tr('شاهد شروط الوصول', 'View access')} ↗</b></a>`;
const lessonCard = (lesson) => `<a class="library-row ${allowed('course', lesson.category?.order ?? data.categories.find((category) => category.lessons.some((item) => item.id === lesson.id))?.order) ? '' : 'is-locked'}" href="library-lesson.html?id=${encodeURIComponent(lesson.id)}"><span>${String(lesson.order).padStart(2, '0')}</span><strong>${esc(lesson.title)}</strong><small>${state.completed[lesson.id] ? tr('مقروء', 'Read') : esc(lesson.difficulty)}</small><b>↗</b></a>`;
const simpleCards = (items, target, titleOf, descOf) => {
  const kind = ({ 'practice-lab': 'lab', 'practice-quiz': 'quiz', 'practice-challenge': 'challenge', operation: 'operation' })[target];
  return `<div class="library-grid">${items.map((item,index)=>({item,index})).sort((a,b)=>Number(allowed(kind,b.index))-Number(allowed(kind,a.index))).map(({item,index}) => `<a class="library-card ${allowed(kind, index) ? '' : 'is-locked'}" href="${target}.html?id=${index}"><span>${String(index + 1).padStart(2, '0')} / ${target.toUpperCase()} ${tierBadge(kind, index)}</span><h3>${esc(titleOf(item))}</h3><p>${esc(descOf(item))}</p><b>${allowed(kind, index) ? tr('افتح التدريب', 'Open practice') : tr('شاهد شروط الوصول', 'View access')} ↗</b></a>`).join('')}</div>`;
};

function renderCatalogExtras() {
  const target = document.querySelector('#catalog-main');
  if (!target) return;
  target.querySelector('#desktop-append')?.remove();
  let body = '';
  if (page === 'courses') body = section(tr('الدورات الكاملة', 'Full courses'), `${notice()}<div class="library-grid">${[...data.categories].sort((a,b)=>Number(allowed('course',b.order))-Number(allowed('course',a.order))).map(courseCard).join('')}</div>`);
  if (page === 'labs') body = `<div class="catalog-callout library-notice"><strong>${tr('مختبر تحقيق SOC متعدد المصادر','SOC investigation across multiple evidence sources')}</strong><p>${tr('حلل ستة ملفات أدلة، صحح التوقيت، احسب النقل، ثم جهز تقريرك للمراجعة. يتطلب المختبر وصول مسار SOC وإكمال الأساسيات.','Analyze six evidence files, normalize time, calculate transfer and draft a report for review. Requires SOC path access and Foundations completion.')}</p><a class="button button-outline" href="soc-investigation.html">${tr('افتح مساحة التحقيق','Open investigation workspace')} ↗</a></div>` + section(tr('مختبرات التطبيق', 'Practice labs'), `${notice()}${simpleCards(data.labs, 'practice-lab', (x) => x.name, (x) => x.desc)}`);
  if (page === 'quizzes') body = section(tr('اختبارات المراجعة', 'Review quizzes'), `<div class="catalog-callout library-notice"><strong>${tr('تدريب مستقل عن امتحانات الدورات', 'Separate from course exams')}</strong><p>${tr('هذه أسئلة مراجعة جديدة ومختلفة عن بنك امتحانات إكمال الدورات. يمكنك إعادتها للتدريب، ولا تُحتسب نتيجتها للشهادة أو XP الموثق.', 'These are new review questions, different from the course completion exam bank. You can retry them for practice; their results do not count toward credentials or verified XP.')}</p></div>${simpleCards(data.quizzes, 'practice-quiz', (x) => x.name, (x) => x.topics)}`);
  if (page === 'tools') body = section(tr('مكتبة الأدوات', 'Tool library'), `${notice()}<div class="tool-guide-list">${data.tools.map((tool, index) => `<details class="tool-guide" ${allowed('tool', index) ? '' : 'data-locked="true"'}><summary><span>${esc(tool.category)} ${tierBadge('tool', index)}</span><strong>${esc(tool.name)}</strong><i aria-hidden="true">${allowed('tool', index) ? '+' : '🔒'}</i></summary><div class="tool-guide-body">${allowed('tool', index) ? `<p>${esc(tool.description)}</p><p>${esc(tool.usage)}</p><code dir="ltr">${esc(tool.example)}</code><p>${esc(tool.platform)}</p>` : lockedBody('tool', index)}</div></details>`).join('')}</div>`);
  if (body) target.insertAdjacentHTML('beforeend', `<div id="desktop-append" class="section-frame">${body}</div>`);
}

function renderChallengeExtras() {
  const main = document.querySelector('#main');
  if (!main) return;
  main.querySelector('#desktop-append')?.remove();
  main.insertAdjacentHTML('beforeend', `<div id="desktop-append" class="section-frame">${section(tr('تحديات التطبيق', 'Applied challenges'), `${notice()}${simpleCards(data.challenges, 'practice-challenge', (x) => x.name, (x) => x.desc)}`)}</div>`);
}

function renderRoadmapExtras() {
  const main = document.querySelector('#main');
  if (!main) return;
  main.querySelector('#desktop-append')?.remove();
  const cards = data.roadmapPaths.map(([icon, title, pathId, steps, certs, , categoryIds]) => `<article id="roadmap-${esc(pathId)}" class="library-card"><span>${esc(icon)} &nbsp; ROADMAP</span><h3>${esc(title)}</h3><div class="library-summary"><span>${categoryIds.length} ${tr('دورات', 'courses')}</span><span>3 ${tr('مهام عملية', 'practical tasks')}</span><span>10 ${tr('أسئلة امتحان', 'exam questions')}</span><span>${categoryIds.some((id) => requiredPlan('course', id) === 'pro') ? 'PRO' : 'PLUS'}</span></div><ol class="library-bullets">${steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol><p>${tr('الاعتمادات الخارجية مستقلة عن شهادة Biuret Academy:', 'External credentials are independent of the Biuret Academy certificate:')} ${esc(certs)}</p><div class="library-sources">${categoryIds.map((id) => data.categories.find((category) => category.order === id)).filter(Boolean).map((category) => `<a href="library-course.html?id=${encodeURIComponent(category.id)}">${esc(category.title)} ↗</a>`).join('')}</div><div class="library-sources"><a href="practical.html?id=${encodeURIComponent(pathId)}">${tr('التقييم العملي', 'Practical assessment')} ↗</a><a href="path-exam.html?id=${encodeURIComponent(pathId)}">${tr('امتحان المسار وشهادته', 'Path exam and credential')} ↗</a></div></article>`).join('');
  main.insertAdjacentHTML('beforeend', `<div id="desktop-append" class="section-frame">${section(tr('خرائط تخصصات برنامج الأكاديمية', 'Academy program specialty roadmaps'), `${notice()}<div class="library-grid">${cards}</div>`)}</div>`);
  if (location.hash.startsWith('#roadmap-')) requestAnimationFrame(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: 'start' }));
}

function renderCourse() {
  const category = categoryById(params.get('id'));
  if (!category) return frame('LIBRARY / COURSE', tr('الكورس غير موجود', 'Course not found'), '', `<a href="courses.html">${tr('كل الكورسات', 'All courses')} ↗</a>`);
  setPageHeaderTitle(titles('categories', category.id));
  const linkedPaths = data.roadmapPaths.filter((path) => path[6].includes(category.order));
  const practice = Object.entries({...specialistPractices,reverse:reversePractice,supplier:assurancePractice}).find(([,v])=>v.course===category.id);
  const target = coursePracticeTarget(category.id, practice ? {index:practice[1].index,context:practice[0]} : null, membership, foundationsPassed);
  const practiceMarkup = target ? `<div class="catalog-callout library-notice"><strong>${tr('من الدرس إلى القرار العملي','From lesson to practical decision')}</strong><p>${target.kind === 'starter' ? tr('تدريب مجاني مرتبط بهذه الدورة، محفوظ في هذا المتصفح. لا يسجل إكمال الدرس الموثق أو نتيجة شهادة.','Free practice related to this course, saved in this browser. It does not complete verified lessons or award a credential.') : target.kind === 'locked' ? tr('مختبر تخصصي يتطلب وصول '+target.plan.toUpperCase()+' وإكمال الأساسيات. شراء المسارات مغلق حالياً؛ راجع شروط الوصول أولاً.','Specialty lab requires '+target.plan.toUpperCase()+' access and Foundations completion. Path purchases are closed; review access requirements first.') : tr('طبّق على عينة صناعية واكتب قرارك وحدود الدليل. هذا تدريب مستقل عن امتحان الدورة.','Apply synthetic evidence and document decision limits. This practice is separate from the course exam.')}</p><a class="button button-outline" href="${target.href ? esc(target.href) : 'membership.html'}">${target.kind === 'starter' ? tr('طبّق مجاناً','Practice for free') : target.kind === 'locked' ? tr('شاهد شروط المختبر','View lab requirements') : tr(practice[1].title.ar,practice[1].title.en)} ↗</a></div>` : '';
  return frame('LIBRARY / COURSE', category.title, esc(category.description), `${notice()}${practiceMarkup}<div class="library-summary"><span>${category.lessons.length} ${tr('دروس', 'lessons')}</span><span>${category.lessons.filter((item) => state.completed[item.id]).length} ${tr('مقروءة', 'read')}</span></div><div class="library-list">${category.lessons.map(lessonCard).join('')}</div>${section(tr('امتحان هذه الدورة', 'This course exam'), `<p>${tr('بعد قراءة الدروس، اجتز امتحان الدورة المحفوظ في حسابك. تحتاج المسارات التي تضمها إلى هذه النتيجة قبل تقييمها العملي.', 'After reading the lessons, pass the course exam saved in your account. Paths containing this course need that result before their practical assessment.')}</p><a class="button button-primary" href="course-exam.html?order=${category.order}">${tr('افتح امتحان الدورة', 'Open course exam')} ↗</a>`)}${linkedPaths.length ? section(tr('هذا الكورس ضمن مسارات', 'This course is part of'), `<div class="library-sources">${linkedPaths.map((path) => `<a href="path.html?id=${encodeURIComponent(path[2])}">${esc(path[1])} · ${tr('محتويات المسار', 'Path contents')} ↗</a>`).join('')}</div>`) : ''}<a class="button button-outline" href="courses.html">${tr('كل الكورسات', 'All courses')} ↗</a>`);
}

function renderLesson() {
  const lesson = lessonById(params.get('id'));
  if (!lesson) return frame('LIBRARY / LESSON', tr('الدرس غير موجود', 'Lesson not found'), '', `<a href="courses.html">${tr('كل الكورسات', 'All courses')} ↗</a>`);
  const siblings = lesson.category.lessons;
  const position = siblings.findIndex((item) => item.id === lesson.id);
  const previous = siblings[position - 1];
  const next = siblings[position + 1];
  setPageHeaderTitle(titles('lesson', lesson.id));
  const favorite = state.favorites.includes(lesson.id);
  const guide = lesson.guide;
  const list = (items) => `<ul class="learning-objectives">${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
  const checkpoint = guide ? `<section class="lesson-checkpoint" id="lesson-checkpoint"><h2>${tr('تحقق من فهمك', 'Check your understanding')}</h2>${lessonStatus?.read ? `<p class="library-feedback success">${tr('✓ إكمال هذا الدرس موثّق في حسابك.', '✓ This lesson completion is verified in your account.')}</p>` : !lessonStatus ? `<p role="status">${tr('جارٍ التحقق من ترتيب الدروس…', 'Checking your lesson sequence…')}</p>` : !lessonStatus.ready ? `<p>${tr('أكمل سؤال التحقق في الدرس السابق أولاً.', 'Complete the previous lesson checkpoint first.')}</p>${previous ? `<a class="button button-outline" href="library-lesson.html?id=${encodeURIComponent(previous.id)}">${tr('ارجع للدرس السابق', 'Return to the previous lesson')} ↗</a>` : ''}` : `<form id="lesson-checkpoint-form" class="practice-form"><fieldset><legend>${esc(guide.checkpoint.question)}</legend>${guide.checkpoint.options.map((option, index) => `<label><input type="radio" name="answer" value="${index}" ${checkpointAnswer === index ? 'checked' : ''} required><span>${esc(option)}</span></label>`).join('')}</fieldset><button class="button button-primary" type="submit">${tr('تحقق وأكمل الدرس', 'Check and complete the lesson')} ↗</button><p role="status" id="lesson-checkpoint-feedback">${esc(checkpointFeedback)}</p></form>`}</section>` : '';
  const explanation = `<div class="lesson-original-content">${esc(lesson.content).split(/\n\s*\n/).filter(Boolean).map((block) => {
    const lines = block.split('\n');
    const heading = lines[0].trim();
    return heading.length < 120 && /[:：؟?]$/.test(heading)
      ? `<section class="lesson-explanation-section"><h3>${heading}</h3>${lines.length > 1 ? `<p>${lines.slice(1).join('<br>')}</p>` : ''}</section>`
      : `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('')}</div>`;
  const reading = guide ? `<div class="lesson-outline" id="lesson-overview"><span class="section-kicker">${tr('خطة الدرس', 'LESSON PLAN')} · ${guide.minutes} ${tr('دقيقة تقريباً مع التطبيق', 'estimated min including practice')}</span><h2>${tr('ما ستتعلمه', 'What you will learn')}</h2>${list(guide.objectives)}</div><h2 id="lesson-explanation">${tr('شرح الدرس', 'Lesson explanation')}</h2>${explanation}${lesson.terminology?.length ? `<details class="library-hint"><summary>${tr('مصطلحات الدرس', 'Lesson terminology')}</summary><dl>${lesson.terminology.map(item => `<dt><strong>${esc(item.term)}</strong></dt><dd>${esc(item.definition)}</dd>`).join('')}</dl></details>` : ''}<section class="lesson-applied-context" id="lesson-application"><h2>${tr('تطبيق على موضوع الدرس', 'Applying the lesson')}</h2>${guide.concept.split(/\n\s*\n/).map(block => `<p>${esc(block)}</p>`).join('')}<h3>${tr('اقرأ الدليل', 'Read the evidence')}</h3><pre class="learning-artifact" dir="ltr">${esc(guide.artifact.replace(/; /g, '\n'))}</pre><h3>${tr('كيف تحلله؟', 'How should you analyze it?')}</h3><p>${esc(guide.analysis)}</p><section class="learning-practice-output"><h3>${tr('طبّق واكتب قرارك', 'Apply it and document your decision')}</h3><p>${esc(guide.exercise)}</p><h3>${tr('راجع إجابتك بهذه المعايير', 'Review your response against these criteria')}</h3>${list(guide.rubric)}<a href="#lesson-note">${tr('اكتب إجابتك في ملاحظات الدرس', 'Write your response in the lesson notes')} ↗</a></section></section>${checkpoint}${guide.sources.length ? `<div class="learning-source-links"><h3>${tr('مراجع أصلية', 'Primary references')}</h3>${guide.sources.filter((source) => /^https:\/\//.test(source.url)).map((source) => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a>`).join('')}</div>` : ''}` : explanation;
  return frame('LEARN / LESSON', lesson.title, `<a href="library-course.html?id=${encodeURIComponent(lesson.category.id)}">${esc(lesson.category.title)} ↗</a> · ${position + 1}/${siblings.length}`, `${guide ? `<nav class="lesson-study-nav" aria-label="${tr('أجزاء الدرس', 'Lesson sections')}"><a href="#lesson-overview">${tr('الأهداف', 'Objectives')}</a><a href="#lesson-explanation">${tr('الشرح', 'Explanation')}</a><a href="#lesson-application">${tr('التطبيق', 'Application')}</a><a href="#lesson-checkpoint">${tr('تحقق من فهمك', 'Knowledge check')}</a><a href="#lesson-note">${tr('ملاحظاتك', 'Your notes')}</a></nav>` : ''}<div class="library-lesson-layout"><article class="library-reading" dir="${currentLanguage() === 'en' ? 'ltr' : 'rtl'}">${reading}</article><aside class="library-lesson-tools"><button class="button button-outline" id="favorite-button" type="button">${favorite ? tr('★ محفوظ في المفضلة', '★ Saved to favorites') : tr('☆ أضف للمفضلة', '☆ Add to favorites')}</button>${guide ? `<a class="button button-primary" href="#lesson-checkpoint">${lessonStatus?.read ? tr('✓ درس مكتمل', '✓ Lesson completed') : tr('انتقل لسؤال التحقق', 'Go to the checkpoint')}</a>` : `<p>${tr('جارٍ تحديث سؤال التحقق لهذا الدرس.', 'The lesson checkpoint is being updated.')}</p>`}<label for="lesson-note">${tr('إجابتك وملاحظاتك', 'Your response and notes')}</label><textarea dir="auto" id="lesson-note" rows="9" placeholder="${tr('الدليل، الاستنتاج، المجهول، والإجراء التالي…', 'Evidence, inference, unknowns and next action…')}">${esc(state.notes[lesson.id] || '')}</textarea><button class="button button-outline" id="save-note" type="button">${tr('احفظ الملاحظة', 'Save note')}</button><small>${tr('الملاحظات محفوظة في هذا المتصفح؛ إكمال الدرس محفوظ في حسابك.', 'Notes stay in this browser; lesson completion is saved to your account.')}</small></aside></div><nav class="library-next">${previous ? `<a href="library-lesson.html?id=${encodeURIComponent(previous.id)}">${tr('السابق', 'Previous')} · ${esc(previous.title)}</a>` : '<span></span>'}${next ? `<a href="library-lesson.html?id=${encodeURIComponent(next.id)}">${tr('التالي', 'Next')} · ${esc(next.title)}</a>` : `<a href="course-exam.html?order=${lesson.category.order}">${tr('امتحان الدورة', 'Course exam')} ↗</a>`}</nav>`);
}

function renderQuiz() {
  const index = Number(params.get('id'));
  const quiz = data.quizzes[index];
  if (!quiz) return frame('PRACTICE / QUIZ', tr('الاختبار غير موجود', 'Quiz not found'), '', '<a href="quizzes.html">Quizzes ↗</a>');
  setPageHeaderTitle({ ar: quiz.name, en: quiz.name });
  return frame('PRACTICE / QUIZ', quiz.name, esc(quiz.topics), `${notice()}<form id="practice-form" class="practice-form">${quiz.questions.map((question, questionIndex) => `<fieldset><legend>${questionIndex + 1}. ${esc(question.q)}</legend>${question.opts.map((option, optionIndex) => `<label><input type="radio" name="q${questionIndex}" value="${optionIndex}" required><span>${esc(option)}</span></label>`).join('')}</fieldset>`).join('')}<button class="button button-primary" type="submit">${tr('صحح إجاباتي', 'Check my answers')} ↗</button><div id="practice-result" role="status"></div></form>`);
}

function renderLab() {
  const index = Number(params.get('id'));
  const lab = data.labs[index];
  if (!lab) return frame('PRACTICE / LAB', tr('المختبر غير موجود', 'Lab not found'), '', '<a href="labs.html">Labs ↗</a>');
  if(index===assurancePractice.index&&params.get('context')==='supplier'){
    setPageHeaderTitle(assurancePractice.title);
    return frame('GRC / SUPPLIER REVIEW',tr(assurancePractice.title.ar,assurancePractice.title.en),tr('اربط طلب الضمان بدليل مناسب وقرار متابعة بمالك وحد انتهاء.','Connect an assurance request to relevant evidence and an owned, time-bounded follow-up decision.'),`<div class="library-sources"><a href="path.html?id=${assurancePractice.path}">${tr('ارجع إلى مسار الحوكمة','Return to GRC path')} ↗</a><a href="library-course.html?id=${assurancePractice.course}">${tr('راجع دورة الحوكمة العملية','Review applied GRC course')} ↗</a></div><div id="supplier-workbench"></div>`);
  }
  if(index===reversePractice.index&&params.get('context')==='reverse'){
    setPageHeaderTitle(reversePractice.title);
    return frame('REVERSE / PRACTICE LAB',tr(reversePractice.title.ar,reversePractice.title.en),tr('تدرّب على عرض المعامل وحدود المقارنة قبل تفسير سلوك البرنامج.','Practice operand width and comparison boundaries before interpreting program behavior.'),`<div class="library-sources"><a href="path.html?id=${reversePractice.path}">${tr('ارجع إلى محتويات المسار','Return to path contents')} ↗</a><a href="library-course.html?id=${reversePractice.course}">${tr('دروس الهندسة العكسية','Reverse engineering lessons')} ↗</a></div><div id="reverse-workbench"></div>`);
  }
  const specialist = specialistVariant(index,params.get('context'));
  if(specialist){
    const practice=specialistPractices[specialist];setPageHeaderTitle(practice.title);
    return frame('PRACTICE / DECISION LAB',tr(practice.title.ar,practice.title.en),tr('اقرأ العينة، توقّع القرار، ثم قارِن النتيجة واكتب ما يحتاج تحققاً إضافياً.','Read the sample, predict a decision, compare the result and document what needs further verification.'),`<div class="library-sources"><a href="path.html?id=${practice.path}">${tr('ارجع إلى محتويات المسار','Return to path contents')} ↗</a><a href="library-course.html?id=${practice.course}">${tr('راجع الدروس المرتبطة','Review related lessons')} ↗</a></div><div id="specialist-workbench"></div>`);
  }
  if(index===7 && params.get('context')==='cloud') {
    const title={ar:'تقييم صلاحيات السحابة والانحراف',en:'Cloud access and drift evaluation'};
    setPageHeaderTitle(title);
    return frame('CLOUD / PRACTICE LAB',tr(title.ar,title.en),tr('راجع منح الهوية وحد الصلاحيات والمنع، ثم اختبر الإصلاح مع بقاء الوصول المشروع.','Review identity grants, boundaries and denial, then retest repair while preserving legitimate access.'),`<a href="path.html?id=path_cloud">${tr('ارجع إلى مسار الأمن السحابي','Return to Cloud Security')} ↗</a><div id="cloud-dfir-workbench"></div>`);
  }
  setPageHeaderTitle({ ar: lab.name, en: lab.name });
  return frame('PRACTICE / LAB', lab.name, esc(lab.desc), `<div class="library-lab-grid"><div>${section(tr('الأهداف', 'Objectives'), `<ul class="library-bullets">${lab.objectives.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`)}${section(tr('خطوات التحليل', 'Analysis steps'), `<ol class="library-bullets" dir="${currentLanguage() === 'en' ? 'ltr' : 'rtl'}">${lab.steps.map((step) => `<li>${esc(step[0])}<span dir="${currentLanguage() === 'en' ? 'ltr' : 'rtl'}">${esc(step[1])}</span></li>`).join('')}</ol>`)}<p class="library-note">${tr('عينة صناعية تعليمية؛ هذا المختبر لا يشغّل أدوات ولا يتصل بأهداف خارجية.', 'Synthetic learning evidence; this lab does not run tools or connect to external targets.')}</p></div><div>${section(tr('العينة الصناعية', 'Synthetic sample'), `<pre class="library-sample" dir="ltr">${esc(lab.sample)}</pre>`)}</div></div>${practiceOutput(lab)}${singleCheck(lab.verify_q, lab.verify_opts, `lab-${index}`)}`);
}

function renderChallenge() {
  const index = Number(params.get('id'));
  const challenge = data.challenges[index];
  if (!challenge) return frame('PRACTICE / CHALLENGE', tr('التحدي غير موجود', 'Challenge not found'), '', '<a href="challenges.html">Challenges ↗</a>');
  setPageHeaderTitle({ ar: challenge.name, en: challenge.name });
  return frame('PRACTICE / CHALLENGE', challenge.name, esc(challenge.desc), `<div class="library-summary"><span>${esc(challenge.diff)}</span><span>${esc(challenge.category)}</span></div>${challenge.sample ? section(tr('دليل الحالة', 'Case evidence'), `<pre class="learning-artifact" dir="ltr">${esc(challenge.sample)}</pre>`) : ''}${practiceOutput(challenge)}${singleCheck(challenge.verify_q, challenge.verify_opts, `challenge-${index}`)}<details class="library-hint"><summary>${tr('تلميح', 'Hint')}</summary><p>${esc(challenge.hint)}</p></details>`);
}

function practiceOutput(item) {
  if (!item.output) return '';
  const id = `${page}-${params.get('id')}`;
  return section(tr('هدفك والمخرج المطلوب', 'Goal and deliverable'), `${item.goal ? `<p><strong>${esc(item.goal)}</strong></p>` : ''}${item.practiceMode ? `<p class="library-note">${esc(item.practiceMode)}</p>` : ''}<p>${esc(item.output)}</p><label for="practice-note">${tr('دليلك وقرارك وحدوده', 'Your evidence, decision and limitations')}</label><textarea class="learning-practice-output" id="practice-note" rows="5">${esc(state.notes[id] || '')}</textarea><small>${tr('يحفظ تلقائياً على هذا المتصفح. هذا التمرين للمراجعة وليس نتيجة شهادة.', 'Saved automatically in this browser. This practice is for review, not certificate evidence.')}</small>${item.rubric ? `<details class="library-hint"><summary>${tr('معايير مراجعة تحليلك', 'Criteria for reviewing your analysis')}</summary><ul class="library-bullets">${item.rubric.map((line) => `<li>${esc(line)}</li>`).join('')}</ul></details>` : ''}`);
}

function singleCheck(question, options, id) {
  return `<form id="practice-form" class="practice-form"><fieldset><legend>${esc(question)}</legend>${options.map((option, index) => `<label><input type="radio" name="answer" value="${index}" required><span>${esc(option)}</span></label>`).join('')}</fieldset><button class="button button-primary" type="submit">${tr('تحقق من الإجابة', 'Check answer')} ↗</button><div id="practice-result" role="status"></div></form>`;
}

function renderOperations() {
  return frame('CYBER / OPERATIONS', tr('غرفة العمليات', 'Operations room'), tr('ستة سيناريوهات تحاكي قرارات الاستجابة للحوادث. افحص الأدلة، ثم اختر إجراءك وخطة المتابعة.', 'Six incident response scenarios. Examine evidence, choose an action and a follow-up plan.'), `${notice()}${simpleCards(data.operations, 'operation', (x) => x.title, (x) => x.summary)}`);
}

function renderOperation() {
  const operation = data.operations[Number(params.get('id'))];
  if (!operation) return frame('CYBER / OPERATION', tr('السيناريو غير موجود', 'Scenario not found'), '', '<a href="operations.html">Operations ↗</a>');
  for (const group of ['decision', 'response']) {
    const saved = state.practice[`operation-${operation.id}-${group}`];
    if (saved && saved.revision !== operation.revision) delete state.practice[`operation-${operation.id}-${group}`];
  }
  setPageHeaderTitle({ ar: operation.title, en: operation.title });
  return frame(`OPERATION / ${esc(operation.codename)}`, operation.title, esc(operation.summary), `${notice()}<div class="library-summary"><span>${esc(operation.track)}</span><span>${esc(operation.severity)}</span><span>${esc(operation.duration)}</span></div>${operation.goal ? section(tr('هدف القرار', 'Decision goal'), `<p>${esc(operation.goal)}</p><p class="library-note">${esc(operation.pressure)}</p>`) : ''}${section(tr('التنبيه', 'Alert'), `<p>${esc(operation.alert)}</p>`)}${section(tr('الخط الزمني', 'Timeline'), `<ol class="library-timeline">${operation.timeline.map((row) => `<li><time>${esc(row[0])}</time><span>${esc(row[1])}</span></li>`).join('')}</ol>`)}${section(tr('الأدلة', 'Evidence'), `<div class="library-grid">${operation.evidence.map((item) => `<article class="library-card"><span>${esc(item.tag)}</span><h3>${esc(item.icon)} ${esc(item.title)}</h3><p>${esc(item.detail)}</p></article>`).join('')}</div>`)}${section(tr('قرارك الأول', 'First decision'), choiceButtons(operation.decisions, 'decision'))}${section(tr('خطة الاستجابة', 'Response plan'), `<p>${tr('اختر قرارك الأول، ثم اختبر كيف تكمل خطة المتابعة ما بقي مفتوحاً.', 'Choose a first decision, then consider how the follow-up addresses unresolved issues.')}</p>${choiceButtons(operation.responses, 'response')}`)}<div id="operation-result" class="library-feedback" role="status">${operationFeedback(operation)}</div>${section(tr('وثّق سبب قرارك', 'Document your reasoning'), `<label for="operation-note">${tr('ما الأدلة التي اعتمدت عليها؟ وما الذي قد يغيّر قرارك؟', 'Which evidence supports your decision, and what could change it?')}</label><textarea id="operation-note" class="learning-practice-output" rows="5">${esc(state.notes[`operation-${params.get('id')}`] || '')}</textarea>${operation.rubric ? `<ul class="library-bullets">${operation.rubric.map(line => `<li>${esc(line)}</li>`).join('')}</ul>` : ''}<small>${tr('يحفظ تلقائياً في هذا المتصفح. هذا سيناريو تدريبي، وليس نتيجة شهادة.', 'Saved automatically in this browser. This is a practice scenario, not certificate evidence.')}</small>`)}`);
}

function operationFeedback(operation) {
  const decision = operation.decisions.find(item => item.id === state.practice[`operation-${operation.id}-decision`]?.choice);
  const response = operation.responses.find(item => item.id === state.practice[`operation-${operation.id}-response`]?.choice);
  if (!decision) return '';
  return `<strong>${tr('أثر القرار الأول في المحاكاة', 'Simulated first-decision outcome')}: ${esc(decision.title)}</strong><p>${esc(decision.explanation)}</p>${response ? `<strong>${tr('نتيجة المتابعة في المحاكاة', 'Simulated follow-up outcome')}: ${esc(response.title)}</strong><p>${esc(response.explanation)}</p><p class="library-note">${tr('اقرأ النتيجتين معاً: خطة المتابعة لا تمحو أثر القرار الأول. وثّق ما بقي دون احتواء أو اختبار قبل إغلاق الحالة.', 'Read both outcomes together: follow-up does not erase the first decision. Document anything still uncontained or untested before closing the case.')}</p>` : ''}`;
}

function choiceButtons(choices, group) {
  const operationId = data.operations[Number(params.get('id'))]?.id;
  const selected = state.practice[`operation-${operationId}-${group}`]?.choice;
  const waiting = group === 'response' && !state.practice[`operation-${operationId}-decision`];
  return `<div class="library-choices" data-group="${group}">${choices.map((choice) => `<button type="button" class="${selected === choice.id ? 'selected' : ''}" aria-pressed="${selected === choice.id}" ${waiting ? 'disabled' : ''} data-choice="${esc(choice.id)}"><strong>${esc(choice.title)}</strong><small>${esc(choice.detail)}</small></button>`).join('')}</div>`;
}

function renderReview() {
  const lessons = allLessons().filter((item) => state.completed[item.id]);
  const due = lessons.filter((item) => Date.now() - new Date(state.reviewed[item.id] || state.completed[item.id]).getTime() >= 86400000);
  const cards = Object.entries(state.reviewCards).filter(([, card]) => new Date(card.dueAt).getTime() <= Date.now());
  const cardHtml = cards.map(([id, card]) => `<article class="review-card"><span class="section-kicker">${esc(card.quizTitles?.[currentLanguage()] || card.quiz)}</span><h3>${esc(card.text?.[currentLanguage()]?.question || card.question)}</h3><details><summary>${tr('أظهر الإجابة', 'Show answer')}</summary><p>${esc(card.text?.[currentLanguage()]?.answer || card.answer)}</p></details><div><button type="button" data-recall="${esc(id)}" data-rating="hard">${tr('صعب عليّ', 'Still difficult')}</button><button type="button" data-recall="${esc(id)}" data-rating="remembered">${tr('تذكرت', 'Remembered')}</button></div></article>`).join('');
  return frame('LEARN / REVIEW', tr('المراجعة الذكية', 'Smart review'), tr('تُنشأ بطاقات من أخطائك في الاختبارات التدريبية، وتعود بعد 1 و3 و7 و14 و30 و60 يوماً. راجع أيضاً الدروس التي قرأتها.', 'Cards are created from practice quiz mistakes and return after 1, 3, 7, 14, 30 and 60 days. Revisit lessons you have read too.'), `${notice()}<div class="catalog-callout library-notice"><strong>${tr('جرّب رحلة التعلم وساعدنا على تحسينها', 'Try the learning journey and help improve it')}</strong><p>${tr('خطوات واضحة لتجربة الأساسيات وSOC وتسجيل العوائق، دون تغيير نتائجك.', 'Clear steps for testing Foundations and SOC and recording friction, without changing your results.')}</p><a class="button button-outline" href="pilot.html">${tr('افتح تجربة التعلم', 'Open learning trial')} ↗</a></div><div class="library-summary"><span>${lessons.length} ${tr('دروس مقروءة', 'read lessons')}</span><span>${cards.length} ${tr('بطاقات مستحقة', 'due cards')}</span><span>${due.length} ${tr('دروس للمراجعة', 'lessons to revisit')}</span></div>${section(tr('بطاقات من أخطائك', 'Cards from your mistakes'), cards.length ? `<div class="review-grid">${cardHtml}</div>` : empty(tr('لا توجد بطاقات مستحقة. أكمل اختباراً تدريبياً لتنشأ بطاقات من أخطائك.', 'No cards are due. Take a practice quiz to create cards from missed questions.')))}${section(tr('دروس تستحق العودة إليها', 'Lessons worth revisiting'), due.length ? `<div class="library-list">${due.map((lesson) => `<div class="library-row"><span>↻</span><a href="library-lesson.html?id=${encodeURIComponent(lesson.id)}">${esc(lesson.title)}</a><button type="button" data-review="${esc(lesson.id)}">${tr('راجعت الدرس', 'Reviewed')}</button></div>`).join('')}</div>` : empty(tr('لا توجد دروس مستحقة الآن.', 'No lessons are due now.')))}<a class="button button-outline" href="courses.html">${tr('افتح الكورسات', 'Open courses')} ↗</a>`);
}

function renderFavorites() {
  const lessons = state.favorites.map(lessonById).filter(Boolean);
  return frame('LEARN / FAVORITES', tr('المفضلة', 'Favorites'), tr('الدروس التي أردت الرجوع إليها سريعاً.', 'Lessons you saved for quick access.'), `${notice()}${lessons.length ? `<div class="library-list">${lessons.map(lessonCard).join('')}</div>` : empty(tr('لم تحفظ أي درس بعد. افتح درساً واضغط إضافة للمفضلة.', 'No favorites yet. Open a lesson and save it.'))}`);
}

function renderNotes() {
  const entries = Object.entries(state.notes).filter(([, text]) => text?.trim()).map(([id, note]) => {
    const lesson = lessonById(id);
    if (lesson) return { title: lesson.title, group: lesson.category.title, href: `library-lesson.html?id=${encodeURIComponent(id)}`, note };
    const match = /^(practice-lab|practice-challenge|operation)-(\d+)$/.exec(id);
    if (!match) return null;
    const items = match[1] === 'practice-lab' ? data.labs : match[1] === 'practice-challenge' ? data.challenges : data.operations;
    const item = items[Number(match[2])];
    return item ? { title: item.name || item.title, group: tr('تحليل عملي', 'Practice analysis'), href: `${match[1]}.html?id=${match[2]}`, note } : null;
  }).filter(Boolean);
  return frame('LEARN / NOTES', tr('ملاحظاتي', 'My notes'), tr('ملاحظات دروسك وتحليلك للمختبرات والتحديات وغرف العمليات، محفوظة في هذا المتصفح.', 'Your lesson notes and analysis of labs, challenges and operations rooms, stored in this browser.'), `${notice()}${entries.length ? `<div class="library-grid">${entries.map(({ title, group, href, note }) => `<article class="library-card"><span>${esc(group)}</span><h3>${esc(title)}</h3><p class="saved-note">${esc(note)}</p><a href="${href}">${tr('افتح الملاحظة', 'Open note')} ↗</a></article>`).join('')}</div>` : empty(tr('لا توجد ملاحظات بعد. اكتب أول ملاحظة داخل درس أو تدريب.', 'No notes yet. Write your first note in a lesson or practice.'))}`);
}

function renderSearch() {
  return frame('EXPLORE / SEARCH', tr('ابحث في الأكاديمية', 'Search the Academy'), tr('ابحث باسم كورس أو درس أو أداة أو مختبر في مكتبة البرنامج.', 'Find program courses, lessons, tools and labs.'), `${notice()}<label class="library-search"><span>${tr('كلمة البحث', 'Search term')}</span><input id="library-search" type="search" autocomplete="off" placeholder="${tr('مثلاً: الشبكات، Nmap، التشفير…', 'For example: networks, Nmap, cryptography…')}"></label><div id="search-results" class="library-list"></div>`);
}

function searchResults(query) {
  const normalized = query.trim().toLocaleLowerCase();
  const target = document.querySelector('#search-results');
  if (!target) return;
  if (!normalized) { target.innerHTML = empty(tr('اكتب كلمة لعرض النتائج.', 'Type a term to see results.')); return; }
  const results = [
    ...data.categories.map((item) => ({ title: item.title, detail: item.description, href: `library-course.html?id=${encodeURIComponent(item.id)}`, type: tr('كورس', 'Course') })),
    ...allLessons().map((item) => ({ title: item.title, detail: item.category.title, href: `library-lesson.html?id=${encodeURIComponent(item.id)}`, type: tr('درس', 'Lesson'), body: item.content })),
    ...data.tools.map((item) => ({ title: item.name, detail: item.description, href: 'tools.html', type: tr('أداة', 'Tool') })),
    ...data.labs.map((item, index) => ({ title: item.name, detail: item.desc, href: `practice-lab.html?id=${index}`, type: tr('مختبر', 'Lab') })),
    ...data.challenges.map((item, index) => ({ title: item.name, detail: item.desc, href: `practice-challenge.html?id=${index}`, type: tr('تحدي', 'Challenge') })),
  ].filter((item) => `${item.title} ${item.detail} ${item.body || ''}`.toLocaleLowerCase().includes(normalized)).slice(0, 40);
  target.innerHTML = results.length ? results.map((item) => `<a class="library-row" href="${item.href}"><span>${item.type}</span><strong>${esc(item.title)}</strong><small>${esc(item.detail)}</small><b>↗</b></a>`).join('') : empty(tr('لا توجد نتائج مطابقة.', 'No matching results.'));
}

function renderCertifications() {
  const career = data.categories.find((item) => item.order === 8);
  const paths = data.roadmapPaths.map((path) => `<a class="library-row" href="path.html?id=${encodeURIComponent(path[2])}"><span>EXAM</span><strong>${esc(path[1])}</strong><small>${tr('بعد الدروس وامتحانات الدورات والتقييم العملي', 'After lessons, course exams and the practical')}</small><b>↗</b></a>`).join('');
  return frame('CAREER / CERTIFICATIONS', tr('الشهادات والمسارات المهنية', 'Certifications and career paths'), tr('أكمل كورسات التخصص واجتز امتحانه للحصول على إثبات إنجاز Biuret، ثم استكشف الشهادات المهنية الخارجية.', 'Finish a specialty path and pass its exam for a Biuret achievement credential, then explore external professional certifications.'), `${notice()}${section(tr('إثباتات إنجاز Biuret', 'Biuret achievement credentials'), `<div class="catalog-callout"><strong>${tr('ابدأ بإثبات الأساسيات', 'Start with the Foundations credential')}</strong><p>${tr('تسعة دروس موثقة وتقييم عملي وامتحان نهائي، ثم دورات التخصص وامتحاناتها وتقييمها العملي وامتحان المسار.', 'Nine verified lessons, a practical and a final exam, followed by specialty courses, course exams, a practical and a path exam.')}</p><a href="certificate.html">${tr('إثبات الأساسيات', 'Foundations credential')} ↗</a></div><div class="library-list">${paths}</div>`)}${section(tr('دليل الشهادات الخارجية', 'External certification guide'), `<p class="library-note">${tr('هذه جهات خارجية مستقلة عن إثباتات Biuret. راجع الجهة المصدرة قبل التخطيط للامتحان أو دفع الرسوم.', 'These external certifications are separate from Biuret credentials. Check each issuer before planning an exam or paying fees.')}</p><div class="library-grid">${data.certifications.map((item) => `<article class="library-card"><span>${esc(item.provider)} · ${esc(item.difficulty)}</span><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><small>${esc(item.note)}</small></article>`).join('')}</div>`)}${section(tr('دروس المسار المهني', 'Career path lessons'), `<div class="library-list">${career.lessons.map(lessonCard).join('')}</div>`)}`);
}

function renderProfessional() {
  const career = data.categories.find((item) => item.order === 8);
  const practice = data.categories.filter((item) => [17, 18].includes(item.order));
  return frame('CAREER / HUB', tr('المركز الاحترافي', 'Professional hub'), tr('اربط ما تتعلمه بأدوار ومشاريع صغيرة تثبت مهارتك.', 'Connect what you learn to roles and small projects that demonstrate skill.'), `${notice()}${section(tr('ابدأ من المخرجات المهنية', 'Start with professional outcomes'), `<div class="library-list">${career.lessons.map(lessonCard).join('')}</div>`)}${section(tr('مجالات متقدمة', 'Advanced fields'), `<div class="library-grid">${practice.map(courseCard).join('')}</div>`)}${section(tr('طبّق في غرفة العمليات', 'Practice in operations'), `<p>${tr('حلل سيناريو حادث، واكتب قرارك والأدلة التي بنيته عليها.', 'Analyze an incident scenario and document your decision and evidence.')}</p><a class="button button-outline" href="operations.html">${tr('افتح غرفة العمليات', 'Open operations')} ↗</a>`)}`);
}

function renderSettings() {
  return frame('ACCOUNT / SETTINGS', tr('الإعدادات', 'Settings'), tr('اضبط اللغة وبيانات مكتبة التدريب المحلية.', 'Adjust language and local practice library data.'), `<div class="library-settings">${section(tr('اللغة', 'Language'), `<p>${tr('المحتوى والواجهة متاحان بالعربية والإنجليزية، مع اتجاه مناسب لكل لغة.', 'The content and interface are available in Arabic and English, with the correct direction for each language.')}</p><button class="button button-outline" id="settings-language" type="button">${tr('التبديل إلى الإنجليزية', 'Switch to Arabic')}</button>`)}${section(tr('بيانات التدريب المحلية', 'Local practice data'), `<p>${tr('المفضلة والملاحظات وبطاقات المراجعة ونتائج التدريب محفوظة لهذا الحساب على هذا المتصفح. حذفها لا يمس قراءة الدروس المسجلة في حسابك أو XP أو العملات.', 'Favorites, notes, review cards and practice results stay on this browser for your account. Clearing them does not remove server-recorded lesson reading, XP or coins.')}</p><button class="button button-outline" id="clear-library" type="button">${tr('حذف بيانات المكتبة المحلية', 'Clear local library data')}</button>`)}</div>`);
}

function renderProfile() {
  const person = user();
  return frame('ACCOUNT / PROFILE', tr('الملف الشخصي', 'Profile'), tr('حساب Biuret نفسه للموقع والأكاديمية، مع اختصار لتقدمك الموثق وتدريبك المحلي.', 'Your Biuret account for both sites, with quick access to verified progress and local practice.'), `<div class="library-profile"><article class="library-card"><span>BIURET ACCOUNT</span><h3>${esc(person?.name || tr('ضيف الأكاديمية', 'Academy guest'))}</h3><p>${esc(person?.email || tr('سجّل الدخول لحفظ تقدمك الموثق في حسابك.', 'Sign in to save verified progress in your account.'))}</p>${person ? '' : `<button class="button button-primary" id="profile-signin" type="button">${tr('تسجيل الدخول', 'Sign in')}</button>`}</article><article class="library-card"><span>LOCAL LIBRARY</span><h3>${Object.keys(state.completed).length} ${tr('دروس مقروءة', 'read lessons')}</h3><p>${state.favorites.length} ${tr('في المفضلة', 'favorites')} · ${Object.values(state.notes).filter(Boolean).length} ${tr('ملاحظات', 'notes')}</p><a href="review.html">${tr('المراجعة الذكية', 'Smart review')} ↗</a></article><article class="library-card"><span>VERIFIED LEARNING</span><h3>${tr('تقدمك الموثق', 'Verified progress')}</h3><p>${tr('شاهد المستوى وXP والعملات وسجل إنجازاتك في صفحة التقدم.', 'See your level, XP, coins and achievement history in Progress.')}</p><a href="progress.html">${tr('افتح تقدّمك', 'Open progress')} ↗</a></article></div>`);
}

function render() {
  if (!data || !user() || !membership) return;
  if (['courses', 'labs', 'quizzes', 'tools'].includes(page)) return renderCatalogExtras();
  if (page === 'challenges') return renderChallengeExtras();
  if (page === 'paths') return renderRoadmapExtras();
  if (!root) return;
  const selected = params.get('id');
  const restricted = {
    'library-course': ['course', categoryById(selected)?.order],
    'library-lesson': ['course', lessonById(selected)?.category?.order],
    'practice-quiz': ['quiz', Number(selected)],
    'practice-lab': ['lab', Number(selected)],
    'practice-challenge': ['challenge', Number(selected)],
    operation: ['operation', Number(selected)],
  }[page];
  if (restricted && Number.isInteger(restricted[1]) && !allowed(...restricted)) {
    root.innerHTML = frame('ACCESS / MEMBERSHIP', tr('المحتوى مقفل', 'Content locked'), '', lockedBody(...restricted));
    return;
  }
  const renderer = {
    'library-course': renderCourse, 'library-lesson': renderLesson,
    'practice-quiz': renderQuiz, 'practice-lab': renderLab,
    'practice-challenge': renderChallenge, operations: renderOperations,
    operation: renderOperation, review: renderReview, favorites: renderFavorites,
    notes: renderNotes, search: renderSearch, certifications: renderCertifications,
    professional: renderProfessional, settings: renderSettings, profile: renderProfile,
  }[page];
  const currentSearch = page === 'search' ? document.querySelector('#library-search')?.value || '' : '';
  root.innerHTML = renderer ? renderer() : '';
  const supplier=page==='practice-lab'&&Number(params.get('id'))===assurancePractice.index&&params.get('context')==='supplier';
  if(supplier&&user())mountAssurance(root.querySelector('#supplier-workbench'),{owner:user().$id,language:currentLanguage()});
  const reverse=page==='practice-lab'&&Number(params.get('id'))===reversePractice.index&&params.get('context')==='reverse';
  if(reverse&&user())mountReverse(root.querySelector('#reverse-workbench'),{owner:user().$id,language:currentLanguage()});
  const specialist=page==='practice-lab'?specialistVariant(Number(params.get('id')),params.get('context')):null;
  if(specialist&&user())mountSpecialist(root.querySelector('#specialist-workbench'),{owner:user().$id,language:currentLanguage(),kind:specialist});
  if (page === 'practice-lab' && [1, 7].includes(Number(params.get('id'))) && params.get('context')!=='cloud' && !specialist && !supplier && user()) {
    root.insertAdjacentHTML('beforeend', '<div id="evidence-workbench"></div>');
    mountWorkbench(root.querySelector('#evidence-workbench'), { owner: user().$id, language: currentLanguage(), context: 'soc' });
  }
  if (page === 'practice-lab' && Number(params.get('id')) === 2 && !specialist && user()) {
    root.insertAdjacentHTML('beforeend', '<div id="authorization-workbench"></div>');
    mountAuthorizationLab(root.querySelector('#authorization-workbench'), { owner: user().$id, language: currentLanguage() });
  }
  if (page === 'practice-lab' && !specialist && !reverse && !supplier && user()) {
    const index=Number(params.get('id'));
    const kind=index===6?'dfir':index===7&&params.get('context')==='cloud'?'cloud':null;
    if(kind) {
      if(kind==='dfir')root.insertAdjacentHTML('beforeend','<div id="cloud-dfir-workbench"></div>');
      mountCloudDfir(root.querySelector('#cloud-dfir-workbench'),{owner:user().$id,language:currentLanguage(),kind});
    }
  }
  if (page === 'library-lesson') {
    const lesson = lessonById(params.get('id'));
    const reading = root.querySelector('.library-reading');
    if (lesson?.metadata && !lesson.guide && reading) {
      const info = lesson.metadata;
      reading.insertAdjacentHTML('afterbegin', `<div class="library-study-brief"><span class="section-kicker">${tr('خطة الدرس', 'Lesson plan')} · ${info.estimatedMinutes} ${tr('دقيقة', 'min')}</span><h2>${tr('بعد هذا الدرس', 'After this lesson')}</h2><ul>${info.objectives.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><p><strong>${tr('قبل البدء:', 'Before starting:')}</strong> ${esc(info.prerequisites.join('، '))}</p></div>`);
      reading.insertAdjacentHTML('beforeend', `<div class="library-study-brief"><h2>${tr('طبّق الفكرة', 'Apply the idea')}</h2><p>${esc(info.exercise)}</p><div class="library-sources"><strong>${tr('مراجع للمزيد', 'Further reading')}</strong>${info.sources.filter((source) => /^https:\/\//.test(source.url)).map((source) => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a>`).join('')}</div></div>`);
    }
  }
  if (page === 'search') {
    document.querySelector('#library-search').value = currentSearch;
    searchResults(currentSearch);
  }
}

document.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (button?.id === 'library-retry') { await loadLibrary(); return; }
  if (!button || !data || !user() || !membership) return;
  const lessonId = params.get('id');
  if (button.id === 'favorite-button') {
    state.favorites = state.favorites.includes(lessonId) ? state.favorites.filter((id) => id !== lessonId) : [...state.favorites, lessonId];
    save(); render();
  }
  if (button.id === 'save-note') {
    state.notes[lessonId] = document.querySelector('#lesson-note')?.value || ''; save();
    announce(tr('حُفظت الملاحظة على هذا المتصفح.', 'Note saved in this browser.'));
  }
  if (button.dataset.review) {
    state.reviewed[button.dataset.review] = new Date().toISOString(); save(); render();
  }
  if (button.dataset.recall) {
    const card = state.reviewCards[button.dataset.recall];
    if (card) {
      const intervals = [1, 3, 7, 14, 30, 60];
      card.stage = button.dataset.rating === 'remembered' ? Math.min((card.stage || 0) + 1, intervals.length - 1) : 0;
      card.dueAt = new Date(Date.now() + intervals[card.stage] * 86400000).toISOString();
      save(); render();
    }
  }
  if (button.id === 'settings-language') document.querySelector('#language-toggle')?.click();
  if (button.id === 'clear-library' && confirm(tr('هل تريد حذف بيانات مكتبة التدريب المحلية؟', 'Clear local practice library data?'))) {
    localStorage.removeItem(key()); loadPersonalState(); render();
  }
  if (button.id === 'profile-signin') document.querySelector('#account-button')?.click();
  if (button.dataset.choice) {
    const operation = data.operations[Number(params.get('id'))];
    const group = button.closest('[data-group]')?.dataset.group;
    const choice = (group === 'decision' ? operation.decisions : operation.responses).find((item) => item.id === button.dataset.choice);
    if (!choice || (group === 'response' && !state.practice[`operation-${operation.id}-decision`])) return;
    if (group === 'decision') delete state.practice[`operation-${operation.id}-response`];
    state.practice[`operation-${operation.id}-${group}`] = { choice: choice.id, revision: operation.revision, date: new Date().toISOString() }; save();
    render();
    document.querySelector(`[data-group="${group}"] [data-choice="${choice.id}"]`)?.focus({ preventScroll: true });
  }
});

document.addEventListener('submit', async (event) => {
  if (event.target.id === 'lesson-checkpoint-form' && data && user() && membership) {
    event.preventDefault();
    const button = event.target.querySelector('button[type="submit"]'); button.disabled = true;
    const lessonId = params.get('id'); const owner = user().$id;
    try {
      const result = await markProgramLesson(lessonId, Number(new FormData(event.target).get('answer')));
      if (user()?.$id !== owner) return;
      if (result.read) { lessonStatus = { read: true, ready: true }; state.completed[lessonId] = new Date().toISOString(); save(); render(); announce(tr('أحسنت. إكمال الدرس محفوظ في حسابك.', 'Well done. Lesson completion is saved in your account.')); }
    } catch (error) {
      if (user()?.$id !== owner) return;
      checkpointFeedback = error.code === 422 ? tr('الإجابة لا تطابق الدليل. راجع الفكرة والعينة ثم حاول مرة أخرى.', 'That answer does not match the evidence. Review the concept and sample, then retry.') : error.code === 409 ? tr('أكمل الدرس السابق أولاً.', 'Complete the previous lesson first.') : tr('تعذر حفظ التحقق. حاول مرة أخرى.', 'Could not save the checkpoint. Please retry.');
      const feedback = document.querySelector('#lesson-checkpoint-feedback'); if (feedback) feedback.textContent = checkpointFeedback;
    } finally { if (button.isConnected) button.disabled = false; }
    return;
  }
  if (event.target.id !== 'practice-form' || !data || !user() || !membership) return;
  event.preventDefault();
  const form = event.target;
  const result = document.querySelector('#practice-result');
  let correct = 0, count = 1, id = '';
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  try {
  if (page === 'practice-quiz') {
    const index = Number(params.get('id'));
    const quiz = data.quizzes[index];
    const answers = quiz.questions.map((question, questionIndex) => Number(new FormData(form).get(`q${questionIndex}`)));
    const scored = await checkProgramPractice('quiz', index, answers, currentLanguage());
    count = scored.count; correct = scored.correct;
    scored.review.forEach((question, questionIndex) => {
      const cardId = `quiz-${index}-question-${questionIndex}`;
      if (question.missed) {
        state.reviewCards[cardId] = {
          quiz: quiz.name, quizTitles: { ar: dataAr?.quizzes[index]?.name || quiz.name, en: dataEn?.quizzes[index]?.name || quiz.name },
          question: question.question, answer: question.answer, text: question.text,
          stage: 0, dueAt: new Date().toISOString(),
        };
      }
    });
    id = `quiz-${index}`;
    result.innerHTML = `<strong>${correct} / ${count}</strong><ol>${scored.review.map((question) => `<li>${esc(question.question)}<br><small>${tr('الإجابة:', 'Answer:')} ${esc(question.answer)}</small></li>`).join('')}</ol>`;
  } else {
    const index = Number(params.get('id'));
    const scored = await checkProgramPractice(page === 'practice-lab' ? 'lab' : 'challenge', index, Number(new FormData(form).get('answer')), currentLanguage());
    correct = scored.correct; count = scored.count;
    id = `${page}-${index}`;
    result.innerHTML = `<strong>${correct ? tr('إجابة صحيحة', 'Correct answer') : tr('راجع العينة وحاول ثانية', 'Review the sample and try again')}</strong><p>${esc(scored.explanation)}</p>${correct ? `<p>${tr('هذا تدريب ذاتي فقط، لا يمنح XP أو عملات.', 'This is self practice only; no XP or coins are awarded.')}</p>` : ''}`;
  }
  result.className = `library-feedback ${correct === count ? 'success' : ''}`;
  state.practice[id] = { correct, count, date: new Date().toISOString() }; save();
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) { announce(error.message || tr('تعذر تصحيح التدريب.', 'Could not check this practice.')); }
  finally { submitButton.disabled = false; }
});

document.addEventListener('input', (event) => {
  if (!user() || !membership) return;
  if (event.target.id === 'library-search') searchResults(event.target.value);
  if (event.target.id === 'operation-note') { state.notes[`operation-${params.get('id')}`] = event.target.value; save(); }
  if (event.target.id === 'practice-note') { state.notes[`${page}-${params.get('id')}`] = event.target.value; save(); }
  if (event.target.closest('#lesson-checkpoint-form') && event.target.name === 'answer') checkpointAnswer = Number(event.target.value);
  if (event.target.id === 'lesson-note') {
    state.notes[params.get('id')] = event.target.value;
    save();
  }
});
document.querySelector('#language-toggle')?.addEventListener('click', () => setTimeout(async () => {
  const language = currentLanguage();
  if (!(language === 'en' ? dataEn : dataAr)) {
    if (root) root.innerHTML = frame('LIBRARY', tr('جارٍ تحميل الترجمة…', 'Loading translation…'), '', '');
    try { await ensureLanguage(language); } catch (error) { announce(error.message); return; }
  }
  data = language === 'en' ? dataEn : dataAr;
  render();
}, 0));

async function ensureLanguage(language) {
  if (languageLoads.has(language)) return languageLoads.get(language);
  const owner = user()?.$id;
  const loading = loadProgramLibrary(language).then(({ membership: plan, foundationsPassed: passed, library }) => {
    if (!owner || user()?.$id !== owner || libraryOwner !== owner) return;
    if (!['free', 'plus', 'pro'].includes(plan.effectivePlan || plan.plan)) throw new Error('Invalid membership state');
    membership = plan; foundationsPassed = Boolean(passed);
    if (language === 'en') dataEn = library; else dataAr = library;
  }).catch((error) => { languageLoads.delete(language); throw error; });
  languageLoads.set(language, loading);
  return loading;
}

function catalogLoadState(failed = false) {
  if (root || !['courses', 'labs', 'quizzes', 'tools', 'challenges'].includes(page)) return;
  const target = document.querySelector('#catalog-main') || document.querySelector('main');
  if (!target) return;
  target.querySelector('#desktop-append')?.remove();
  target.insertAdjacentHTML('beforeend', `<section id="desktop-append" class="catalog-body section-frame" role="${failed ? 'alert' : 'status'}"><h2>${failed ? tr('تعذر تحميل بقية المحتوى', 'More content could not be loaded') : tr('جارٍ تحميل بقية المحتوى…', 'Loading more content…')}</h2><p>${failed ? tr('القائمة غير مكتملة الآن. أعد المحاولة لتحميل دورات التخصص وتدريباته.', 'This list is incomplete right now. Retry to load specialty courses and practice.') : tr('نحمّل المحتوى المتاح لحسابك.', 'Loading content available to your account.')}</p>${failed ? `<button class="button button-primary" type="button" id="library-retry">${tr('إعادة المحاولة', 'Retry')}</button>` : ''}</section>`);
}

async function loadLibrary() {
  try {
    if (!user()) await loadUser();
    if (!user()) { membership = null; data = null; libraryOwner = null; languageLoads.clear(); dataAr = dataEn = null; return; }
    if (root) root.innerHTML = frame('LIBRARY', tr('جارٍ تجهيز محتواك…', 'Preparing your content…'), '', '');
    catalogLoadState();
    if (libraryOwner !== user().$id) { lessonStatus = null; checkpointAnswer = undefined; checkpointFeedback = ''; libraryOwner = user().$id; languageLoads.clear(); dataAr = dataEn = null; }
    loadPersonalState();
    await ensureLanguage(currentLanguage());
    data = currentLanguage() === 'en' ? dataEn : dataAr;
    render();
    if (page === 'library-lesson' && allowed('course', lessonById(params.get('id'))?.category?.order)) {
      const owner = user().$id;
      try {
        const status = await loadProgramLessonState(params.get('id'));
        if (user()?.$id === owner) {
          lessonStatus = status;
          if (status.read) state.completed[params.get('id')] = status.completedAt || new Date().toISOString();
          else delete state.completed[params.get('id')];
          save(); render();
        }
      } catch { if (user()?.$id === owner) { lessonStatus = null; announce(tr('تعذر التحقق من إكمال الدرس. حدّث الصفحة للمحاولة مجدداً.', 'Could not verify lesson completion. Refresh to retry.')); } }
    }
    ensureLanguage(currentLanguage() === 'en' ? 'ar' : 'en').catch((error) => console.warn('Second library language unavailable:', error));
  } catch (error) {
    console.error('Academy library unavailable:', error);
    membership = null;
    catalogLoadState(true);
    if (root) root.innerHTML = frame('LIBRARY', tr('تعذر تحميل المكتبة', 'Library unavailable'), tr('تعذر الاتصال بالمحتوى. يمكنك إعادة المحاولة هنا.', 'Could not connect to your content. You can retry here.'), `<button class="button button-primary" type="button" id="library-retry">${tr('إعادة المحاولة', 'Retry')}</button>`);
  }
}

window.addEventListener('biuret-auth-changed', loadLibrary);
loadLibrary();
