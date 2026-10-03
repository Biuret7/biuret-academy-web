import { currentLanguage, setPageHeaderTitle } from './i18n.js?v=20260929-1';
import { user, loadUser, loadProgramLibrary, markProgramLesson, checkProgramPractice } from './auth.js?v=20261003-1';
import { requiredPlan, canAccess } from './plan-access.js?v=20260929-1';

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
function loadPersonalState() {
  try { state = JSON.parse(localStorage.getItem(key())) || {}; } catch { state = {}; }
  state.completed ||= {};
  state.favorites ||= [];
  state.notes ||= {};
  state.practice ||= {};
  state.reviewed ||= {};
  state.reviewCards ||= {};
  if (state.practiceQuizBankVersion !== 2 && user()) {
    for (const id of Object.keys(state.reviewCards)) {
      if (/^quiz-\d+-question-\d+$/.test(id)) delete state.reviewCards[id];
    }
    for (const id of Object.keys(state.practice)) {
      if (/^quiz-\d+$/.test(id)) delete state.practice[id];
    }
    state.practiceQuizBankVersion = 2;
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
const tierBadge = (kind, index) => `<span class="library-tier tier-${requiredPlan(kind, index)}">${requiredPlan(kind, index).toUpperCase()}</span>`;
const lockedBody = (kind, index) => `<div class="library-locked"><span class="section-kicker">${requiredPlan(kind, index).toUpperCase()} / BIURET ACADEMY</span><h2>${tr('خطوة التعلّم التالية مقفلة حالياً.', 'Your next learning step is locked.')}</h2><p>${!foundationsPassed && !membership?.admin && requiredPlan(kind, index) !== 'free' ? tr('أكمل دروس الأساسيات وامتحانها أولاً، ثم اختر تخصصك حسب خطة عضويتك.', 'Complete Foundations and its exam first, then choose a specialty within your plan.') : tr('هذا المحتوى يتطلب خطة أعلى. راجع العضويات والمحتوى المتاح في خطتك.', 'This content requires a higher plan. Compare membership options and available content.')}</p><a class="button button-primary" href="${!foundationsPassed && requiredPlan(kind, index) !== 'free' ? 'paths.html#foundations-roadmap' : 'membership.html'}">${!foundationsPassed && requiredPlan(kind, index) !== 'free' ? tr('ابدأ الأساسيات', 'Start Foundations') : tr('قارن الخطط', 'Compare plans')} ↗</a></div>`;
const notice = () => `<div class="catalog-callout library-notice"><strong>${tr('من برنامج Biuret Academy', 'From the Biuret Academy program')}</strong><p>${tr('ابدأ بدروس الأساسيات وامتحانها، ثم انتقل إلى كورسات تخصصك وتطبيقاتها. تُوثّق قراءة دروس البرنامج ونتائج امتحانات دوراته في حسابك؛ ثم تنجز التقييم العملي وامتحان المسار. الملاحظات والمراجعة التدريبية تبقى في هذا المتصفح.', 'Start with Foundations and its exam, then move to your specialty courses and practice. Program lesson reading and course exam results are saved to your account; next complete the practical assessment and path exam. Notes and practice review stay in this browser.')}</p><a href="paths.html">${tr('خطة التعلّم', 'Learning route')} ↗</a></div>`;
const frame = (label, title, intro, body) => `<section class="catalog-hero section-frame"><a class="learning-back" href="paths.html">← ${tr('خطة التعلّم', 'Learning route')}</a><span class="section-kicker">${label}</span><h1>${esc(title)}</h1><p>${intro}</p></section><section class="catalog-body section-frame">${body}</section>`;
const section = (title, body) => `<section class="library-section"><h2>${title}</h2>${body}</section>`;
const empty = (message) => `<p class="library-empty">${message}</p>`;
const courseCard = (category) => `<a class="library-card ${allowed('course', category.order) ? '' : 'is-locked'}" href="library-course.html?id=${encodeURIComponent(category.id)}"><span>${esc(category.icon)} &nbsp; COURSE / ${String(category.order).padStart(2, '0')} ${tierBadge('course', category.order)}</span><h3>${esc(category.title)}</h3><p>${esc(category.description)}</p><small>${category.lessons.length} ${tr('دروس', 'lessons')} · ${category.lessons.filter((item) => state.completed[item.id]).length} ${tr('مقروءة', 'read')}</small><b>${allowed('course', category.order) ? tr('افتح الكورس', 'Open course') : tr('شاهد شروط الوصول', 'View access')} ↗</b></a>`;
const lessonCard = (lesson) => `<a class="library-row ${allowed('course', lesson.category?.order ?? data.categories.find((category) => category.lessons.some((item) => item.id === lesson.id))?.order) ? '' : 'is-locked'}" href="library-lesson.html?id=${encodeURIComponent(lesson.id)}"><span>${String(lesson.order).padStart(2, '0')}</span><strong>${esc(lesson.title)}</strong><small>${state.completed[lesson.id] ? tr('مقروء', 'Read') : esc(lesson.difficulty)}</small><b>↗</b></a>`;
const simpleCards = (items, target, titleOf, descOf) => {
  const kind = ({ 'practice-lab': 'lab', 'practice-quiz': 'quiz', 'practice-challenge': 'challenge', operation: 'operation' })[target];
  return `<div class="library-grid">${items.map((item, index) => `<a class="library-card ${allowed(kind, index) ? '' : 'is-locked'}" href="${target}.html?id=${index}"><span>${String(index + 1).padStart(2, '0')} / ${target.toUpperCase()} ${tierBadge(kind, index)}</span><h3>${esc(titleOf(item))}</h3><p>${esc(descOf(item))}</p><b>${allowed(kind, index) ? tr('افتح التدريب', 'Open practice') : tr('شاهد شروط الوصول', 'View access')} ↗</b></a>`).join('')}</div>`;
};

function renderCatalogExtras() {
  const target = document.querySelector('#catalog-main');
  if (!target) return;
  target.querySelector('#desktop-append')?.remove();
  let body = '';
  if (page === 'courses') body = section(tr('كورسات برنامج Biuret Academy', 'Biuret Academy program courses'), `${notice()}<div class="library-grid">${data.categories.map(courseCard).join('')}</div>`);
  if (page === 'labs') body = section(tr('مختبرات البرنامج', 'Program labs'), `${notice()}${simpleCards(data.labs, 'practice-lab', (x) => x.name, (x) => x.desc)}`);
  if (page === 'quizzes') body = section(tr('اختبارات البرنامج التدريبية', 'Program practice quizzes'), `<div class="catalog-callout library-notice"><strong>${tr('تدريب مستقل عن امتحانات الدورات', 'Separate from course exams')}</strong><p>${tr('هذه أسئلة مراجعة جديدة ومختلفة عن بنك امتحانات إكمال الدورات. يمكنك إعادتها للتدريب، ولا تُحتسب نتيجتها للشهادة أو XP الموثق.', 'These are new review questions, different from the course completion exam bank. You can retry them for practice; their results do not count toward credentials or verified XP.')}</p></div>${simpleCards(data.quizzes, 'practice-quiz', (x) => x.name, (x) => x.topics)}`);
  if (page === 'tools') body = section(tr('دليل أدوات البرنامج', 'Program tool guides'), `${notice()}<div class="tool-guide-list">${data.tools.map((tool, index) => `<details class="tool-guide" ${allowed('tool', index) ? '' : 'data-locked="true"'}><summary><span>${esc(tool.category)} ${tierBadge('tool', index)}</span><strong>${esc(tool.name)}</strong><i aria-hidden="true">${allowed('tool', index) ? '+' : '🔒'}</i></summary><div class="tool-guide-body">${allowed('tool', index) ? `<p>${esc(tool.description)}</p><p>${esc(tool.usage)}</p><code dir="ltr">${esc(tool.example)}</code><p>${esc(tool.platform)}</p>` : lockedBody('tool', index)}</div></details>`).join('')}</div>`);
  if (body) target.insertAdjacentHTML('beforeend', `<div id="desktop-append" class="section-frame">${body}</div>`);
}

function renderChallengeExtras() {
  const main = document.querySelector('#main');
  if (!main) return;
  main.querySelector('#desktop-append')?.remove();
  main.insertAdjacentHTML('beforeend', `<div id="desktop-append" class="section-frame">${section(tr('تحديات برنامج الأكاديمية', 'Academy program challenges'), `${notice()}${simpleCards(data.challenges, 'practice-challenge', (x) => x.name, (x) => x.desc)}`)}</div>`);
}

function renderRoadmapExtras() {
  const main = document.querySelector('#main');
  if (!main) return;
  main.querySelector('#desktop-append')?.remove();
  const cards = data.roadmapPaths.map(([icon, title, pathId, steps, certs, , categoryIds]) => `<article class="library-card"><span>${esc(icon)} &nbsp; ROADMAP</span><h3>${esc(title)}</h3><ol class="library-bullets">${steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol><p>${tr('شهادات خارجية مقترحة في البرنامج:', 'Suggested external certifications:')} ${esc(certs)}</p><div class="library-sources">${categoryIds.map((id) => data.categories.find((category) => category.order === id)).filter(Boolean).map((category) => `<a href="library-course.html?id=${encodeURIComponent(category.id)}">${esc(category.title)} ↗</a>`).join('')}</div><div class="library-sources"><a href="practical.html?id=${encodeURIComponent(pathId)}">${tr('التقييم العملي', 'Practical assessment')} ↗</a><a href="path-exam.html?id=${encodeURIComponent(pathId)}">${tr('امتحان المسار وشهادته', 'Path exam and credential')} ↗</a></div></article>`).join('');
  main.insertAdjacentHTML('beforeend', `<div id="desktop-append" class="section-frame">${section(tr('خرائط تخصصات برنامج الأكاديمية', 'Academy program specialty roadmaps'), `${notice()}<div class="library-grid">${cards}</div>`)}</div>`);
}

function renderCourse() {
  const category = categoryById(params.get('id'));
  if (!category) return frame('LIBRARY / COURSE', tr('الكورس غير موجود', 'Course not found'), '', `<a href="courses.html">${tr('كل الكورسات', 'All courses')} ↗</a>`);
  setPageHeaderTitle(titles('categories', category.id));
  const linkedPaths = data.roadmapPaths.filter((path) => path[6].includes(category.order));
  return frame('LIBRARY / COURSE', category.title, esc(category.description), `${notice()}<div class="library-summary"><span>${category.lessons.length} ${tr('دروس', 'lessons')}</span><span>${category.lessons.filter((item) => state.completed[item.id]).length} ${tr('مقروءة', 'read')}</span></div><div class="library-list">${category.lessons.map(lessonCard).join('')}</div>${section(tr('امتحان هذه الدورة', 'This course exam'), `<p>${tr('بعد قراءة الدروس، اجتز امتحان الدورة المحفوظ في حسابك. تحتاج المسارات التي تضمها إلى هذه النتيجة قبل تقييمها العملي.', 'After reading the lessons, pass the course exam saved in your account. Paths containing this course need that result before their practical assessment.')}</p><a class="button button-primary" href="course-exam.html?order=${category.order}">${tr('افتح امتحان الدورة', 'Open course exam')} ↗</a>`)}${linkedPaths.length ? section(tr('هذا الكورس ضمن مسارات', 'This course is part of'), `<div class="library-sources">${linkedPaths.map((path) => `<a href="path-exam.html?id=${encodeURIComponent(path[2])}">${esc(path[1])} · ${tr('الامتحان والشهادة', 'Exam and credential')} ↗</a>`).join('')}</div>`) : ''}<a class="button button-outline" href="courses.html">${tr('كل الكورسات', 'All courses')} ↗</a>`);
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
  return frame('LIBRARY / LESSON', lesson.title, `<a href="library-course.html?id=${encodeURIComponent(lesson.category.id)}">${esc(lesson.category.title)} ↗</a> · ${esc(lesson.difficulty)}`, `${notice()}<div class="library-lesson-layout"><article class="library-reading" dir="${currentLanguage() === 'en' ? 'ltr' : 'rtl'}">${esc(lesson.content).split(/\n\s*\n/).map((block) => `<p>${block.replace(/\n/g, '<br>')}</p>`).join('')}</article><aside class="library-lesson-tools"><button class="button button-outline" id="favorite-button" type="button">${favorite ? tr('★ محفوظ في المفضلة', '★ Saved to favorites') : tr('☆ أضف للمفضلة', '☆ Add to favorites')}</button><button class="button button-primary" id="complete-button" type="button">${state.completed[lesson.id] ? tr('✓ قرأته', '✓ Marked as read') : tr('حدد الدرس كمقروء', 'Mark lesson as read')}</button><label for="lesson-note">${tr('ملاحظتك الخاصة', 'Your private note')}</label><textarea id="lesson-note" rows="9" placeholder="${tr('اكتب ما تريد تذكره…', 'Write what you want to remember…')}">${esc(state.notes[lesson.id] || '')}</textarea><button class="button button-outline" id="save-note" type="button">${tr('احفظ الملاحظة', 'Save note')}</button><small>${tr('هذه البيانات محفوظة على هذا المتصفح فقط.', 'This data is stored in this browser only.')}</small></aside></div><nav class="library-next">${previous ? `<a href="library-lesson.html?id=${encodeURIComponent(previous.id)}">← ${esc(previous.title)}</a>` : '<span></span>'}${next ? `<a href="library-lesson.html?id=${encodeURIComponent(next.id)}">${esc(next.title)} →</a>` : `<a href="library-course.html?id=${encodeURIComponent(lesson.category.id)}">${tr('الكورس', 'Course')} ↗</a>`}</nav>`);
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
  setPageHeaderTitle({ ar: lab.name, en: lab.name });
  return frame('PRACTICE / LAB', lab.name, esc(lab.desc), `${notice()}<div class="library-lab-grid"><div>${section(tr('الأهداف', 'Objectives'), `<ul class="library-bullets">${lab.objectives.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`)}${section(tr('خطوات البرنامج الأصلية', 'Program steps'), `<ol class="library-bullets" dir="${currentLanguage() === 'en' ? 'ltr' : 'rtl'}">${lab.steps.map((step) => `<li>${esc(step[0])}<code dir="ltr">${esc(step[1])}</code></li>`).join('')}</ol>`)}<p class="library-note">${tr('الأوامر أمثلة من البرنامج الأصلي. استخدمها فقط في بيئة تدريب مصرح بها؛ هذا الموقع يعرض عينة صناعية للتحليل ولا يشغّل أدوات.', 'Commands are examples from the original program. Use them only in an authorized lab; this site presents synthetic evidence for analysis and does not run tools.')}</p></div><div>${section(tr('العينة الصناعية', 'Synthetic sample'), `<pre class="library-sample" dir="ltr">${esc(lab.sample)}</pre>`)}</div></div>${singleCheck(lab.verify_q, lab.verify_opts, `lab-${index}`)}`);
}

function renderChallenge() {
  const index = Number(params.get('id'));
  const challenge = data.challenges[index];
  if (!challenge) return frame('PRACTICE / CHALLENGE', tr('التحدي غير موجود', 'Challenge not found'), '', '<a href="challenges.html">Challenges ↗</a>');
  setPageHeaderTitle({ ar: challenge.name, en: challenge.name });
  return frame('PRACTICE / CHALLENGE', challenge.name, esc(challenge.desc), `${notice()}<div class="library-summary"><span>${esc(challenge.diff)}</span><span>${esc(challenge.category)}</span></div>${singleCheck(challenge.verify_q, challenge.verify_opts, `challenge-${index}`)}<details class="library-hint"><summary>${tr('تلميح', 'Hint')}</summary><p>${esc(challenge.hint)}</p></details>`);
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
  setPageHeaderTitle({ ar: operation.title, en: operation.title });
  return frame(`OPERATION / ${esc(operation.codename)}`, operation.title, esc(operation.summary), `${notice()}<div class="library-summary"><span>${esc(operation.track)}</span><span>${esc(operation.severity)}</span><span>${esc(operation.duration)}</span></div>${section(tr('التنبيه', 'Alert'), `<p>${esc(operation.alert)}</p>`)}${section(tr('الخط الزمني', 'Timeline'), `<ol class="library-timeline">${operation.timeline.map((row) => `<li><time>${esc(row[0])}</time><span>${esc(row[1])}</span></li>`).join('')}</ol>`)}${section(tr('الأدلة', 'Evidence'), `<div class="library-grid">${operation.evidence.map((item) => `<article class="library-card"><span>${esc(item.tag)}</span><h3>${esc(item.icon)} ${esc(item.title)}</h3><p>${esc(item.detail)}</p></article>`).join('')}</div>`)}${section(tr('قرارك الأول', 'First decision'), choiceButtons(operation.decisions, 'decision'))}${section(tr('خطة الاستجابة', 'Response plan'), choiceButtons(operation.responses, 'response'))}<div id="operation-result" class="library-feedback" role="status"></div>`);
}

function choiceButtons(choices, group) {
  return `<div class="library-choices" data-group="${group}">${choices.map((choice) => `<button type="button" data-choice="${esc(choice.id)}"><strong>${esc(choice.title)}</strong><small>${esc(choice.detail)}</small></button>`).join('')}</div>`;
}

function renderReview() {
  const lessons = allLessons().filter((item) => state.completed[item.id]);
  const due = lessons.filter((item) => Date.now() - new Date(state.reviewed[item.id] || state.completed[item.id]).getTime() >= 86400000);
  const cards = Object.entries(state.reviewCards).filter(([, card]) => new Date(card.dueAt).getTime() <= Date.now());
  const cardHtml = cards.map(([id, card]) => `<article class="review-card"><span class="section-kicker">${esc(card.quizTitles?.[currentLanguage()] || card.quiz)}</span><h3>${esc(card.text?.[currentLanguage()]?.question || card.question)}</h3><details><summary>${tr('أظهر الإجابة', 'Show answer')}</summary><p>${esc(card.text?.[currentLanguage()]?.answer || card.answer)}</p></details><div><button type="button" data-recall="${esc(id)}" data-rating="hard">${tr('صعب عليّ', 'Still difficult')}</button><button type="button" data-recall="${esc(id)}" data-rating="remembered">${tr('تذكرت', 'Remembered')}</button></div></article>`).join('');
  return frame('LEARN / REVIEW', tr('المراجعة الذكية', 'Smart review'), tr('تُنشأ بطاقات من أخطائك في الاختبارات التدريبية، وتعود بعد 1 و3 و7 و14 و30 و60 يوماً. راجع أيضاً الدروس التي قرأتها.', 'Cards are created from practice quiz mistakes and return after 1, 3, 7, 14, 30 and 60 days. Revisit lessons you have read too.'), `${notice()}<div class="library-summary"><span>${lessons.length} ${tr('دروس مقروءة', 'read lessons')}</span><span>${cards.length} ${tr('بطاقات مستحقة', 'due cards')}</span><span>${due.length} ${tr('دروس للمراجعة', 'lessons to revisit')}</span></div>${section(tr('بطاقات من أخطائك', 'Cards from your mistakes'), cards.length ? `<div class="review-grid">${cardHtml}</div>` : empty(tr('لا توجد بطاقات مستحقة. أكمل اختباراً تدريبياً لتنشأ بطاقات من أخطائك.', 'No cards are due. Take a practice quiz to create cards from missed questions.')))}${section(tr('دروس تستحق العودة إليها', 'Lessons worth revisiting'), due.length ? `<div class="library-list">${due.map((lesson) => `<div class="library-row"><span>↻</span><a href="library-lesson.html?id=${encodeURIComponent(lesson.id)}">${esc(lesson.title)}</a><button type="button" data-review="${esc(lesson.id)}">${tr('راجعت الدرس', 'Reviewed')}</button></div>`).join('')}</div>` : empty(tr('لا توجد دروس مستحقة الآن.', 'No lessons are due now.')))}<a class="button button-outline" href="courses.html">${tr('افتح الكورسات', 'Open courses')} ↗</a>`);
}

function renderFavorites() {
  const lessons = state.favorites.map(lessonById).filter(Boolean);
  return frame('LEARN / FAVORITES', tr('المفضلة', 'Favorites'), tr('الدروس التي أردت الرجوع إليها سريعاً.', 'Lessons you saved for quick access.'), `${notice()}${lessons.length ? `<div class="library-list">${lessons.map(lessonCard).join('')}</div>` : empty(tr('لم تحفظ أي درس بعد. افتح درساً واضغط إضافة للمفضلة.', 'No favorites yet. Open a lesson and save it.'))}`);
}

function renderNotes() {
  const entries = Object.entries(state.notes).filter(([, text]) => text?.trim());
  return frame('LEARN / NOTES', tr('ملاحظاتي', 'My notes'), tr('احتفظ بأفكارك بجانب الدروس. الملاحظات محفوظة في هذا المتصفح.', 'Keep ideas next to lessons. Notes are stored in this browser.'), `${notice()}${entries.length ? `<div class="library-grid">${entries.map(([id, note]) => { const lesson = lessonById(id); return lesson ? `<article class="library-card"><span>${esc(lesson.category.title)}</span><h3>${esc(lesson.title)}</h3><p>${esc(note)}</p><a href="library-lesson.html?id=${encodeURIComponent(id)}">${tr('افتح الملاحظة', 'Open note')} ↗</a></article>` : ''; }).join('')}</div>` : empty(tr('لا توجد ملاحظات بعد. اكتب أول ملاحظة داخل أي درس.', 'No notes yet. Write your first note inside a lesson.'))}`);
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
  const paths = data.roadmapPaths.map((path) => `<a class="library-row" href="path-exam.html?id=${encodeURIComponent(path[2])}"><span>EXAM</span><strong>${esc(path[1])}</strong><small>${tr('بعد الدروس وامتحانات الدورات والتقييم العملي', 'After lessons, course exams and the practical')}</small><b>↗</b></a>`).join('');
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
  if (page === 'library-lesson') {
    const lesson = lessonById(params.get('id'));
    const reading = root.querySelector('.library-reading');
    if (lesson?.metadata && reading) {
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
  if (!button || !data || !user() || !membership) return;
  const lessonId = params.get('id');
  if (button.id === 'favorite-button') {
    state.favorites = state.favorites.includes(lessonId) ? state.favorites.filter((id) => id !== lessonId) : [...state.favorites, lessonId];
    save(); render();
  }
  if (button.id === 'complete-button') {
    button.disabled = true;
    try {
      await markProgramLesson(lessonId);
      state.completed[lessonId] ||= new Date().toISOString(); save(); render();
      announce(tr('حُفظت قراءتك في حسابك. ارجع للمراجعة غداً.', 'Your reading is saved to your account. Review it tomorrow.'));
    } catch (error) { button.disabled = false; announce(error.message || tr('تعذر حفظ الدرس.', 'Could not save this lesson.')); }
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
    button.closest('.library-choices').querySelectorAll('button').forEach((item) => item.classList.toggle('selected', item === button));
    const result = document.querySelector('#operation-result');
    result.innerHTML = `<strong>${esc(choice.title)}</strong><p>${esc(choice.explanation)}</p>`;
    state.practice[`operation-${operation.id}-${group}`] = { choice: choice.id, date: new Date().toISOString() }; save();
  }
});

document.addEventListener('submit', async (event) => {
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
    result.innerHTML = `<strong>${correct ? tr('إجابة صحيحة', 'Correct answer') : tr('راجع العينة وحاول ثانية', 'Review the sample and try again')}</strong>${correct ? `<p>${tr('هذا تدريب ذاتي فقط، لا يمنح XP أو عملات.', 'This is self practice only; no XP or coins are awarded.')}</p>` : ''}`;
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

async function loadLibrary() {
  try {
    if (!user()) await loadUser();
    if (!user()) { membership = null; data = null; libraryOwner = null; languageLoads.clear(); dataAr = dataEn = null; return; }
    if (root) root.innerHTML = frame('LIBRARY', tr('جارٍ تجهيز محتواك…', 'Preparing your content…'), '', '');
    if (libraryOwner !== user().$id) { libraryOwner = user().$id; languageLoads.clear(); dataAr = dataEn = null; }
    loadPersonalState();
    await ensureLanguage(currentLanguage());
    data = currentLanguage() === 'en' ? dataEn : dataAr;
    render();
    ensureLanguage(currentLanguage() === 'en' ? 'ar' : 'en').catch((error) => console.warn('Second library language unavailable:', error));
  } catch (error) {
    console.error('Academy library unavailable:', error);
    membership = null;
    if (root) root.innerHTML = frame('LIBRARY', tr('تعذر تحميل المكتبة', 'Library unavailable'), tr('حدّث الصفحة للمحاولة من جديد.', 'Refresh to try again.'), '');
  }
}

window.addEventListener('biuret-auth-changed', loadLibrary);
loadLibrary();
