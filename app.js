import { tracks, challenges, challengeById, challengesForTrack } from './content.js';
import { STORAGE_KEY, dayKey, assignDaily, cleanProgress, mergeProgress, isUnlocked, totalXp, streak, weekActivity, dailyChallenge, completeChallenge, nextChallenge, trackProgress } from './engine.js';
import { user, available, loadUser, signIn, signUp, signInWithProvider, signOut, cloudProgress, saveCloudProgress } from './auth.js';

const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const OWNER_KEY = 'biuret-academy-owner-v1';
let ownerUserId;
try { ownerUserId = localStorage.getItem(OWNER_KEY); } catch { ownerUserId = null; }
let progress;
try { progress = ownerUserId ? assignDaily(null) : assignDaily(cleanProgress(JSON.parse(localStorage.getItem(STORAGE_KEY)))); }
catch { progress = assignDaily(null); }
let filter = 'all';
let activeChallenge = null;
let attempts = 0;
let hintUsed = false;
let toastTimer;
let syncQueue = Promise.resolve();

function persistLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    if (ownerUserId) localStorage.setItem(OWNER_KEY, ownerUserId);
    else localStorage.removeItem(OWNER_KEY);
  }
  catch { toast('تعذر حفظ التقدّم على هذا المتصفح.'); }
}

function queueCloudSync() {
  if (!user()) return;
  syncQueue = syncQueue.then(async () => {
    progress = await saveCloudProgress(progress);
    persistLocal();
    render();
  }).catch((error) => { console.warn('Cloud progress sync failed:', error); toast('التقدّم محفوظ على جهازك، لكن تعذرت مزامنته الآن.'); });
}

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 4500);
}

function renderTracks() {
  $('#track-grid').innerHTML = tracks.map((track) => {
    const state = trackProgress(progress, track.id);
    const tone = { lime: '#c9ff39', cyan: '#71dbea', violet: '#b69bff' }[track.tone];
    return `<a class="track-card reveal visible" href="#challenges" data-track="${esc(track.id)}" style="--tone:${tone}"><div class="track-top"><span class="track-number">PATH / ${track.number}</span><span class="track-icon" aria-hidden="true">${track.icon}</span></div><div class="track-content"><span class="track-english">${track.english}</span><h3>${esc(track.name)}</h3><p>${esc(track.summary)}</p><div class="track-bottom"><span>${state.completed} / ${state.total} تحديات مكتملة</span><span class="track-arrow" aria-hidden="true">↗</span></div><div class="track-progress" aria-hidden="true"><span style="width:${state.completed / state.total * 100}%"></span></div></div></a>`;
  }).join('');
}

function renderChallenges() {
  const listed = filter === 'all' ? challenges : challengesForTrack(filter);
  $('#challenge-count').textContent = `${listed.length} تحدّياً`;
  $('#challenge-list').innerHTML = listed.map((challenge) => {
    const done = Boolean(progress.completed[challenge.id]);
    const locked = !isUnlocked(challenge, progress);
    const track = tracks.find((item) => item.id === challenge.track);
    const state = done ? 'مكتمل' : locked ? 'مغلق' : 'متاح الآن';
    return `<button class="challenge-card ${done ? 'done' : ''} ${locked ? 'locked' : ''}" type="button" data-challenge="${challenge.id}" aria-label="${esc(challenge.title)}، ${state}"><span class="challenge-index">${done ? '✓' : locked ? '⌁' : String(challenge.order).padStart(2, '0')}</span><span class="challenge-body"><h3>${esc(challenge.title)}</h3><p>${esc(challenge.subtitle)}</p><span class="challenge-meta"><span>${esc(track.name)}</span><span>${challenge.minutes} MIN</span><span>+${challenge.xp} XP</span></span></span><span class="challenge-arrow" aria-hidden="true">${locked ? '○' : '↗'}</span></button>`;
  }).join('');
}

function renderProgress() {
  const daily = dailyChallenge(progress);
  $('#daily-title').textContent = daily.title;
  const dailyReward = progress.dailyBonus[dayKey()] ? 'مكتمل اليوم' : `+${progress.completed[daily.id] ? 30 : daily.xp + 30} XP`;
  $('#daily-meta').textContent = `${tracks.find((track) => track.id === daily.track).name} · ${daily.minutes} دقائق · ${dailyReward}`;
  $('#daily-button').textContent = progress.completed[daily.id] ? 'راجع التحدّي ↗' : 'افتح التحدّي ↗';
  $('#xp-stat').textContent = totalXp(progress).toLocaleString('en-US');
  $('#done-stat').innerHTML = `${Object.keys(progress.completed).length}<span class="stat-total"> / ${challenges.length}</span>`;
  const days = streak(progress);
  $('#streak-stat').textContent = days;
  $('#streak-detail').textContent = days ? `${days} ${days === 1 ? 'يوم' : 'أيام'} متتالية` : 'ابدأ اليوم';
  $('#week-grid').innerHTML = weekActivity(progress).map((day) => `<div class="week-day" title="${day.date}: ${day.count} تحديات"><div class="week-bar ${day.count ? 'active' : ''}" style="height:${Math.max(8, Math.min(100, day.count * 34))}%"></div><span>${esc(day.weekday)}</span></div>`).join('');
  $('#account-nudge').hidden = Boolean(user());
  $('#account-button').innerHTML = user() ? `${esc((user().name || 'حسابي').split(' ')[0])} <span aria-hidden="true">↗</span>` : 'حسابي <span aria-hidden="true">↗</span>';
}

function render() { renderTracks(); renderChallenges(); renderProgress(); }

function openChallenge(id) {
  const challenge = challengeById[id];
  if (!challenge) return;
  if (!isUnlocked(challenge, progress)) { toast('أكمل التحدّي السابق في هذا المسار لفتح هذا التحدّي.'); return; }
  activeChallenge = challenge;
  attempts = 0;
  hintUsed = false;
  const done = Boolean(progress.completed[id]);
  const dailyReplay = done && dailyChallenge(progress).id === id && !progress.dailyBonus[dayKey()];
  const showForm = !done || dailyReplay;
  const track = tracks.find((item) => item.id === challenge.track);
  const form = challenge.kind === 'choice'
    ? `<div class="answer-options">${challenge.options.map((option, index) => `<label class="option-label"><input type="radio" name="answer" value="${index}"><span>${esc(option)}</span></label>`).join('')}</div>`
    : `<input class="text-answer" id="text-answer" type="text" autocomplete="off" spellcheck="false" placeholder="${esc(challenge.placeholder)}" aria-label="إجابتك">`;
  $('#challenge-dialog-content').innerHTML = `<div class="dialog-heading"><span class="section-kicker">MISSION ${String(challenge.order).padStart(2, '0')} / ${esc(track.english)}</span><h2 id="challenge-dialog-title">${esc(challenge.title)}</h2><p>${esc(challenge.subtitle)}</p></div><div class="dialog-tags"><span>${esc(challenge.difficulty)}</span><span>${challenge.minutes} دقائق</span><span>${dailyReplay ? '+30 XP DAILY' : `+${challenge.xp} XP`}</span></div><div class="scenario-box"><h3>المهمة</h3><p>${esc(challenge.scenario)}</p></div><div class="artifact-box"><h3>${esc(challenge.artifactLabel)}</h3><pre>${esc(challenge.artifact)}</pre></div><h3 class="question-heading">${esc(challenge.question)}</h3>${showForm ? `<form id="answer-form">${form}<div class="dialog-actions"><button class="button button-primary" type="submit">تحقّق من الإجابة <span aria-hidden="true">↗</span></button><button class="hint-button" id="hint-button" type="button">أحتاج تلميحاً</button></div><p class="answer-feedback" id="answer-feedback" role="status" hidden></p><div class="hint-box" id="hint-box" hidden>${esc(challenge.hint)}</div></form>` : ''}<div class="solution-box" id="solution-box" ${showForm ? 'hidden' : ''}><h3>${done ? '✓ تحدٍّ مكتمل' : '✓ أحسنت، إجابة صحيحة'}</h3><p>${esc(challenge.explanation)}</p><p class="takeaway">${esc(challenge.takeaway)}</p></div><div id="next-slot"></div>`;
  if (!showForm) renderNextButton();
  const dialog = $('#challenge-dialog');
  dialog.showModal();
  dialog.scrollTop = 0;
  if (showForm) $('#answer-form').addEventListener('submit', checkAnswer);
  $('#hint-button')?.addEventListener('click', () => { hintUsed = true; $('#hint-box').hidden = false; $('#hint-button').hidden = true; });
}

function renderNextButton() {
  const next = nextChallenge(progress, activeChallenge.track);
  $('#next-slot').innerHTML = next && next.id !== activeChallenge.id ? `<button class="button button-outline dialog-next" id="next-button" type="button">التحدّي التالي <span aria-hidden="true">↗</span></button>` : '';
  $('#next-button')?.addEventListener('click', () => { $('#challenge-dialog').close(); openChallenge(next.id); });
}

function checkAnswer(event) {
  event.preventDefault();
  const challenge = activeChallenge;
  let correct;
  if (challenge.kind === 'choice') {
    const selected = $('#answer-form input[name="answer"]:checked');
    correct = selected ? challenge.options[Number(selected.value)] === challenge.answer : false;
  } else {
    const answer = $('#text-answer').value.trim().toLocaleLowerCase('en-US').replace(/\s+/g, '');
    correct = challenge.answers.some((item) => item.toLocaleLowerCase('en-US').replace(/\s+/g, '') === answer);
  }
  attempts++;
  const feedback = $('#answer-feedback');
  feedback.hidden = false;
  if (!correct) {
    feedback.className = 'answer-feedback error';
    feedback.textContent = 'ليست الإجابة الصحيحة بعد. راجع الدليل وحاول مرة أخرى.';
    return;
  }
  const result = completeChallenge(progress, challenge.id, { attempts, hintUsed });
  progress = result.progress;
  persistLocal();
  queueCloudSync();
  render();
  $('#answer-form').hidden = true;
  $('#solution-box').hidden = false;
  renderNextButton();
  toast(`أحسنت! حصلت على ${result.awardedXp} نقطة خبرة.`);
}

function openNext() {
  const next = nextChallenge(progress) || dailyChallenge(progress);
  openChallenge(next.id);
}

function setFilter(value) {
  filter = value;
  for (const button of document.querySelectorAll('.filter')) {
    const active = button.dataset.filter === value;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  renderChallenges();
}

function showAuth() {
  const signedIn = Boolean(user());
  $('#signed-in-box').hidden = !signedIn;
  $('#auth-forms').hidden = signedIn;
  $('#auth-title').textContent = signedIn ? 'أهلاً بعودتك.' : 'احفظ تقدّمك.';
  $('#auth-subtitle').textContent = signedIn ? 'إنجازاتك متزامنة مع حساب Biuret.' : 'حساب واحد لموقع Biuret والأكاديمية.';
  if (signedIn) {
    $('#signed-in-box').innerHTML = `<div class="signed-in-name">${esc(user().name || 'متعلّم Biuret')}</div><div>${esc(user().email || '')}</div><div class="signed-in-actions"><button class="button button-outline" id="signout-button" type="button">تسجيل الخروج</button></div>`;
    $('#signout-button').addEventListener('click', async () => {
      try {
        await syncQueue;
        await saveCloudProgress(progress);
        await signOut();
        ownerUserId = null;
        progress = assignDaily(null);
        persistLocal();
        $('#auth-dialog').close(); render();
        toast('تم تسجيل الخروج. إنجازاتك محفوظة في حسابك.');
      } catch { toast('تعذر حفظ التقدّم أو تسجيل الخروج الآن. حاول مجدداً.'); }
    });
  }
  $('#auth-dialog').showModal();
}

function setAuthMode(mode) {
  const signup = mode === 'signup';
  $('#name-field').hidden = !signup;
  $('#auth-name').required = signup;
  $('#auth-password').autocomplete = signup ? 'new-password' : 'current-password';
  $('#auth-submit').innerHTML = signup ? 'إنشاء حساب <span aria-hidden="true">↗</span>' : 'تسجيل الدخول <span aria-hidden="true">↗</span>';
  $('#signin-tab').classList.toggle('active', !signup);
  $('#signup-tab').classList.toggle('active', signup);
  $('#signin-tab').setAttribute('aria-selected', String(!signup));
  $('#signup-tab').setAttribute('aria-selected', String(signup));
  $('#auth-error').hidden = true;
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const signup = $('#signup-tab').classList.contains('active');
  const button = $('#auth-submit');
  const error = $('#auth-error');
  button.disabled = true;
  error.hidden = true;
  try {
    if (signup) await signUp($('#auth-name').value.trim(), $('#auth-email').value.trim(), $('#auth-password').value);
    else await signIn($('#auth-email').value.trim(), $('#auth-password').value);
    progress = mergeProgress(ownerUserId && ownerUserId !== user().$id ? null : progress, cloudProgress());
    ownerUserId = user().$id;
    persistLocal();
    queueCloudSync();
    $('#auth-dialog').close();
    render();
    toast('أهلاً بك! تم ربط تقدّمك بحساب Biuret.');
  } catch (cause) {
    error.textContent = cause?.message || 'تعذر تسجيل الدخول. تحقق من البيانات وحاول مجدداً.';
    error.hidden = false;
  } finally { button.disabled = false; }
}

function bindEvents() {
  for (const id of ['start-button', 'closing-button']) $("#" + id).addEventListener('click', openNext);
  $('#daily-button').addEventListener('click', () => openChallenge(dailyChallenge(progress).id));
  $('#track-grid').addEventListener('click', (event) => { const card = event.target.closest('[data-track]'); if (card) setFilter(card.dataset.track); });
  $('#challenge-list').addEventListener('click', (event) => { const card = event.target.closest('[data-challenge]'); if (card) openChallenge(card.dataset.challenge); });
  $('#filters').addEventListener('click', (event) => { const button = event.target.closest('[data-filter]'); if (button) setFilter(button.dataset.filter); });
  $('#challenge-close').addEventListener('click', () => $('#challenge-dialog').close());
  $('#auth-close').addEventListener('click', () => $('#auth-dialog').close());
  $('#account-button').addEventListener('click', showAuth);
  $('#sync-button').addEventListener('click', showAuth);
  $('#signin-tab').addEventListener('click', () => setAuthMode('signin'));
  $('#signup-tab').addEventListener('click', () => setAuthMode('signup'));
  $('#auth-form').addEventListener('submit', handleAuthSubmit);
  document.querySelectorAll('[data-provider]').forEach((button) => button.addEventListener('click', () => {
    try { signInWithProvider(button.dataset.provider); }
    catch (cause) { $('#auth-error').textContent = cause.message; $('#auth-error').hidden = false; }
  }));
  for (const dialog of [$('#challenge-dialog'), $('#auth-dialog')]) dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
}

function initReveal() {
  const nodes = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodes.forEach((node) => node.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: .08 });
  nodes.forEach((node) => observer.observe(node));
}

async function init() {
  if (!ownerUserId) persistLocal();
  render(); bindEvents(); initReveal();
  if (new URLSearchParams(location.search).has('auth_error')) {
    toast('تعذر إكمال الدخول عبر المزود. حاول مرة أخرى.');
    history.replaceState(null, '', location.pathname + location.hash);
  }
  if (!available()) return;
  let signedIn;
  try { signedIn = await loadUser(); }
  catch { toast('تعذر الاتصال بالحساب الآن. تقدّمك المحلي محفوظ.'); return; }
  if (signedIn) {
    if (ownerUserId === signedIn.$id) {
      try { progress = cleanProgress(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
      catch { progress = assignDaily(null); }
    }
    progress = mergeProgress(ownerUserId && ownerUserId !== signedIn.$id ? null : progress, cloudProgress());
    ownerUserId = signedIn.$id;
    persistLocal(); render(); queueCloudSync();
  } else if (ownerUserId) {
    ownerUserId = null;
    progress = assignDaily(null);
    persistLocal(); render();
  }
}

init();
