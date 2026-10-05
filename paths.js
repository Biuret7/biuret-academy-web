import { academyPaths } from './path-catalog-data.js?v=20261005-forms1';
import { pathAccess, pathCounts, resourceAccess } from './path-model.js?v=20261005-forms1';
import { user, loadUser, loadMembership, loadLearningRewards, loadExam, loadPathExam } from './auth.js?v=20261005-forms1';
import { currentLanguage, setPageHeaderTitle } from './i18n.js?v=20261005-forms1';
import { fullName } from './full-name.js?v=20261005-forms1';

const root = document.querySelector('#paths-main');
const detail = document.querySelector('.site-shell')?.dataset.page === 'path';
const selected = academyPaths.find(p => p.id === new URLSearchParams(location.search).get('id'));
const tr = (ar, en) => currentLanguage() === 'ar' ? ar : en;
const lc = value => value?.[currentLanguage()] || '';
const amount = (n, ar, singular, plural) => tr(`${ar}: ${n}`, `${n} ${n === 1 ? singular : plural}`);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const icon = id => `<svg aria-hidden="true"><use href="assets/path-icons.svg#${id}"></use></svg>`;
let membership, foundationExam, rewards, pathStatus;
let pending = true, failed = false, revision = 0, search = '', showMine = false;
const accessFor = path => pathAccess(path, membership, Boolean(foundationExam?.passed), !pending && !failed);
const accessLabel = access => ({ free: tr('مجاني بالكامل', 'Completely free'), admin: tr('وصول إداري', 'Administrator access'),
  owned: tr('ضمن مساراتك', 'In your paths'), existing: tr('وصولك الحالي', 'Your current access'),
  foundations: tr('بعد الأساسيات', 'After Foundations'), purchase: tr('شراء مرة واحدة', 'One-time purchase'),
  unavailable: pending ? tr('جارٍ التحقق…', 'Checking access…') : tr('تعذّر التحقق', 'Access unavailable') })[access];
const usable = access => ['free', 'admin', 'owned', 'existing'].includes(access);
const notice = () => failed ? `<div class="path-notice" role="status"><p>${tr('تعذّر التحقق من الوصول. يمكنك مراجعة التفاصيل؛ أعد المحاولة قبل بدء التعلم.', 'Access could not be verified. You can review the outline; retry before learning.')}</p><button class="button button-outline" data-path-retry>${tr('أعد المحاولة', 'Retry')}</button></div>` : '';
const facts = path => {
  const c = pathCounts(path);
  return `<ul class="path-facts"><li>${amount(c.courses, 'الدورات', 'course', 'courses')}</li><li>${amount(c.lessons, 'الدروس', 'lesson', 'lessons')}</li><li>${amount(c.labs, 'المختبرات', 'lab', 'labs')}</li><li>${tr('امتحان وشهادة إكمال', 'Exam and completion certificate')}</li></ul>`;
};
function catalogCards() {
  const grid = root.querySelector('#path-cards');
  if (!grid) return;
  const query = search.trim().toLocaleLowerCase();
  const paths = academyPaths.filter(p => (!showMine || usable(accessFor(p))) && (!query || `${lc(p.title)} ${lc(p.summary)} ${p.outcomes[currentLanguage()].join(' ')}`.toLocaleLowerCase().includes(query)));
  root.querySelector('#path-result-count').textContent = tr(`${paths.length} مسارات`, `${paths.length} paths`);
  grid.innerHTML = paths.length ? paths.map(path => {
    const access = accessFor(path);
    return `<article class="path-card" ${path.free ? 'id="foundations-roadmap"' : ''}><div class="path-card-top"><span class="path-symbol">${icon(path.icon)}</span><span class="path-badge ${path.free ? 'is-free' : ''}">${accessLabel(access)}</span></div><h2><a href="path.html?id=${path.id}">${esc(lc(path.title))}</a></h2><p>${esc(lc(path.summary))}</p>${facts(path)}<div class="path-card-bottom"><span>${path.free ? tr('ابدأ من هنا', 'Start here') : tr('حزمة تعلم متكاملة', 'Complete learning bundle')}</span><a class="path-card-link" href="path.html?id=${path.id}" aria-label="${esc(tr('تفاصيل مسار ', 'Explore ') + lc(path.title))}">${tr('استكشف المسار', 'Explore path')} <span aria-hidden="true">↗</span></a></div></article>`;
  }).join('') : `<div class="path-empty"><h2>${tr('لا توجد مسارات مطابقة.', 'No matching paths.')}</h2><p>${tr('غيّر البحث أو اعرض جميع المسارات.', 'Change your search or view all paths.')}</p><button class="button button-outline" data-clear-search>${tr('اعرض الكل', 'Show all')}</button></div>`;
}
function renderCatalog() {
  root.innerHTML = `<section class="path-catalog-hero"><span class="section-kicker">${tr('BIURET / مسارات التعلم', 'BIURET / LEARNING PATHS')}</span><h1>${tr('ابدأ بالأساسيات.<br>ثم اختر طريقك.', 'Start with Foundations.<br>Then choose your direction.')}</h1><p>${tr('الأساسيات مجانية بالكامل. بعد إتمامها، اختر مسار تخصص واحداً يضم الدورات والتدريب والمختبرات والتحديات والامتحان وشهادة الإكمال.', 'Foundations are completely free. After completing them, choose a specialty bundle with courses, practice quizzes, labs, challenges, a final exam and a completion certificate.')}</p><a class="button button-primary" href="path.html?id=foundations">${tr('استكشف الأساسيات المجانية', 'Explore free Foundations')} ↗</a><ol class="path-route"><li><b>01</b><span>${tr('أساسيات مجانية', 'Free Foundations')}</span></li><li><b>02</b><span>${tr('اختر واشترِ مسارك', 'Choose and buy your path')}</span></li><li><b>03</b><span>${tr('تعلّم، طبّق، ثم أثبت إنجازك', 'Learn, practice, prove your progress')}</span></li></ol></section>${notice()}<section class="path-directory" id="specializations"><div class="path-directory-heading"><div><span class="section-kicker">${tr('كل المسارات في مكان واحد', 'ONE DIRECTORY. EVERY PATH.')}</span><h2>${tr('اكتشف مسارك القادم', 'Find your next path')}</h2></div><p>${tr('شراء المسارات سيُفتح بعد اكتمال ربط الدفع. لا توجد رسوم في هذه المرحلة.', 'Path purchases open after payment integration. There are no charges in this stage.')}</p></div><div class="path-filters"><div class="path-filter-buttons" aria-label="${tr('عرض المسارات', 'Path view')}"><button data-path-view="all" aria-pressed="${!showMine}">${tr('جميع المسارات', 'All paths')}</button><button data-path-view="mine" aria-pressed="${showMine}">${tr('متاح لي الآن', 'Available to me')}</button></div><label class="path-search"><span class="sr-only">${tr('ابحث عن مسار', 'Search paths')}</span><input type="search" id="path-search" value="${esc(search)}" placeholder="${tr('ابحث عن تخصص أو مهارة…', 'Search a specialty or skill…')}"></label><span id="path-result-count" role="status"></span></div><div class="path-card-grid" id="path-cards"></div></section>`;
  catalogCards();
}
const statusOf = kind => {
  if (kind === 'practical') return (selected.free ? foundationExam?.practicalPassed : pathStatus?.practicalPassed) ? tr('مكتمل', 'Complete') : tr('قبل الامتحان', 'Before the exam');
  return (selected.free ? foundationExam?.passed : pathStatus?.passed) ? tr('اجتزته', 'Passed') : tr('بعد استيفاء المتطلبات', 'After meeting requirements');
};
function resourceSection(kind, title, description, items, access, suffix = '') {
  return `<section class="path-resource-section" id="path-${kind}${suffix}"><div class="path-section-heading"><div><h2>${title}</h2><p>${description}</p></div><span>${amount(items.length, 'العناصر', 'item', 'items')}</span></div><div class="path-resource-list">${items.map((item, i) => {
    const open = resourceAccess(selected, kind, item, access, membership);
    const body = `<span class="path-item-number">${String(i + 1).padStart(2, '0')}</span><span><strong>${esc(lc(item.title))}</strong>${kind === 'course' ? `<small>${item.lessonIds.length} ${tr('دروس', 'lessons')} · ${esc(lc(item.summary))}</small>` : `<small>${tr('تطبيق مرتبط بالمسار', 'Practice related to this path')}</small>`}</span><span class="path-item-state">${open ? '↗' : tr('مقفل', 'Locked')}</span>`;
    return open ? `<a class="path-resource-row" href="${item.href}">${body}</a>` : `<div class="path-resource-row is-locked">${body}</div>`;
  }).join('')}</div></section>`;
}
function renderDetail() {
  if (!selected) { root.innerHTML = `<section class="path-empty"><h1>${tr('المسار غير موجود.', 'Path not found.')}</h1><a class="button button-primary" href="paths.html">${tr('كل المسارات', 'All paths')} ↗</a></section>`; return; }
  setPageHeaderTitle(selected.title);
  document.title = `${lc(selected.title)} — Biuret Academy`;
  const access = accessFor(selected), open = usable(access), counts = pathCounts(selected);
  const completed = selected.free ? rewards?.awards?.filter(a => selected.courses.some(c => c.lessonIds.includes(a.lessonId))).length : pathStatus?.completedLessons;
  // The current server bypasses course prerequisites for administrators; that
  // count is access permission, not evidence of completed specialty lessons.
  const progress = membership?.admin && !selected.free ? null : Number.isInteger(completed) ? Math.min(counts.lessons, completed) : null;
  const blocks = [
    ['course', tr('الدورات', 'Courses'), selected.free ? tr('ابدأ بالترتيب، وأكمل الدروس وأسئلة التحقق.', 'Follow the sequence and complete the lessons and knowledge checks.') : tr('ابدأ بالترتيب، وأكمل دروس كل دورة وامتحانها.', 'Follow the sequence and complete each course and its exam.'), selected.courses],
    ['quiz', tr('الكويزات التدريبية', 'Practice quizzes'), tr('راجع فهمك دون استخدام أسئلة الامتحان النهائي.', 'Review your understanding with questions separate from the final exam.'), selected.quizzes],
    ['lab', tr('المختبرات التعليمية', 'Learning labs'), tr('حلّل عينات تدريبية آمنة وطبّق ما تعلمته.', 'Analyze safe training samples and apply what you learned.'), selected.labs],
    ['operation', tr('غرف العمليات', 'Operations rooms'), tr('اربط الأدلة، واتخذ قرار احتواء، ثم اكتب خطة استجابة.', 'Correlate evidence, choose containment and develop a response plan.'), selected.operations],
    ['challenge', tr('التحديات', 'Challenges'), tr('اختبر قدرتك على الاستنتاج من الأدلة.', 'Practice drawing conclusions from evidence.'), selected.challenges],
  ];
  if (selected.optionalCourses?.length) blocks.push(['course', tr('توسّع اختياري: الدفاع المتقدم', 'Optional extension: advanced defense'), tr('هندسة السجلات والكشف والصيد وخطط الاستجابة. لا يغيّر متطلبات شهادتك الحالية.', 'Log engineering, detection, hunting and response playbooks. This does not change your current certificate requirements.'), selected.optionalCourses]);
  const next = !open ? '' : selected.free ? selected.courses.find(c => !c.lessonIds.every(id => rewards?.awards?.some(a => a.lessonId === id)))?.href || selected.practical : '#path-course';
  const blocked = access === 'foundations' ? tr('أكمل الأساسيات وامتحانها أولاً. يمكنك الاطلاع على محتويات هذا المسار الآن.', 'Complete Foundations and its exam first. You can inspect this path outline now.') : tr('شراء المسارات غير متاح حالياً. سيمنحك شراء واحد الوصول إلى الحزمة كاملة بعد ربط الدفع.', 'Path purchases are not available yet. One purchase will unlock the entire bundle after payment integration.');
  root.innerHTML = `<a class="path-back" href="paths.html">${tr('جميع المسارات', 'All paths')} <span aria-hidden="true">↗</span></a><section class="path-detail-hero"><div><span class="path-symbol">${icon(selected.icon)}</span><span class="path-badge ${selected.free ? 'is-free' : ''}">${accessLabel(access)}</span><h1>${esc(lc(selected.title))}</h1><p>${esc(lc(selected.summary))}</p>${facts(selected)}</div><aside class="path-access-card" aria-label="${tr('الوصول إلى المسار', 'Path access')}"><span class="section-kicker">${selected.free ? tr('بداية مجانية', 'YOUR FREE START') : tr('حزمة المسار', 'PATH BUNDLE')}</span><h2>${selected.free ? tr('مجاني بالكامل', 'Completely free') : tr('مسار واحد. رحلة كاملة.', 'One path. A complete journey.')}</h2><p>${selected.free ? tr('جميع دروس الأساسيات وتدريباتها وامتحانها وشهادة إكمالها مجانية. لا تحتاج بطاقة دفع.', 'All Foundations lessons, practice, exam and completion certificate are free. No payment card needed.') : open ? tr('الوصول متاح لحسابك الحالي. شهادة الإكمال تتطلب اجتياز متطلبات المسار.', 'Access is available to your current account. The certificate requires passing the path requirements.') : blocked}</p>${open ? `<a class="button button-primary" href="${next}">${tr('تابع تعلمك', 'Continue learning')} ↗</a>` : `<button class="button button-outline" disabled>${pending ? tr('جارٍ التحقق من الوصول', 'Checking access') : tr('الشراء غير متاح بعد', 'Purchases not open yet')}</button>${access === 'foundations' ? `<a class="path-text-link" href="path.html?id=foundations">${tr('ابدأ الأساسيات المجانية', 'Start free Foundations')} ↗</a>` : ''}`}<small>${selected.free ? tr('ابدأ وتعلّم على راحتك.', 'Learn at your own pace.') : tr('يشمل التدريب، التقييم العملي، الامتحان وشهادة الإكمال.', 'Includes practice, practical assessment, exam and completion certificate.')}</small></aside></section>${notice()}<nav class="path-content-nav" aria-label="${tr('محتويات المسار', 'Path contents')}">${blocks.map(([kind, title], i) => `<a href="#path-${kind}${i > 4 ? '-optional' : ''}">${title}</a>`).join('')}<a href="#path-assessment">${tr('الامتحان والشهادة', 'Exam and certificate')}</a></nav><div class="path-detail-layout"><div class="path-curriculum"><section class="path-resource-section"><h2>${tr('ما الذي ستتعلمه؟', 'What will you learn?')}</h2><ul class="path-outcomes">${selected.outcomes[currentLanguage()].map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>${blocks.map(([kind, title, description, items], i) => resourceSection(kind, title, description, items, access, i > 4 ? '-optional' : '')).join('')}<section class="path-resource-section" id="path-assessment"><div class="path-section-heading"><div><h2>${tr('امتحان المسار وشهادة الإكمال', 'Path exam and completion certificate')}</h2><p>${tr('أكمل المتطلبات واجتز التقييم العملي والامتحان لتستحق شهادة الإكمال.', 'Complete the requirements and pass the practical and final exam to earn your completion certificate.')}</p></div></div><div class="path-assessment-grid"><article><span>01</span><h3>${tr('التقييم العملي', 'Practical assessment')}</h3><p>${tr('ثلاث مهام على أدلة تدريبية.', 'Three tasks using training evidence.')}</p><small>${statusOf('practical')}</small>${open ? `<a href="${selected.practical}">${tr('عرض المتطلبات والتقييم', 'View requirements and assessment')} ↗</a>` : `<span>${tr('يفتح مع المسار', 'Included with the path')}</span>`}</article><article><span>02</span><h3>${tr('الامتحان النهائي', 'Final exam')}</h3><p>${tr('10 سيناريوهات تحليلية · النجاح من 9/10.', '10 analytical scenarios · pass at 9/10.')}</p><small>${statusOf('exam')}</small>${open ? `<a href="${selected.exam}">${tr('عرض حالة الامتحان', 'View exam status')} ↗</a>` : `<span>${tr('بعد استيفاء المتطلبات', 'After meeting requirements')}</span>`}</article><article><span>03</span><h3>${tr('شهادة إكمال المسار', 'Path completion certificate')}</h3><p>${tr('باسمك الحقيقي، مع تفاصيل الإنجاز ورابط تحقق عند مشاركتها.', 'Issued in your real name with achievement details and verification when shared.')}</p>${open ? `<a href="${selected.certificate}">${tr('عرض حالة الشهادة', 'View certificate status')} ↗</a>` : `<span>${tr('تُمنح بعد النجاح', 'Earned after passing')}</span>`}</article></div></section></div><aside class="path-study-guide"><h2>${tr('خطة تعلمك', 'Your learning plan')}</h2><ol><li>${tr('تعلّم الدورات بالترتيب', 'Study courses in order')}</li><li>${tr('راجع بالكويزات التدريبية', 'Review with practice quizzes')}</li><li>${tr('طبّق في المختبرات والتحديات وغرف العمليات', 'Apply skills in labs, challenges and operations rooms')}</li><li>${tr('اجتز التقييم العملي والامتحان', 'Pass the practical and final exam')}</li><li>${tr('احصل على شهادة إكمال المسار', 'Earn your path completion certificate')}</li></ol>${progress === null ? `<p>${membership?.admin ? tr('الوصول الإداري يتجاوز شروط الفتح؛ ولا يُحسب كإنجاز للدروس.', 'Administrator access bypasses unlock prerequisites; it does not count as lesson completion.') : tr('يظهر تقدمك الموثق عند فتح الوصول إلى المسار.', 'Verified progress appears when path access is available.')}</p>` : `<label>${tr('الدروس الموثقة', 'Verified lessons')} · ${progress}/${counts.lessons}<progress max="${counts.lessons}" value="${progress}"></progress></label>`}<p>${tr('التدريبات للمراجعة. شروط الشهادة الموثقة تظهر في صفحة الامتحان.', 'Practice supports review. Verified certificate requirements are shown on the exam page.')}</p></aside></div>`;
}
function render() { if (root) detail ? renderDetail() : renderCatalog(); }
async function refresh() {
  const version = ++revision;
  pending = true; failed = false; membership = foundationExam = rewards = pathStatus = null; render();
  try {
    const account = user() || await loadUser();
    if (version !== revision) return;
    if (!account || !fullName(account.name)) { pending = false; render(); return; }
    const values = await Promise.allSettled([loadMembership(), loadExam(), loadLearningRewards()]);
    if (version !== revision || user()?.$id !== account.$id) return;
    if (values.some(v => v.status !== 'fulfilled')) throw new Error('Path access unavailable');
    [membership, foundationExam, rewards] = values.map(v => v.value);
    pending = false; render();
    if (detail && selected && !selected.free && usable(accessFor(selected))) {
      const status = await loadPathExam(selected.id, currentLanguage());
      if (version !== revision || user()?.$id !== account.$id) return;
      pathStatus = status; render();
    }
  } catch { if (version === revision) { pending = false; failed = true; membership = null; render(); } }
}
root?.addEventListener('input', event => { if (event.target.id === 'path-search') { search = event.target.value; catalogCards(); } });
root?.addEventListener('click', event => {
  const filter = event.target.closest('[data-path-view]');
  if (filter) { showMine = filter.dataset.pathView === 'mine'; render(); }
  if (event.target.closest('[data-clear-search]')) { search = ''; showMine = false; render(); }
  if (event.target.closest('[data-path-retry]')) refresh();
});
document.querySelector('#language-toggle')?.addEventListener('click', () => { render(); });
window.addEventListener('biuret-auth-changed', refresh);
const legacy = location.hash.startsWith('#roadmap-') && academyPaths.find(p => p.id === location.hash.slice(9));
if (!detail && legacy) location.replace(`path.html?id=${legacy.id}`); else refresh();
