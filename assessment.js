import { user, loadUser, loadExam, submitExam, loadCredential, shareCredential, correctCredentialName } from './auth.js?v=20261003-1';
import { currentLanguage, applyLanguage } from './i18n.js?v=20260929-1';
import { credentialFacts, downloadCredential } from './credential-art.js?v=20261003-1';
import { fullName } from './full-name.js?v=20260929-1';

const root = document.querySelector('#assessment-main');
const isExam = document.querySelector('.site-shell')?.dataset.page === 'exam';
const tr = (ar, en) => currentLanguage() === 'en' ? en : ar;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const frame = (content) => `<section class="assessment-hero section-frame"><a class="learning-back" href="paths.html#foundations-roadmap">← ${tr('خارطة المسار', 'Learning roadmap')}</a><span class="section-kicker">BIURET ACADEMY / FOUNDATIONS</span><h1>${isExam ? tr('امتحان أساسيات الأمن السيبراني', 'Cybersecurity Foundations exam') : tr('شهادة إنجاز', 'Certificate of achievement')}</h1><p>${isExam ? tr('اختبر قراراتك الأمنية بعد إكمال الدروس التسعة الموثقة.', 'Test your security decisions after completing all nine verified lessons.') : tr('إنجاز موثّق باسم المتعلم الكامل. يمكنك تنزيله والتحقق من حالته.', 'A credential in the learner’s full name. Download it and verify its current status.')}</p></section><section class="assessment-body section-frame">${content}</section>`;
function notice(title, message, action = '') { root.innerHTML = frame(`<div class="assessment-card"><span class="section-kicker">FOUNDATIONS / 01</span><h2>${title}</h2><p>${message}</p>${action}</div>`); }
function errorMessage(error) { return esc(error?.message || tr('تعذر تحميل البيانات. حاول مرة أخرى.', 'Could not load the data. Please try again.')); }
function formatDate(value) { return value ? new Intl.DateTimeFormat(currentLanguage() === 'en' ? 'en' : 'ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : ''; }
let examState;
let credential;
let busy = false;

function renderExam() {
  const s = examState;
  if (!s) return;
  const attempts = s.attempts.map((a) => `<li><span>${tr('المحاولة', 'Attempt')} ${a.slot}</span><strong><bdi dir="ltr">${a.score} / ${s.totalQuestions}</bdi> · ${a.passed ? tr('ناجح', 'Passed') : tr('لم ينجح', 'Not passed')}</strong><small>${esc(formatDate(a.completedAt))}</small></li>`).join('');
  let content = `<div class="assessment-stats"><span>${tr('الدروس الموثقة', 'Verified lessons')} <strong><bdi dir="ltr">${s.completedLessons} / ${s.requiredLessons}</bdi></strong></span><span>${tr('درجة النجاح', 'Passing score')} <strong><bdi dir="ltr">${s.passScore} / ${s.totalQuestions}</bdi></strong></span><span>${tr('المحاولات المتبقية', 'Attempts left')} <strong>${s.remaining}</strong></span></div>`;
  if (s.passed) content += `<div class="assessment-card success"><span class="section-kicker">VERIFIED / PASSED</span><h2>${tr('أنجزت المسار بنجاح', 'You passed the path')}</h2><p>${tr('نتيجتك محفوظة على الخادم. يمكنك عرض إثبات الإنجاز والتحكم بمشاركته.', 'Your result is saved on the server. View your credential and control its sharing.')}</p><a class="button button-primary" href="certificate.html">${tr('عرض إثبات الإنجاز', 'View credential')} ↗</a></div>`;
  else if (!s.eligible) content += s.lessonEligible ? `<div class="assessment-card"><h2>${tr('خطوتك التالية: التقييم العملي', 'Next: practical assessment')}</h2><p>${tr('حلل ثلاث عينات تدريبية بعد إكمال الدروس، ثم يعود لك الامتحان النهائي.', 'Analyze three training samples after the lessons, then the final exam opens.')}</p><a class="button button-primary" href="practical.html?id=foundations">${tr('ابدأ التقييم العملي', 'Start practical assessment')} ↗</a></div>` : `<div class="assessment-card"><h2>${tr('أكمل الدروس أولاً', 'Complete the lessons first')}</h2><p>${tr('يتطلب الامتحان توثيق جميع الدروس التسعة قبل التقييم العملي.', 'The exam requires all nine verified lessons before the practical assessment.')}</p><a class="button button-outline" href="paths.html#foundations-roadmap">${tr('تابع التعلّم', 'Continue learning')} ↗</a></div>`;
  else if (!s.remaining) content += `<div class="assessment-card"><h2>${tr('اكتملت المحاولات', 'Attempts used')}</h2><p>${tr('استُخدمت المحاولات الثلاث لهذا الإصدار. تواصل مع فريق Biuret Academy إذا واجهت مشكلة تقنية.', 'All three attempts for this version were used. Contact Biuret Academy if you experienced a technical issue.')}</p></div>`;
  else if (s.nextAt && Date.now() < Date.parse(s.nextAt)) content += `<div class="assessment-card"><h2>${tr('وقت للمراجعة', 'Time to review')}</h2><p>${tr('المحاولة التالية متاحة في', 'Next attempt opens at')} ${esc(formatDate(s.nextAt))}. ${tr('راجع الدروس ثم عد.', 'Review the lessons and return.')}</p></div>`;
  else if (s.questions?.length) content += `<form id="exam-form" class="assessment-form"><div class="assessment-card"><h2>${tr('قبل أن تبدأ', 'Before you begin')}</h2><p>${tr('10 أسئلة، تحتاج 8 إجابات صحيحة. لديك 3 محاولات، وبين المحاولات غير الناجحة 24 ساعة. لا تُمنح XP أو عملات من الامتحان.', '10 questions, 8 correct to pass. You have 3 attempts with a 24-hour pause after an unsuccessful attempt. The exam grants no XP or coins.')}</p></div>${s.questions.map((q, i) => `<fieldset class="assessment-question"><legend><span>${String(i + 1).padStart(2, '0')}</span>${esc(q.question[currentLanguage()])}</legend>${q.options.map((option, n) => `<label class="option-label"><input type="radio" name="${esc(q.id)}" value="${n}" required><span>${esc(option[currentLanguage()])}</span></label>`).join('')}</fieldset>`).join('')}<div class="assessment-submit"><p>${tr('الإرسال نهائي ويحتسب محاولة واحدة.', 'Submission is final and uses one attempt.')}</p><button class="button button-primary" type="submit" ${busy ? 'disabled' : ''}>${tr('سلّم الإجابات', 'Submit answers')} ↗</button></div><p class="answer-feedback error" id="exam-error" role="alert" hidden></p></form>`;
  if (attempts) content += `<div class="assessment-card"><h2>${tr('محاولاتك', 'Your attempts')}</h2><ul class="attempt-list">${attempts}</ul></div>`;
  root.innerHTML = frame(content);
}

async function refreshExam() {
  if (!user()) { notice(tr('سجّل الدخول للامتحان', 'Sign in for the exam'), tr('تستخدم الأكاديمية حساب Biuret نفسه لتوثيق الدروس والمحاولات.', 'The academy uses your Biuret account to verify lessons and attempts.'), `<button class="button button-primary" id="exam-signin" type="button">${tr('فتح الحساب', 'Open account')} ↗</button>`); return; }
  notice(tr('تحميل الامتحان…', 'Loading exam…'), tr('نتحقق من تقدمك ومحاولاتك.', 'Checking your progress and attempts.'));
  try { examState = await loadExam(); renderExam(); }
  catch (error) { notice(tr('تعذر فتح الامتحان', 'Exam unavailable'), errorMessage(error), `<button class="button button-outline" id="assessment-retry" type="button">${tr('أعد المحاولة', 'Retry')}</button>`); }
}

function credentialCard(data, publicView = false) {
  const active = data.status === 'active';
  const pathNames = {
    path_pentest: ['اختبار الاختراق', 'Penetration testing'], path_soc: ['تحليل SOC', 'SOC analysis'],
    path_dfir: ['التحقيق الجنائي الرقمي', 'Digital forensics'], path_cloud: ['أمن السحابة', 'Cloud security'],
    path_grc: ['الحوكمة والمخاطر والامتثال', 'Governance, risk and compliance'],
  };
  const program = data.version?.startsWith('program-path-');
  const subject = program ? pathNames[data.pathId]?.[currentLanguage() === 'en' ? 1 : 0] : tr('أساسيات الأمن السيبراني', 'Cybersecurity Foundations');
  const verifyUrl = new URL('certificate.html', location.href); verifyUrl.searchParams.set('id', data.id);
  const label = active ? tr('شهادة إنجاز موثّقة', 'Certificate of achievement') : tr('إنجاز ملغى', 'Revoked credential');
  return `<div class="credential-card ${active ? '' : 'revoked'}"><div class="credential-head"><span class="section-kicker">BIURET / ACADEMY</span><span class="credential-seal" aria-hidden="true">✦</span></div><p class="credential-kind">${esc(subject || data.pathId)} / ${esc(data.version)}</p><h2>${label}</h2><p>${tr('ممنوح إلى', 'Awarded to')}</p><strong class="credential-name">${esc(data.holderName)}</strong><div class="credential-rule"></div><p>${data.practicalScore ? tr('أكمل المتطلبات الموثقة والتقييم العملي واجتاز امتحان المسار.', 'Completed verified requirements and practical tasks, then passed the path exam.') : program ? tr('أكمل دروس مسار التخصص واجتاز امتحانه بنتيجة لا تقل عن 8/10.', 'Completed the specialty path lessons and passed its exam with at least 8/10.') : tr('أكمل 9 دروس موثقة واجتاز الامتحان النهائي بنتيجة لا تقل عن 8/10.', 'Completed 9 verified lessons and passed the final exam with at least 8/10.')}</p><div class="credential-meta"><span>${tr('تاريخ الإصدار', 'Issued')}<strong>${esc(formatDate(data.issuedAt))}</strong></span><span>${tr('المُصدر', 'Issuer')}<strong>Biuret Academy</strong></span></div><code dir="ltr">${esc(data.id)}</code></div>${!publicView ? `<div class="assessment-card share-card"><h2>${tr('المشاركة بإذنك', 'Share with your permission')}</h2><p>${tr('عند تفعيل الرابط العام يستطيع أي شخص لديه الرابط رؤية اسم العرض وتاريخ الإنجاز وحالته. يمكنك إيقاف المشاركة لاحقاً.', 'When you enable the public link, anyone with it can see your display name, issue date, and status. You can turn sharing off later.')}</p><button class="button ${data.shared ? 'button-outline' : 'button-primary'}" id="share-credential" type="button">${data.shared ? tr('إيقاف المشاركة', 'Stop sharing') : tr('تفعيل رابط التحقق', 'Enable verification link')}</button>${data.shared ? `<p class="verification-link"><a href="${esc(verifyUrl.href)}">${esc(verifyUrl.href)}</a></p>` : ''}</div>` : ''}`;
}

function enhanceCredential(data, publicView = false) {
  const card = root.querySelector('.credential-card'); if (!card) return;
  const f = credentialFacts(data, currentLanguage());
  card.querySelector('.credential-meta')?.insertAdjacentHTML('beforebegin', `<div class="credential-detail-grid"><span>${f.labels.course}<strong>${esc(f.title)}</strong></span><span>${f.labels.courses}<strong>${esc(f.courses ?? '—')}</strong></span><span>${f.labels.lessons}<strong>${esc(f.lessons ?? '—')}</strong></span><span>${f.labels.score}<strong dir="ltr">${esc(f.score ?? '—')}</strong></span><span class="credential-topics">${f.labels.topics}<strong>${esc(f.topics)}</strong></span></div>`);
  if (data.status === 'active') card.insertAdjacentHTML('afterend', `<div class="assessment-card credential-downloads"><div><h2>${tr('تنزيل الشهادة', 'Download certificate')}</h2><p>${tr('ملف باسمك الحالي وبيانات المسار والامتحان. تحقّق من حالتها دائماً عبر المعرّف.', 'A copy with your name, path and exam details. Verify its current status using the ID.')}</p></div><div class="credential-download-actions"><button class="button button-primary" data-download="pdf" type="button">PDF ↓</button><button class="button button-outline" data-download="png" type="button">PNG ↓</button><button class="button button-outline" data-download="jpeg" type="button">JPEG ↓</button></div></div>`);
  if (!publicView && user() && fullName(user().name) && user().name !== data.holderName) {
    card.insertAdjacentHTML('afterend', `<div class="assessment-card credential-correction"><h2>${tr('الاسم على الشهادة قديم', 'Certificate name needs updating')}</h2><p>${tr('اسم حسابك الحالي:', 'Current account name:')} <strong>${esc(user().name)}</strong>. ${tr('تحديث الشهادة يحافظ على معرّفها ونتيجة الامتحان.', 'Updating the certificate keeps its ID and exam result.')}</p><button class="button button-outline" id="correct-credential-name" type="button">${tr('استخدم اسمي الكامل الحالي', 'Use my current full name')}</button></div>`);
  }
}

let shownCredential;
function showCredential(data, publicView = false) { shownCredential = data; root.innerHTML = frame(credentialCard(data, publicView)); enhanceCredential(data, publicView); }

async function refreshCredential() {
  const id = new URLSearchParams(location.search).get('id');
  if (id) {
    if (!/^c_[a-f0-9]{32}$/.test(id)) { notice(tr('رابط غير صحيح', 'Invalid link'), tr('تحقق من رابط الإنجاز.', 'Check the credential link.')); return; }
    notice(tr('التحقق من الإنجاز…', 'Verifying credential…'), tr('نقرأ الحالة مباشرة من Biuret Academy.', 'Reading the current state from Biuret Academy.'));
    try {
      const response = await fetch(`https://fra.cloud.appwrite.io/v1/tablesdb/6aa56477002e28054068/tables/6ab93416002801b57b3f/rows/${id}`, { headers: { 'X-Appwrite-Project': '6aa55a88003959a536e9' }, cache: 'no-store' });
      if (!response.ok) throw new Error(tr('لم نجد إنجازاً عاماً بهذا الرابط، أو أوقف صاحبه المشاركة.', 'No public credential was found at this link, or its owner stopped sharing.'));
      const row = await response.json();
      const data = JSON.parse(row.payload);
      if (!((data.version === 'foundations-v1' && data.pathId === 'foundations') || (data.version === 'program-path-v1' && ['path_pentest', 'path_soc', 'path_dfir', 'path_cloud', 'path_grc'].includes(data.pathId)))) throw new Error(tr('بيانات الإنجاز غير صحيحة.', 'Credential data is invalid.'));
      showCredential({ ...data, id }, true);
    } catch (error) { notice(tr('تعذر التحقق', 'Verification unavailable'), errorMessage(error)); }
    return;
  }
  if (!user()) { notice(tr('سجّل الدخول لعرض إنجازك', 'Sign in to view your credential'), tr('يظهر إثبات الإنجاز بعد اجتياز الامتحان النهائي.', 'Your credential appears after you pass the final exam.'), `<a class="button button-outline" href="exam.html">${tr('انتقل إلى الامتحان', 'Go to exam')} ↗</a>`); return; }
  notice(tr('تحميل إثبات الإنجاز…', 'Loading credential…'), tr('نتحقق من النتيجة المحفوظة.', 'Checking your saved result.'));
  try { credential = await loadCredential(); showCredential(credential); }
  catch { notice(tr('لا يوجد إثبات إنجاز بعد', 'No credential yet'), tr('أكمل الدروس واجتز الامتحان لفتح هذه الصفحة.', 'Complete the lessons and pass the exam to unlock this page.'), `<a class="button button-primary" href="exam.html">${tr('افتح الامتحان', 'Open exam')} ↗</a>`); }
}

root.addEventListener('click', async (event) => {
  if (event.target.closest('#exam-signin')) document.querySelector('#account-button')?.click();
  if (event.target.closest('#assessment-retry')) refreshExam();
  const shareButton = event.target.closest('#share-credential');
  const download = event.target.closest('[data-download]');
  if (download && shownCredential) { download.disabled = true; try { await downloadCredential(shownCredential, currentLanguage(), download.dataset.download); } catch (error) { alert(errorMessage(error)); } finally { download.disabled = false; } }
  if (event.target.closest('#correct-credential-name') && !busy) {
    busy = true;
    try { credential = await correctCredentialName(); showCredential(credential); }
    catch (error) { alert(errorMessage(error)); }
    finally { busy = false; }
  }
  if (shareButton && !busy) {
    busy = true; shareButton.disabled = true;
    try { credential = await shareCredential(!credential.shared); showCredential(credential); }
    catch (error) { shareButton.disabled = false; alert(errorMessage(error)); }
    finally { busy = false; }
  }
});
root.addEventListener('submit', async (event) => {
  if (event.target.id !== 'exam-form' || busy) return;
  event.preventDefault();
  const answers = Object.fromEntries(new FormData(event.target).entries());
  for (const key of Object.keys(answers)) answers[key] = Number(answers[key]);
  busy = true; event.target.querySelector('button[type="submit"]').disabled = true;
  try { await submitExam(answers); await refreshExam(); }
  catch (error) { const box = root.querySelector('#exam-error'); if (box) { box.textContent = errorMessage(error); box.hidden = false; } event.target.querySelector('button[type="submit"]').disabled = false; }
  finally { busy = false; }
});
document.querySelector('#language-toggle')?.addEventListener('click', () => { applyLanguage(); if (isExam) { if (examState) renderExam(); else refreshExam(); } else refreshCredential(); });
window.addEventListener('biuret-auth-changed', () => { if (isExam) refreshExam(); else refreshCredential(); });
await loadUser().catch(() => null);
if (isExam) await refreshExam(); else await refreshCredential();
