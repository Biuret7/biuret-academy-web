import { tracks, challenges, challengeById, challengesForTrack } from './content.js';
import { learningPath, courseById, lessonById, localized } from './learning-content.js';
import { STORAGE_KEY, dayKey, assignDaily, cleanProgress, mergeProgress, isUnlocked, totalXp, streak, weekActivity, dailyChallenge, completeChallenge, nextChallenge, trackProgress, isLessonUnlocked, completeLesson, courseLearningProgress } from './engine.js';
import { user, available, loadUser, signIn, signUp, signInWithProvider, signOut, cloudProgress, saveCloudProgress } from './auth.js';
import { applyLanguage, toggleLanguage, currentLanguage, isEnglish, t, trackText, challengeText } from './i18n.js?v=20260926-3';

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
  ar: { roadmap: 'خارطة المسار', available: 'متاح الآن', planned: 'قيد الإعداد', course: 'كورس', exam: 'امتحان', lessons: 'دروس', finished: 'مكتمل', start: 'افتح الكورس', open: 'افتح الدرس', continue: 'تابع التعلّم', check: 'تحقّق من فهمك', wrong: 'جرّب مرة أخرى. راجع الشرح قبل اختيار الإجابة.', done: 'أكملت هذا الدرس', next: 'الدرس التالي', practice: 'التحدّي العملي', practiceNote: 'التمرين متاح الآن. التقدّم هنا للتعلّم والمراجعة، وليس شهادة رسمية.', selfCheck: 'مراجعة سريعة', intro: 'ما ستتعلمه', back: 'العودة للمسار', locked: 'أكمل الدرس السابق أولاً.', missing: 'هذا المحتوى غير متاح.', min: 'دقائق', of: 'من', lesson: 'درس', launch: 'المحتوى المتاح', readOnly: 'هذه المرحلة قيد الإعداد؛ سننشرها عند اكتمال محتواها.', seePath: 'شاهد خارطة المسار', verifiedLater: 'الامتحان والشهادة سيصلان بعد إطلاق التحقق الآمن على الخادم.' },
  en: { roadmap: 'Learning roadmap', available: 'Available now', planned: 'In development', course: 'Course', exam: 'Exam', lessons: 'lessons', finished: 'Complete', start: 'Open course', open: 'Open lesson', continue: 'Continue learning', check: 'Check your understanding', wrong: 'Try again. Review the explanation before choosing.', done: 'You completed this lesson', next: 'Next lesson', practice: 'Practical challenge', practiceNote: 'This exercise is available now. Progress here is for learning and review, not an official credential.', selfCheck: 'Quick check', intro: 'What you will learn', back: 'Back to path', locked: 'Complete the previous lesson first.', missing: 'This content is unavailable.', min: 'min', of: 'of', lesson: 'Lesson', launch: 'Available content', readOnly: 'This stage is in development and will open when its content is ready.', seePath: 'View roadmap', verifiedLater: 'The exam and certificate will follow server-side verification.' },
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
    return `<button class="challenge-card ${done ? 'done' : ''} ${locked ? 'locked' : ''}" type="button" data-challenge="${challenge.id}" aria-label="${esc(copy.title)}${isEnglish() ? ', ' : '، '}${done ? t('completed') : locked ? t('locked') : t('available')}"><span class="challenge-index">${done ? '✓' : locked ? '⌁' : String(challenge.order).padStart(2, '0')}</span><span class="challenge-body"><h3>${esc(copy.title)}</h3><p>${esc(copy.subtitle)}</p><span class="challenge-meta"><span>${esc(track.name)}</span><span>${challenge.minutes} MIN</span><span>+${challenge.xp} XP</span></span></span><span class="challenge-arrow" aria-hidden="true">${locked ? '○' : '↗'}</span></button>`;
  }).join('');
  for (const button of document.querySelectorAll('.filter')) {
    const selected = button.dataset.filter === filter;
    button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
  }
}
function renderProgress() {
  const daily = dailyChallenge(progress), copy = challengeText(daily);
  if ($('#daily-title')) $('#daily-title').textContent = copy.title;
  const reward = progress.dailyBonus[dayKey()] ? t('dailyComplete') : `+${progress.completed[daily.id] ? 30 : daily.xp + 30} XP`;
  if ($('#daily-meta')) $('#daily-meta').textContent = `${trackText(tracks.find((track) => track.id === daily.track)).name} · ${daily.minutes} ${t('minutes')} · ${reward}`;
  if ($('#daily-button')) $('#daily-button').textContent = progress.completed[daily.id] ? t('reviewChallenge') : t('openChallenge');
  if ($('#xp-stat')) $('#xp-stat').textContent = totalXp(progress).toLocaleString('en-US');
  if ($('#done-stat')) $('#done-stat').innerHTML = `${Object.keys(progress.completed).length}<span class="stat-total"> / ${challenges.length}</span>`;
  const days = streak(progress);
  if ($('#streak-stat')) $('#streak-stat').textContent = days;
  if ($('#streak-detail')) $('#streak-detail').textContent = days ? `${days} ${days === 1 ? t('oneDay') : t('manyDays')} ${t('inARow')}` : t('startToday');
  if ($('#week-grid')) $('#week-grid').innerHTML = weekActivity(progress).map((day) => `<div class="week-day" title="${day.date}: ${day.count} ${t('challenges')}"><div class="week-bar ${day.count ? 'active' : ''}" style="height:${Math.max(8, Math.min(100, day.count * 34))}%"></div><span>${new Date(`${day.date}T12:00:00`).toLocaleDateString(currentLanguage() === 'en' ? 'en-US' : 'ar', { weekday: 'short' })}</span></div>`).join('');
  if ($('#account-nudge')) $('#account-nudge').hidden = Boolean(user());
  if ($('#learning-progress-card')) {
    const state = courseLearningProgress(progress, 'url-safety');
    $('#learning-progress-card').innerHTML = `<div><span class="section-kicker">LEARNING / FOUNDATIONS</span><h3>${esc(lc(courseById['url-safety'].title))}</h3><p>${state.completed} / ${state.total} ${ll('lessons')} · ${state.challengeComplete ? ll('finished') : ll('practice')}</p></div><a class="button button-outline" href="course.html?id=url-safety">${ll('continue')} ↗</a>`;
  }
  $('#account-button').innerHTML = user() ? `${esc((user().name || t('account')).split(' ')[0])} <span aria-hidden="true">↗</span>` : `${t('account')} <span aria-hidden="true">↗</span>`;
}
function renderRoadmap() {
  const root = $('#learning-roadmap');
  if (!root) return;
  const state = courseLearningProgress(progress, 'url-safety');
  root.innerHTML = `<div class="roadmap-intro"><div><span class="section-kicker">BIURET / LEARNING PATH 01</span><h2>${esc(lc(learningPath.title))}</h2><p>${esc(lc(learningPath.summary))}</p></div><span class="roadmap-pill">${state.completed} / ${state.total} ${ll('lessons')}</span></div><ol class="roadmap-list">${learningPath.nodes.map((node, index) => `<li class="roadmap-node ${node.state === 'planned' ? 'is-planned' : ''}"><span class="roadmap-index">${String(index + 1).padStart(2, '0')}</span><div><span class="roadmap-meta">${node.type === 'exam' ? ll('exam') : ll('course')} · ${node.state === 'published' ? ll('available') : ll('planned')}</span><h3>${esc(lc(node.title))}</h3><p>${esc(lc(node.description))}</p>${node.state === 'published' ? `<a class="roadmap-link" href="course.html?id=${encodeURIComponent(node.id)}">${ll('start')} ↗</a>` : `<span class="roadmap-pending">${ll('readOnly')}</span>`}</div></li>`).join('')}</ol><p class="roadmap-note">${ll('verifiedLater')}</p>`;
}
function renderCourse() {
  const root = $('#learning-main');
  if (!root || document.querySelector('.site-shell')?.dataset.page !== 'course') return;
  const course = courseById[new URLSearchParams(location.search).get('id')];
  if (!course) { root.innerHTML = `<section class="section-frame learning-empty"><h1>${ll('missing')}</h1><a href="paths.html">${ll('seePath')} ↗</a></section>`; return; }
  const state = courseLearningProgress(progress, course.id);
  root.innerHTML = `<section class="learning-hero section-frame"><a class="learning-back" href="paths.html#foundations-roadmap">← ${ll('back')}</a><span class="section-kicker">COURSE 01 / FOUNDATIONS</span><h1>${esc(lc(course.title))}</h1><p>${esc(lc(course.summary))}</p><div class="learning-facts"><span>${course.minutes} ${ll('min')}</span><span>${state.completed} / ${state.total} ${ll('lessons')}</span><span>${ll('available')}</span></div></section><section class="learning-body section-frame"><div class="learning-panel"><span class="section-kicker">${ll('intro')}</span><ul>${course.outcomes.map((outcome) => `<li>${esc(lc(outcome))}</li>`).join('')}</ul></div><div class="learning-panel"><span class="section-kicker">${ll('lessons')}</span><div class="lesson-list">${course.lessonIds.map((id, index) => { const lesson = lessonById[id], done = Boolean(progress.lessons[id]), unlocked = isLessonUnlocked(id, progress); return `<a class="lesson-row ${unlocked ? '' : 'is-locked'}" href="${unlocked ? `lesson.html?id=${encodeURIComponent(id)}` : '#'}" ${unlocked ? '' : 'aria-disabled="true" tabindex="-1"'}><span class="lesson-number">${String(index + 1).padStart(2, '0')}</span><span><strong>${esc(lc(lesson.title))}</strong><small>${esc(lc(lesson.summary))} · ${lesson.minutes} ${ll('min')}</small></span><b>${done ? '✓' : unlocked ? '↗' : '○'}</b></a>`; }).join('')}</div></div><div class="learning-panel practice-panel"><span class="section-kicker">${ll('practice')}</span><h2>${esc(challengeText(challengeById[course.challengeId]).title)}</h2><p>${ll('practiceNote')}</p><a class="button button-outline" href="challenges.html?challenge=${encodeURIComponent(course.challengeId)}">${ll('practice')} ↗</a></div></section>`;
}
function renderLesson() {
  const root = $('#learning-main');
  if (!root || document.querySelector('.site-shell')?.dataset.page !== 'lesson') return;
  const lesson = lessonById[new URLSearchParams(location.search).get('id')];
  if (!lesson) { root.innerHTML = `<section class="section-frame learning-empty"><h1>${ll('missing')}</h1><a href="paths.html">${ll('seePath')} ↗</a></section>`; return; }
  const course = courseById[lesson.courseId];
  const unlocked = isLessonUnlocked(lesson.id, progress);
  if (!unlocked) { root.innerHTML = `<section class="section-frame learning-empty"><h1>${ll('locked')}</h1><a href="course.html?id=${encodeURIComponent(course.id)}">${ll('back')} ↗</a></section>`; return; }
  const done = Boolean(progress.lessons[lesson.id]);
  const nextId = course.lessonIds[course.lessonIds.indexOf(lesson.id) + 1];
  root.innerHTML = `<section class="learning-hero section-frame"><a class="learning-back" href="course.html?id=${encodeURIComponent(course.id)}">← ${esc(lc(course.title))}</a><span class="section-kicker">${ll('lesson')} ${String(lesson.order).padStart(2, '0')} / ${course.lessonIds.length}</span><h1>${esc(lc(lesson.title))}</h1><p>${esc(lc(lesson.summary))}</p><div class="learning-facts"><span>${lesson.minutes} ${ll('min')}</span><span>${done ? '✓ ' + ll('finished') : ll('available')}</span></div></section><article class="lesson-article section-frame">${lesson.sections.map((section) => `<section class="lesson-copy"><h2>${esc(lc(section.title))}</h2><p>${esc(lc(section.body))}</p></section>`).join('')}<div class="lesson-example"><span>EXAMPLE / URL</span><code dir="ltr">${esc(lesson.example)}</code></div><div class="learning-panel lesson-check"><span class="section-kicker">${ll('selfCheck')}</span><h2>${esc(lc(lesson.check.question))}</h2>${done ? `<p class="answer-feedback success">✓ ${ll('done')} — ${esc(lc(lesson.check.explanation))}</p>` : `<form id="lesson-check-form" data-lesson="${lesson.id}"><fieldset><legend class="sr-only">${esc(lc(lesson.check.question))}</legend>${lesson.check.options.map((option, index) => `<label class="option-label"><input type="radio" name="answer" value="${index}" required><span>${esc(lc(option))}</span></label>`).join('')}</fieldset><button class="button button-primary" type="submit">${ll('check')} ↗</button><p class="answer-feedback error" id="lesson-feedback" role="status" hidden></p></form>`}${done && nextId ? `<a class="button button-outline" href="lesson.html?id=${encodeURIComponent(nextId)}">${ll('next')} ↗</a>` : done ? `<a class="button button-outline" href="challenges.html?challenge=${encodeURIComponent(course.challengeId)}">${ll('practice')} ↗</a>` : ''}</div></article>`;
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
  $('#challenge-dialog-content').innerHTML = `<div class="dialog-heading"><span class="section-kicker">MISSION ${String(challenge.order).padStart(2, '0')} / ${esc(track.english)}</span><h2 id="challenge-dialog-title">${esc(copy.title)}</h2><p>${esc(copy.subtitle)}</p></div><div class="dialog-tags"><span>${esc(copy.difficulty)}</span><span>${challenge.minutes} ${t('minutes')}</span><span>${dailyReplay ? '+30 XP DAILY' : `+${challenge.xp} XP`}</span></div><div class="scenario-box"><h3>${t('mission')}</h3><p>${esc(copy.scenario)}</p></div><div class="artifact-box"><h3>${esc(copy.artifactLabel)}</h3><pre>${esc(copy.artifact)}</pre></div><h3 class="question-heading">${esc(copy.question)}</h3>${showForm ? `<form id="answer-form">${form}<div class="dialog-actions"><button class="button button-primary" type="submit">${t('check')} <span aria-hidden="true">↗</span></button><button class="hint-button" id="hint-button" type="button">${t('hint')}</button></div><p class="answer-feedback" id="answer-feedback" role="status" hidden></p><div class="hint-box" id="hint-box" hidden>${esc(copy.hint)}</div></form>` : ''}<div class="solution-box" id="solution-box" ${showForm ? 'hidden' : ''}><h3>${done ? t('doneHeading') : t('correctHeading')}</h3><p>${esc(copy.explanation)}</p><p class="takeaway">${esc(copy.takeaway)}</p></div><div id="next-slot"></div>`;
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
  toast(isEnglish() ? `Well done! You earned ${result.awardedXp} XP.` : `أحسنت! حصلت على ${result.awardedXp} نقطة خبرة.`);
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
      try { await syncQueue; await saveCloudProgress(progress); await signOut(); ownerUserId = null; progress = assignDaily(null); persistLocal(); $('#auth-dialog').close(); render(); toast(t('signedOut')); }
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
    ownerUserId = user().$id; persistLocal(); queueCloudSync(); $('#auth-dialog').close(); render(); toast(t('signedIn'));
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
  $('#learning-main')?.addEventListener('submit', (event) => {
    if (event.target.id !== 'lesson-check-form') return;
    event.preventDefault();
    const lesson = lessonById[event.target.dataset.lesson];
    const selected = event.target.querySelector('input[name="answer"]:checked');
    if (!lesson || !selected) return;
    if (Number(selected.value) !== lesson.check.answer) {
      const feedback = $('#lesson-feedback'); feedback.textContent = ll('wrong'); feedback.hidden = false;
      return;
    }
    const result = completeLesson(progress, lesson.id);
    progress = result.progress; persistLocal(); queueCloudSync(); render();
    toast(ll('done'));
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
    ownerUserId = signedIn.$id; persistLocal(); render(); queueCloudSync();
  } else if (ownerUserId) { ownerUserId = null; progress = assignDaily(null); persistLocal(); render(); }
  if (requestedChallenge) openChallenge(requestedChallenge);
}
init();
