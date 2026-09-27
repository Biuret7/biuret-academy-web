import { tracks, challenges, challengeById, challengesForTrack } from './content.js';
import { learningPath, courses, courseById, lessonById, localized } from './learning-content.js?v=20260927-3';
import { STORAGE_KEY, dayKey, assignDaily, cleanProgress, mergeProgress, isUnlocked, totalXp, streak, weekActivity, dailyChallenge, completeChallenge, nextChallenge, trackProgress, isLessonUnlocked, completeLesson, courseLearningProgress } from './engine.js?v=20260927-3';
import { user, available, loadUser, signIn, signUp, signInWithProvider, signOut, cloudProgress, saveCloudProgress, loadLearningRewards, awardLesson } from './auth.js?v=20260927-3';
import { applyLanguage, toggleLanguage, currentLanguage, isEnglish, t, trackText, challengeText } from './i18n.js?v=20260927-3';

const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const OWNER_KEY = 'biuret-academy-owner-v1';
let ownerUserId;
try { ownerUserId = localStorage.getItem(OWNER_KEY); } catch { ownerUserId = null; }
let progress;
try { progress = ownerUserId ? assignDaily(null) : assignDaily(cleanProgress(JSON.parse(localStorage.getItem(STORAGE_KEY)))); }
catch { progress = assignDaily(null); }
let filter = new URLSearchParams(location.search).get('track') || 'all';
if (!['all', ...tracks.map((item) => item.id)].includes(filter)) filter = 'all';
let activeChallenge, attempts = 0, hintUsed = false, toastTimer;
let syncQueue = Promise.resolve();
let rewards = null;
let rewardStatus = 'idle';

function learningProgress() {
  if (!user()) return progress;
  const lessons = Object.fromEntries((rewards?.awards || []).map((award) => [award.lessonId, award.completedAt]));
  return { ...progress, lessons };
}
async function refreshRewards() {
  if (!user()) { rewards = null; rewardStatus = 'idle'; render(); return; }
  rewardStatus = 'loading'; render();
  try { rewards = await loadLearningRewards(); rewardStatus = 'ready'; }
  catch (cause) { rewards = null; rewardStatus = 'error'; console.warn('Learning rewards unavailable:', cause); toast(ll('rewardError')); }
  render();
}

function toast(message) {
  const element = $('#toast'); element.textContent = message; element.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('show'), 4500);
}
function persistLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    if (ownerUserId) localStorage.setItem(OWNER_KEY, ownerUserId); else localStorage.removeItem(OWNER_KEY);
  } catch { toast(t('localError')); }
}
function queueCloudSync() {
  if (!user()) return;
  syncQueue = syncQueue.then(async () => { progress = await saveCloudProgress(progress); persistLocal(); render(); })
    .catch((error) => { console.warn('Cloud progress sync failed:', error); toast(t('syncError')); });
}
const lc = (value) => localized(value, currentLanguage());
const learningLabels = {
  ar: { roadmap: 'خارطة المسار', available: 'متاح الآن', planned: 'قيد الإعداد', course: 'كورس', exam: 'امتحان', lessons: 'دروس', finished: 'مكتمل', start: 'افتح الكورس', open: 'افتح الدرس', continue: 'تابع التعلّم', check: 'تحقّق من فهمك', wrong: 'جرّب مرة أخرى. راجع الشرح قبل اختيار الإجابة.', done: 'أكملت هذا الدرس', next: 'الدرس التالي', practice: 'التحدّي العملي', practiceNote: 'نقاط التحديات للتدريب، ولا تدخل في المستوى الموثق.', challengePrerequisite: 'أكمل التحدي السابق في مسار التحديات لفتحه.', selfCheck: 'مراجعة سريعة', intro: 'ما ستتعلمه', back: 'العودة للمسار', locked: 'أكمل الدرس السابق أولاً.', missing: 'هذا المحتوى غير متاح.', min: 'دقائق', of: 'من', lesson: 'درس', launch: 'المحتوى المتاح', readOnly: 'هذه المرحلة قيد الإعداد؛ سننشرها عند اكتمال محتواها.', seePath: 'شاهد خارطة المسار', verifiedLater: 'الامتحان والشهادة سيصلان بعد إطلاق التحقق الآمن على الخادم.', rewardError: 'تعذر تحميل مكافآت التعلّم. حاول تحديث الصفحة.', rewardFail: 'تعذر حفظ إنجاز الدرس. حاول مرة أخرى.', signInReward: 'سجّل الدخول لتحصل على XP وعملات Biuret عند إكمال الدرس.', guestDone: 'أكملت الدرس كتدريب. سجّل الدخول وأعد التحقق لتحصل على المكافأة.', rewardEarned: 'أحسنت! حصلت على 100 XP و10 عملات Biuret.', rewardOnce: 'مكافأة هذا الدرس محفوظة بالفعل.', loading: 'جارٍ تحميل إنجازاتك…', legacy: 'الإنجازات السابقة المحفوظة على الجهاز للتدريب؛ أعد التحقق من الدرس لتوثيقه وكسب المكافأة.', level: 'المستوى', coins: 'عملات Biuret', nextLevel: 'للمستوى التالي', practiceXp: 'XP تدريب', coinNote: 'عملات داخل الأكاديمية فقط؛ غير قابلة للتحويل أو الاستبدال بنقود.' },
  en: { roadmap: 'Learning roadmap', available: 'Available now', planned: 'In development', course: 'Course', exam: 'Exam', lessons: 'lessons', finished: 'Complete', start: 'Open course', open: 'Open lesson', continue: 'Continue learning', check: 'Check your understanding', wrong: 'Try again. Review the explanation before choosing.', done: 'You completed this lesson', next: 'Next lesson', practice: 'Practical challenge', practiceNote: 'Challenge points are for practice and do not count toward your verified level.', challengePrerequisite: 'Complete the previous challenge in the challenges path to unlock it.', selfCheck: 'Quick check', intro: 'What you will learn', back: 'Back to path', locked: 'Complete the previous lesson first.', missing: 'This content is unavailable.', min: 'min', of: 'of', lesson: 'Lesson', launch: 'Available content', readOnly: 'This stage is in development and will open when its content is ready.', seePath: 'View roadmap', verifiedLater: 'The exam and certificate will follow server-side verification.', rewardError: 'Learning rewards could not load. Refresh and try again.', rewardFail: 'Could not save this lesson. Please try again.', signInReward: 'Sign in to earn XP and Biuret Coins when you complete a lesson.', guestDone: 'Completed as practice. Sign in and take the check again to earn the reward.', rewardEarned: 'Great work! You earned 100 XP and 10 Biuret Coins.', rewardOnce: 'This lesson reward is already saved.', loading: 'Loading your achievements…', legacy: 'Earlier device progress is practice history. Retake the lesson check to verify it and earn rewards.', level: 'Level', coins: 'Biuret Coins', nextLevel: 'to next level', practiceXp: 'Practice XP', coinNote: 'Academy only. Coins cannot be transferred or exchanged for cash.' },
};
const ll = (key) => learningLabels[currentLanguage()][key];

function renderTracks() {
  if (!$('#track-grid')) return;
  $('#track-grid').innerHTML = tracks.map((track) => {
    const copy = trackText(track), state = trackProgress(progress, track.id);
    const tone = { lime: '#c9ff39', cyan: '#71dbea', violet: '#b69bff' }[track.tone];
    return `<a class="track-card reveal visible" href="${track.id === 'foundations' ? '#foundations-roadmap' : `challenges.html?track=${esc(track.id)}`}" style="--tone:${tone}"><div class="track-top"><span class="track-number">PATH / ${track.number}</span><span class="track-icon" aria-hidden="true">${track.icon}</span></div><div class="track-content"><span class="track-english">${track.english}</span><h3>${esc(copy.name)}</h3><p>${esc(copy.summary)}</p><div class="track-bottom"><span>${state.completed} / ${state.total} ${t('completeCount')}</span><span class="track-arrow" aria-hidden="true">↗</span></div><div class="track-progress" aria-hidden="true"><span style="width:${state.completed / state.total * 100}%"></span></div></div></a>`;
  }).join('');
}
function renderCurriculum() {
  if (!$('#curriculum-grid')) return;
  $('#curriculum-grid').innerHTML = tracks.map((track) => {
    const copy = trackText(track);
    const items = challengesForTrack(track.id).map((item) => {
      const translated = challengeText(item), done = Boolean(progress.completed[item.id]), locked = !isUnlocked(item, progress);
      return `<a href="challenges.html?challenge=${esc(item.id)}" class="curriculum-item"><span class="curriculum-number">${String(item.order).padStart(2, '0')}</span><span><strong>${esc(translated.title)}</strong><small>${esc(translated.subtitle)}</small></span><span class="curriculum-state">${done ? '✓' : locked ? '○' : '↗'}</span></a>`;
    }).join('');
    return `<article class="curriculum-card reveal visible"><div class="curriculum-heading"><span>PATH / ${track.number}</span><h3>${esc(copy.name)}</h3><p>${esc(copy.summary)}</p></div><div>${items}</div></article>`;
  }).join('');
}
function renderChallenges() {
  if (!$('#challenge-list')) return;
  const listed = filter === 'all' ? challenges : challengesForTrack(filter);
  $('#challenge-count').textContent = isEnglish() ? `${listed.length} challenges` : `${listed.length} ${listed.length > 10 ? 'تحدّياً' : 'تحديات'}`;
  $('#challenge-list').innerHTML = listed.map((challenge) => {
    const copy = challengeText(challenge), done = Boolean(progress.completed[challenge.id]), locked = !isUnlocked(challenge, progress);
    const track = trackText(tracks.find((item) => item.id === challenge.track));
    return `<button class="challenge-card ${done ? 'done' : ''} ${locked ? 'locked' : ''}" type="button" data-challenge="${challenge.id}" aria-label="${esc(copy.title)}${isEnglish() ? ', ' : '، '}${done ? t('completed') : locked ? t('locked') : t('available')}"><span class="challenge-index">${done ? '✓' : locked ? '⌁' : String(challenge.order).padStart(2, '0')}</span><span class="challenge-body"><h3>${esc(copy.title)}</h3><p>${esc(copy.subtitle)}</p><span class="challenge-meta"><span>${esc(track.name)}</span><span>${challenge.minutes} MIN</span><span>+${challenge.xp} PRACTICE XP</span></span></span><span class="challenge-arrow" aria-hidden="true">${locked ? '○' : '↗'}</span></button>`;
  }).join('');
  for (const button of document.querySelectorAll('.filter')) {
    const selected = button.dataset.filter === filter;
    button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
  }
}
function renderProgress() {
  const daily = dailyChallenge(progress), copy = challengeText(daily);
  if ($('#daily-title')) $('#daily-title').textContent = copy.title;
  const reward = progress.dailyBonus[dayKey()] ? t('dailyComplete') : `+${progress.completed[daily.id] ? 30 : daily.xp + 30} PRACTICE XP`;
  if ($('#daily-meta')) $('#daily-meta').textContent = `${trackText(tracks.find((track) => track.id === daily.track)).name} · ${daily.minutes} ${t('minutes')} · ${reward}`;
  if ($('#daily-button')) $('#daily-button').textContent = progress.completed[daily.id] ? t('reviewChallenge') : t('openChallenge');
  if ($('#xp-stat')) $('#xp-stat').textContent = totalXp(progress).toLocaleString('en-US');
  if ($('#practice-xp-label')) $('#practice-xp-label').textContent = ll('practiceXp');
  if (!$('#reward-chip')) $('#account-button').insertAdjacentHTML('beforebegin', '<a class="reward-chip" id="reward-chip" href="progress.html" aria-label="Learning level and coins"></a>');
  const rewardChip = $('#reward-chip');
  rewardChip.hidden = !user();
  if (user()) rewardChip.textContent = rewardStatus === 'ready' ? `LV ${rewards.level} · ${rewards.coins} BC` : 'LV …';
  if ($('#reward-dashboard')) {
    const xp = rewards?.xp || 0, coins = rewards?.coins || 0, level = rewards?.level || 1;
    const into = rewards?.xpIntoLevel || 0, next = rewards?.xpToNextLevel || 100;
    const unresolved = Boolean(user()) && rewardStatus !== 'ready';
    const note = !user() ? ll('signInReward') : rewardStatus !== 'ready' ? ll(rewardStatus === 'error' ? 'rewardError' : 'loading') : Object.keys(progress.lessons).some((id) => !rewards.awards.some((award) => award.lessonId === id)) ? ll('legacy') : `${next - into} XP ${ll('nextLevel')}`;
    $('#reward-dashboard').innerHTML = `<div class="reward-heading"><span class="section-kicker">VERIFIED LEARNING / BIURET ACADEMY</span><span class="reward-spark" aria-hidden="true">✦</span></div><div class="reward-values"><div><small>${ll('level')}</small><strong>${unresolved ? '—' : level.toString().padStart(2, '0')}</strong></div><div><small>XP</small><strong>${unresolved ? '—' : xp}</strong></div><div><small>${ll('coins')}</small><strong>${unresolved ? '—' : coins}<span> BC</span></strong></div></div><div class="reward-meter" role="progressbar" aria-valuemin="0" aria-valuemax="${next}" aria-valuenow="${into}" aria-label="${ll('nextLevel')}"><span style="width:${unresolved ? 0 : Math.min(100, into / next * 100)}%"></span></div><p>${esc(note)}</p><small class="reward-fineprint">${ll('coinNote')}</small>`;
  }
  if ($('#done-stat')) $('#done-stat').innerHTML = `${Object.keys(progress.completed).length}<span class="stat-total"> / ${challenges.length}</span>`;
  const days = streak(progress);
  if ($('#streak-stat')) $('#streak-stat').textContent = days;
  if ($('#streak-detail')) $('#streak-detail').textContent = days ? `${days} ${days === 1 ? t('oneDay') : t('manyDays')} ${t('inARow')}` : t('startToday');
  if ($('#week-grid')) $('#week-grid').innerHTML = weekActivity(progress).map((day) => `<div class="week-day" title="${day.date}: ${day.count} ${t('challenges')}"><div class="week-bar ${day.count ? 'active' : ''}" style="height:${Math.max(8, Math.min(100, day.count * 34))}%"></div><span>${new Date(`${day.date}T12:00:00`).toLocaleDateString(currentLanguage() === 'en' ? 'en-US' : 'ar', { weekday: 'short' })}</span></div>`).join('');
  if ($('#account-nudge')) $('#account-nudge').hidden = Boolean(user());
  if ($('#learning-progress-card')) {
    $('#learning-progress-card').innerHTML = courses.map((course) => {
      const state = courseLearningProgress(learningProgress(), course.id);
      return `<div class="learning-progress-item"><div><span class="section-kicker">LEARNING / FOUNDATIONS</span><h3>${esc(lc(course.title))}</h3><p>${state.completed} / ${state.total} ${ll('lessons')} · ${state.challengeComplete ? ll('finished') : ll('practice')}</p></div><a class="button button-outline" href="course.html?id=${encodeURIComponent(course.id)}">${ll('continue')} ↗</a></div>`;
    }).join('');
  }
  $('#account-button').innerHTML = user() ? `${esc((user().name || t('account')).split(' ')[0])} <span aria-hidden="true">↗</span>` : `${t('account')} <span aria-hidden="true">↗</span>`;
}
function renderRoadmap() {
  const root = $('#learning-roadmap');
  if (!root) return;
  const states = courses.map((course) => courseLearningProgress(learningProgress(), course.id));
  const done = states.reduce((sum, state) => sum + state.completed, 0);
  const total = states.reduce((sum, state) => sum + state.total, 0);
  root.innerHTML = `<div class="roadmap-intro"><div><span class="section-kicker">BIURET / LEARNING PATH 01</span><h2>${esc(lc(learningPath.title))}</h2><p>${esc(lc(learningPath.summary))}</p></div><span class="roadmap-pill">${done} / ${total} ${ll('lessons')}</span></div><ol class="roadmap-list">${learningPath.nodes.map((node, index) => `<li class="roadmap-node ${node.state === 'planned' ? 'is-planned' : ''}"><span class="roadmap-index">${String(index + 1).padStart(2, '0')}</span><div><span class="roadmap-meta">${node.type === 'exam' ? ll('exam') : ll('course')} · ${node.state === 'published' ? ll('available') : ll('planned')}</span><h3>${esc(lc(node.title))}</h3><p>${esc(lc(node.description))}</p>${node.state === 'published' ? `<a class="roadmap-link" href="${node.type === 'exam' ? 'exam.html' : `course.html?id=${encodeURIComponent(node.id)}`}">${node.type === 'exam' ? ll('exam') : ll('start')} ↗</a>` : `<span class="roadmap-pending">${ll('readOnly')}</span>`}</div></li>`).join('')}</ol><p class="roadmap-note">${isEnglish() ? 'Final results and credentials are verified on the server.' : 'تُوثق نتائج الامتحان وإثباتات الإنجاز على الخادم.'}</p>`;
}
function renderCourse() {
  const root = $('#learning-main');
  if (!root || document.querySelector('.site-shell')?.dataset.page !== 'course') return;
  const course = courseById[new URLSearchParams(location.search).get('id')];
  if (!course) { root.innerHTML = `<section class="section-frame learning-empty"><h1>${ll('missing')}</h1><a href="paths.html">${ll('seePath')} ↗</a></section>`; return; }
  const view = learningProgress();
  const state = courseLearningProgress(view, course.id);
  root.innerHTML = `<section class="learning-hero section-frame"><a class="learning-back" href="paths.html#foundations-roadmap">← ${ll('back')}</a><span class="section-kicker">COURSE 01 / FOUNDATIONS</span><h1>${esc(lc(course.title))}</h1><p>${esc(lc(course.summary))}</p><div class="learning-facts"><span>${course.minutes} ${ll('min')}</span><span>${state.completed} / ${state.total} ${ll('lessons')}</span><span>${ll('available')}</span></div></section><section class="learning-body section-frame"><div class="learning-panel"><span class="section-kicker">${ll('intro')}</span><ul>${course.outcomes.map((outcome) => `<li>${esc(lc(outcome))}</li>`).join('')}</ul></div><div class="learning-panel"><span class="section-kicker">${ll('lessons')}</span><div class="lesson-list">${course.lessonIds.map((id, index) => { const lesson = lessonById[id], done = Boolean(view.lessons[id]), unlocked = isLessonUnlocked(id, view); return `<a class="lesson-row ${unlocked ? '' : 'is-locked'}" href="${unlocked ? `lesson.html?id=${encodeURIComponent(id)}` : '#'}" ${unlocked ? '' : 'aria-disabled="true" tabindex="-1"'}><span class="lesson-number">${String(index + 1).padStart(2, '0')}</span><span><strong>${esc(lc(lesson.title))}</strong><small>${esc(lc(lesson.summary))} · ${lesson.minutes} ${ll('min')}</small></span><b>${done ? '✓' : unlocked ? '↗' : '○'}</b></a>`; }).join('')}</div></div><div class="learning-panel practice-panel"><span class="section-kicker">${ll('practice')}</span><h2>${esc(challengeText(challengeById[course.challengeId]).title)}</h2><p>${ll('practiceNote')}</p><a class="button button-outline" href="challenges.html?challenge=${encodeURIComponent(course.challengeId)}">${ll('practice')} ↗</a></div></section>`;
  root.querySelector('.learning-facts').insertAdjacentHTML('beforeend', '<span class="lesson-reward">+100 XP · +10 BC / LESSON</span>');
  root.querySelector('.learning-hero .section-kicker').textContent = `COURSE ${String(courses.indexOf(course) + 1).padStart(2, '0')} / FOUNDATIONS`;
  if (!isUnlocked(challengeById[course.challengeId], progress)) root.querySelector('.practice-panel p').textContent += ` ${ll('challengePrerequisite')}`;
  if (user() && rewardStatus !== 'ready') root.querySelector('.learning-hero').insertAdjacentHTML('beforeend', `<p class="lesson-reward-note">${ll(rewardStatus === 'error' ? 'rewardError' : 'loading')}</p>`);
}
function renderLesson() {
  const root = $('#learning-main');
  if (!root || document.querySelector('.site-shell')?.dataset.page !== 'lesson') return;
  const lesson = lessonById[new URLSearchParams(location.search).get('id')];
  if (!lesson) { root.innerHTML = `<section class="section-frame learning-empty"><h1>${ll('missing')}</h1><a href="paths.html">${ll('seePath')} ↗</a></section>`; return; }
  if (user() && rewardStatus !== 'ready') { root.innerHTML = `<section class="section-frame learning-empty"><h1>${ll(rewardStatus === 'error' ? 'rewardError' : 'loading')}</h1>${rewardStatus === 'error' ? `<a href="${esc(location.href)}">${ll('continue')} ↗</a>` : ''}</section>`; return; }
  const course = courseById[lesson.courseId];
  const view = learningProgress();
  const unlocked = isLessonUnlocked(lesson.id, view);
  if (!unlocked) { root.innerHTML = `<section class="section-frame learning-empty"><h1>${ll('locked')}</h1><a href="course.html?id=${encodeURIComponent(course.id)}">${ll('back')} ↗</a></section>`; return; }
  const done = Boolean(view.lessons[lesson.id]);
  const nextId = course.lessonIds[course.lessonIds.indexOf(lesson.id) + 1];
  root.innerHTML = `<section class="learning-hero section-frame"><a class="learning-back" href="course.html?id=${encodeURIComponent(course.id)}">← ${esc(lc(course.title))}</a><span class="section-kicker">${ll('lesson')} ${String(lesson.order).padStart(2, '0')} / ${course.lessonIds.length}</span><h1>${esc(lc(lesson.title))}</h1><p>${esc(lc(lesson.summary))}</p><div class="learning-facts"><span>${lesson.minutes} ${ll('min')}</span><span>${done ? '✓ ' + ll('finished') : ll('available')}</span></div></section><article class="lesson-article section-frame">${lesson.sections.map((section) => `<section class="lesson-copy"><h2>${esc(lc(section.title))}</h2><p>${esc(lc(section.body))}</p></section>`).join('')}<div class="lesson-example"><span>EXAMPLE / URL</span><code dir="ltr">${esc(lesson.example)}</code></div><div class="learning-panel lesson-check"><span class="section-kicker">${ll('selfCheck')}</span><h2>${esc(lc(lesson.check.question))}</h2>${done ? `<p class="answer-feedback success">✓ ${ll('done')} — ${esc(lc(lesson.check.explanation))}</p>` : `<form id="lesson-check-form" data-lesson="${lesson.id}"><fieldset><legend class="sr-only">${esc(lc(lesson.check.question))}</legend>${lesson.check.options.map((option, index) => `<label class="option-label"><input type="radio" name="answer" value="${index}" required><span>${esc(lc(option))}</span></label>`).join('')}</fieldset><button class="button button-primary" type="submit">${ll('check')} ↗</button><p class="answer-feedback error" id="lesson-feedback" role="status" hidden></p></form>`}${done && nextId ? `<a class="button button-outline" href="lesson.html?id=${encodeURIComponent(nextId)}">${ll('next')} ↗</a>` : done ? `<a class="button button-outline" href="challenges.html?challenge=${encodeURIComponent(course.challengeId)}">${ll('practice')} ↗</a>` : ''}</div></article>`;
  root.querySelector('.learning-facts').insertAdjacentHTML('beforeend', '<span class="lesson-reward">+100 XP · +10 BC</span>');
  root.querySelector('.lesson-example span').textContent = lc(lesson.exampleLabel) || 'EXAMPLE / URL';
  if (!user()) root.querySelector('.lesson-check').insertAdjacentHTML('beforeend', `<p class="lesson-reward-note">${ll('signInReward')}</p>`);
}
function render() { renderTracks(); renderCurriculum(); renderChallenges(); renderProgress(); renderRoadmap(); renderCourse(); renderLesson(); }

function openChallenge(id) {
  const challenge = challengeById[id];
  if (!challenge) return;
  if (!isUnlocked(challenge, progress)) { toast(t('previousFirst')); return; }
  const copy = challengeText(challenge);
  activeChallenge = challenge; attempts = 0; hintUsed = false;
  const done = Boolean(progress.completed[id]);
  const dailyReplay = done && dailyChallenge(progress).id === id && !progress.dailyBonus[dayKey()];
  const showForm = !done || dailyReplay;
  const track = tracks.find((item) => item.id === challenge.track);
  const form = challenge.kind === 'choice'
    ? `<div class="answer-options">${copy.options.map((option, index) => `<label class="option-label"><input type="radio" name="answer" value="${index}"><span>${esc(option)}</span></label>`).join('')}</div>`
    : `<input class="text-answer" id="text-answer" type="text" autocomplete="off" spellcheck="false" placeholder="${esc(copy.placeholder)}" aria-label="${t('answer')}">`;
  $('#challenge-dialog-content').innerHTML = `<div class="dialog-heading"><span class="section-kicker">MISSION ${String(challenge.order).padStart(2, '0')} / ${esc(track.english)}</span><h2 id="challenge-dialog-title">${esc(copy.title)}</h2><p>${esc(copy.subtitle)}</p></div><div class="dialog-tags"><span>${esc(copy.difficulty)}</span><span>${challenge.minutes} ${t('minutes')}</span><span>${dailyReplay ? '+30 PRACTICE XP DAILY' : `+${challenge.xp} PRACTICE XP`}</span></div><div class="scenario-box"><h3>${t('mission')}</h3><p>${esc(copy.scenario)}</p></div><div class="artifact-box"><h3>${esc(copy.artifactLabel)}</h3><pre>${esc(copy.artifact)}</pre></div><h3 class="question-heading">${esc(copy.question)}</h3>${showForm ? `<form id="answer-form">${form}<div class="dialog-actions"><button class="button button-primary" type="submit">${t('check')} <span aria-hidden="true">↗</span></button><button class="hint-button" id="hint-button" type="button">${t('hint')}</button></div><p class="answer-feedback" id="answer-feedback" role="status" hidden></p><div class="hint-box" id="hint-box" hidden>${esc(copy.hint)}</div></form>` : ''}<div class="solution-box" id="solution-box" ${showForm ? 'hidden' : ''}><h3>${done ? t('doneHeading') : t('correctHeading')}</h3><p>${esc(copy.explanation)}</p><p class="takeaway">${esc(copy.takeaway)}</p></div><div id="next-slot"></div>`;
  if (!showForm) renderNextButton();
  const dialog = $('#challenge-dialog'); dialog.setAttribute('dir', document.documentElement.dir); dialog.showModal(); dialog.scrollTop = 0;
  if (showForm) $('#answer-form').addEventListener('submit', checkAnswer);
  $('#hint-button')?.addEventListener('click', () => { hintUsed = true; $('#hint-box').hidden = false; $('#hint-button').hidden = true; });
}
function renderNextButton() {
  const next = nextChallenge(progress, activeChallenge.track);
  $('#next-slot').innerHTML = next && next.id !== activeChallenge.id ? `<button class="button button-outline dialog-next" id="next-button" type="button">${t('nextChallenge')} <span aria-hidden="true">↗</span></button>` : '';
  $('#next-button')?.addEventListener('click', () => { $('#challenge-dialog').close(); openChallenge(next.id); });
}
function checkAnswer(event) {
  event.preventDefault();
  const challenge = activeChallenge;
  let correct;
  if (challenge.kind === 'choice') {
    const selected = $('#answer-form input[name="answer"]:checked');
    correct = selected ? Number(selected.value) === challenge.options.indexOf(challenge.answer) : false;
  } else {
    const answer = $('#text-answer').value.trim().toLocaleLowerCase('en-US').replace(/\s+/g, '');
    correct = challenge.answers.some((item) => item.toLocaleLowerCase('en-US').replace(/\s+/g, '') === answer);
  }
  attempts++;
  const feedback = $('#answer-feedback'); feedback.hidden = false;
  if (!correct) { feedback.className = 'answer-feedback error'; feedback.textContent = t('wrong'); return; }
  const result = completeChallenge(progress, challenge.id, { attempts, hintUsed });
  progress = result.progress; persistLocal(); queueCloudSync(); render();
  $('#answer-form').hidden = true; $('#solution-box').hidden = false; renderNextButton();
  toast(isEnglish() ? `Well done! You earned ${result.awardedXp} practice XP.` : `أحسنت! حصلت على ${result.awardedXp} نقطة تدريب.`);
}
function openNext() { openChallenge((nextChallenge(progress) || dailyChallenge(progress)).id); }
function visitChallenge(id) { location.href = `challenges.html?challenge=${encodeURIComponent(id)}`; }
function setFilter(value) {
  filter = value; const url = new URL(location.href);
  if (value === 'all') url.searchParams.delete('track'); else url.searchParams.set('track', value);
  url.searchParams.delete('challenge'); history.replaceState(null, '', url); renderChallenges();
}

function showAuth() {
  const signedIn = Boolean(user());
  $('#signed-in-box').hidden = !signedIn; $('#auth-forms').hidden = signedIn;
  $('#auth-title').textContent = signedIn ? t('welcomeBack') : t('saveProgress');
  $('#auth-subtitle').textContent = signedIn ? t('synced') : t('oneAccount');
  if (signedIn) {
    $('#signed-in-box').innerHTML = `<div class="signed-in-name">${esc(user().name || t('learner'))}</div><div>${esc(user().email || '')}</div><div class="signed-in-actions"><button class="button button-outline" id="signout-button" type="button">${t('signOut')}</button></div>`;
    $('#signout-button').addEventListener('click', async () => {
      try { await syncQueue; await saveCloudProgress(progress); await signOut(); ownerUserId = null; progress = assignDaily(null); rewards = null; rewardStatus = 'idle'; persistLocal(); $('#auth-dialog').close(); render(); window.dispatchEvent(new Event('biuret-auth-changed')); toast(t('signedOut')); }
      catch { toast(t('signOutError')); }
    });
  }
  $('#auth-dialog').setAttribute('dir', document.documentElement.dir); $('#auth-dialog').showModal();
}
function setAuthMode(mode) {
  const signup = mode === 'signup';
  $('#name-field').hidden = !signup; $('#auth-name').required = signup;
  $('#auth-password').autocomplete = signup ? 'new-password' : 'current-password';
  $('#auth-submit').innerHTML = `${signup ? t('signUp') : t('signIn')} <span aria-hidden="true">↗</span>`;
  $('#signin-tab').classList.toggle('active', !signup); $('#signup-tab').classList.toggle('active', signup);
  $('#signin-tab').setAttribute('aria-selected', String(!signup)); $('#signup-tab').setAttribute('aria-selected', String(signup));
  $('#auth-error').hidden = true;
}
async function handleAuthSubmit(event) {
  event.preventDefault();
  const signup = $('#signup-tab').classList.contains('active'), button = $('#auth-submit'), error = $('#auth-error');
  button.disabled = true; error.hidden = true;
  try {
    if (signup) await signUp($('#auth-name').value.trim(), $('#auth-email').value.trim(), $('#auth-password').value);
    else await signIn($('#auth-email').value.trim(), $('#auth-password').value);
    progress = mergeProgress(ownerUserId && ownerUserId !== user().$id ? null : progress, cloudProgress());
    ownerUserId = user().$id; persistLocal(); queueCloudSync(); $('#auth-dialog').close(); render(); window.dispatchEvent(new Event('biuret-auth-changed')); toast(t('signedIn')); await refreshRewards();
  } catch (cause) { error.textContent = cause?.message || t('loginError'); error.hidden = false; }
  finally { button.disabled = false; }
}
function bindEvents() {
  const onChallengesPage = Boolean($('#challenge-list'));
  $('#start-button')?.addEventListener('click', onChallengesPage ? openNext : () => visitChallenge((nextChallenge(progress) || dailyChallenge(progress)).id));
  $('#closing-button')?.addEventListener('click', () => visitChallenge((nextChallenge(progress) || dailyChallenge(progress)).id));
  $('#daily-button')?.addEventListener('click', () => onChallengesPage ? openChallenge(dailyChallenge(progress).id) : visitChallenge(dailyChallenge(progress).id));
  $('#challenge-list')?.addEventListener('click', (event) => { const card = event.target.closest('[data-challenge]'); if (card) openChallenge(card.dataset.challenge); });
  $('#filters')?.addEventListener('click', (event) => { const button = event.target.closest('[data-filter]'); if (button) setFilter(button.dataset.filter); });
  $('#challenge-close').addEventListener('click', () => $('#challenge-dialog').close());
  $('#auth-close').addEventListener('click', () => $('#auth-dialog').close());
  $('#account-button').addEventListener('click', showAuth);
  $('#sync-button')?.addEventListener('click', showAuth);
  $('#signin-tab').addEventListener('click', () => setAuthMode('signin'));
  $('#signup-tab').addEventListener('click', () => setAuthMode('signup'));
  $('#auth-form').addEventListener('submit', handleAuthSubmit);
  $('#learning-main')?.addEventListener('submit', async (event) => {
    if (event.target.id !== 'lesson-check-form') return;
    event.preventDefault();
    const lesson = lessonById[event.target.dataset.lesson];
    const selected = event.target.querySelector('input[name="answer"]:checked');
    if (!lesson || !selected) return;
    if (Number(selected.value) !== lesson.check.answer) {
      const feedback = $('#lesson-feedback'); feedback.textContent = ll('wrong'); feedback.hidden = false;
      return;
    }
    const button = event.target.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      if (user()) {
        rewards = await awardLesson(lesson.id, Number(selected.value));
        rewardStatus = 'ready';
      }
      const result = completeLesson(progress, lesson.id);
      progress = result.progress; persistLocal(); queueCloudSync(); render();
      toast(user() ? rewards.awarded ? ll('rewardEarned') : ll('rewardOnce') : ll('guestDone'));
    } catch (cause) {
      console.warn('Lesson award failed:', cause);
      const feedback = $('#lesson-feedback');
      if (feedback) { feedback.textContent = ll('rewardFail'); feedback.hidden = false; }
      button.disabled = false;
    }
  });
  $('#language-toggle').addEventListener('click', () => { toggleLanguage(); render(); applyLanguage(); });
  document.querySelectorAll('[data-provider]').forEach((button) => button.addEventListener('click', () => {
    try { signInWithProvider(button.dataset.provider); }
    catch (cause) { $('#auth-error').textContent = cause.message; $('#auth-error').hidden = false; }
  }));
  for (const dialog of [$('#challenge-dialog'), $('#auth-dialog')]) dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
}
function initReveal() {
  const nodes = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { nodes.forEach((node) => node.classList.add('visible')); return; }
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .08 });
  nodes.forEach((node) => observer.observe(node));
}
async function init() {
  if (!ownerUserId) persistLocal();
  render(); applyLanguage(); bindEvents(); initReveal();
  const query = new URLSearchParams(location.search);
  if (query.has('auth_error')) { toast(t('oauthError')); const url = new URL(location.href); url.searchParams.delete('auth_error'); history.replaceState(null, '', url); }
  const requestedChallenge = $('#challenge-list') ? query.get('challenge') : null;
  if (!available()) { if (requestedChallenge) openChallenge(requestedChallenge); return; }
  let signedIn;
  try { signedIn = await loadUser(); } catch { toast(t('accountError')); if (requestedChallenge) openChallenge(requestedChallenge); return; }
  if (signedIn) {
    if (ownerUserId === signedIn.$id) { try { progress = cleanProgress(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch { progress = assignDaily(null); } }
    progress = mergeProgress(ownerUserId && ownerUserId !== signedIn.$id ? null : progress, cloudProgress());
    ownerUserId = signedIn.$id; persistLocal(); render(); queueCloudSync(); await refreshRewards();
  } else if (ownerUserId) { ownerUserId = null; progress = assignDaily(null); persistLocal(); render(); }
  if (requestedChallenge) openChallenge(requestedChallenge);
}
init();
