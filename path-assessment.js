import { attachAssessmentProgress } from './assessment-ui.js?v=20261010-guide6';
import { user, loadUser, loadPathExam, submitPathExam, loadPathCredential, sharePathCredential, correctPathCredentialName } from './auth.js?v=20261010-guide6';
import { currentLanguage, setPageHeaderTitle } from './i18n.js?v=20261010-guide6';
import { credentialFacts, downloadCredential } from './credential-art.js?v=20261010-guide6';
import { fullName } from './full-name.js?v=20261010-guide6';

const root = document.querySelector('#path-assessment-main');
const pathId = new URLSearchParams(location.search).get('id');
const names = {
  path_pentest: ['مسار اختبار الاختراق', 'Penetration testing path'],
  path_soc: ['مسار محلل SOC', 'SOC analyst path'],
  path_dfir: ['مسار التحقيق الجنائي الرقمي', 'Digital forensics path'],
  path_cloud: ['مسار أمن السحابة', 'Cloud security path'],
  path_grc: ['مسار الحوكمة والمخاطر والامتثال', 'GRC path'],
  path_appsec: ['مسار أمن التطبيقات وDevSecOps', 'Application security and DevSecOps path'],
  path_mobile: ['مسار أمن تطبيقات الهاتف', 'Mobile application security path'],
  path_threat_intel: ['مسار استخبارات التهديدات وOSINT', 'Threat intelligence and OSINT path'],
  path_malware: ['مسار تحليل البرمجيات الخبيثة والهندسة العكسية', 'Malware analysis and reverse engineering path'],
};
const tr = (ar, en) => currentLanguage() === 'en' ? en : ar;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let status, credential, busy = false;

function frame(content) {
  const title = names[pathId] ? names[pathId][currentLanguage() === 'en' ? 1 : 0] : tr('امتحان التخصص', 'Specialty exam');
  root.innerHTML = `<section class="assessment-hero section-frame"><a class="learning-back" href="path.html?id=${encodeURIComponent(pathId)}">← ${tr('المسارات', 'Paths')}</a><span class="section-kicker">BIURET ACADEMY / PATH EXAM</span><h1>${esc(title)}</h1><p>${tr('أكمل دروس المسار وامتحانات دوراته وتقييمه العملي، ثم اجتز الامتحان النهائي لتحصل على إثبات إنجاز التخصص.', 'Complete the path lessons, course exams and practical assessment, then pass the final exam for your specialty credential.')}</p></section><section class="assessment-body section-frame">${content}</section>`;
  attachAssessmentProgress(root,status?.formId);
}

function date(value) { return new Date(value).toLocaleDateString(currentLanguage() === 'en' ? 'en-US' : 'ar', { year: 'numeric', month: 'long', day: 'numeric' }); }

function credentialCard(value) {
  const verify = new URL('certificate.html', location.href); verify.searchParams.set('id', value.id);
  return `<div class="credential-card ${value.status === 'active' ? '' : 'revoked'}"><div class="credential-head"><span class="section-kicker">BIURET / ACADEMY</span><span class="credential-seal" aria-hidden="true">✦</span></div><p class="credential-kind">${esc(names[pathId]?.[currentLanguage() === 'en' ? 1 : 0] || pathId)} / PROGRAM PATH</p><h2>${tr('شهادة إنجاز التخصص', 'Specialty certificate of achievement')}</h2><p>${tr('ممنوح إلى', 'Awarded to')}</p><strong class="credential-name">${esc(value.holderName)}</strong><div class="credential-rule"></div><p>${value.practicalScore ? tr('أكمل الدروس وامتحانات الدورات والتقييم العملي، ثم اجتاز امتحان المسار.', 'Completed lessons, course exams and the practical assessment, then passed the path exam.') : tr('أكمل دروس المسار واجتاز امتحانه بنتيجة لا تقل عن 8 من 10.', 'Completed the path lessons and passed its exam with at least 8 out of 10.')}</p><div class="credential-meta"><span>${tr('تاريخ الإصدار', 'Issued')}<strong>${esc(date(value.issuedAt))}</strong></span><span>${tr('المُصدر', 'Issuer')}<strong>Biuret Academy</strong></span></div><code dir="ltr">${esc(value.id)}</code></div><div class="assessment-card share-card"><h2>${tr('المشاركة بإذنك', 'Share with your permission')}</h2><p>${tr('عند تفعيل الرابط العام، يمكن لصاحب الرابط التحقق من اسمك وحالة إثباتك. تستطيع إيقاف المشاركة لاحقاً.', 'When you enable the public link, people with it can verify your display name and credential status. You can turn sharing off later.')}</p><button class="button ${value.shared ? 'button-outline' : 'button-primary'}" id="path-share" type="button">${value.shared ? tr('إيقاف المشاركة', 'Stop sharing') : tr('تفعيل رابط التحقق', 'Enable verification link')}</button>${value.shared ? `<p class="verification-link"><a href="${esc(verify.href)}">${esc(verify.href)}</a></p>` : ''}</div>`;
}

function enhanceCredential(value) {
  const card = root.querySelector('.credential-card'); if (!card) return;
  const f = credentialFacts(value, currentLanguage());
  card.querySelector('.credential-meta')?.insertAdjacentHTML('beforebegin', `<div class="credential-detail-grid"><span>${f.labels.course}<strong>${esc(f.title)}</strong></span><span>${f.labels.courses}<strong>${esc(f.courses ?? '—')}</strong></span><span>${f.labels.lessons}<strong>${esc(f.lessons ?? '—')}</strong></span><span>${f.labels.score}<strong dir="ltr">${esc(f.score ?? '—')}</strong></span><span class="credential-topics">${f.labels.topics}<strong>${esc(f.topics)}</strong></span></div>`);
  if (value.status === 'active') card.insertAdjacentHTML('afterend', `<div class="assessment-card credential-downloads"><div><h2>${tr('تنزيل الشهادة', 'Download certificate')}</h2><p>${tr('تضم اسمك الكامل ومعلومات المسار ونتيجة الامتحان.', 'Includes your full name, path details and exam score.')}</p></div><div class="credential-download-actions"><button class="button button-primary" data-download="pdf" type="button">PDF ↓</button><button class="button button-outline" data-download="png" type="button">PNG ↓</button><button class="button button-outline" data-download="jpeg" type="button">JPEG ↓</button></div></div>`);
  if (fullName(user()?.name) && user().name !== value.holderName) card.insertAdjacentHTML('afterend', `<div class="assessment-card credential-correction"><h2>${tr('الاسم على الشهادة قديم', 'Certificate name needs updating')}</h2><p>${tr('اسم حسابك الحالي:', 'Current account name:')} <strong>${esc(user().name)}</strong></p><button class="button button-outline" id="path-correct-name" type="button">${tr('استخدم اسمي الكامل الحالي', 'Use my current full name')}</button></div>`);
}

async function refresh() {
  if (!names[pathId]) { frame(`<div class="assessment-card"><h2>${tr('المسار غير موجود', 'Path not found')}</h2><a href="paths.html">${tr('عرض المسارات', 'View paths')} ↗</a></div>`); return; }
  setPageHeaderTitle({ ar: names[pathId][0], en: names[pathId][1] });
  if (!user()) await loadUser();
  if (!user()) { frame(`<div class="assessment-card"><h2>${tr('سجّل الدخول للمتابعة', 'Sign in to continue')}</h2><button class="button button-primary" id="path-signin" type="button">${tr('تسجيل الدخول', 'Sign in')}</button></div>`); return; }
  frame(`<div class="assessment-card"><h2>${tr('جارٍ تحميل المسار…', 'Loading path…')}</h2></div>`);
  try {
    status = await loadPathExam(pathId, currentLanguage());
    const progress = `<div class="assessment-card"><span class="section-kicker">PATH / PROGRESS</span><h2>${status.completedLessons} / ${status.requiredLessons} ${tr('دروس مكتملة', 'lessons completed')}</h2><p>${status.completedCourses} / ${status.requiredCourses} ${tr('امتحانات دورات مجتازة', 'course exams passed')} · ${status.practicalPassed ? tr('التقييم العملي مكتمل', 'practical passed') : tr('التقييم العملي ينتظر', 'practical pending')}</p><div class="library-sources">${status.categoryIds.map((order) => `<a href="course-exam.html?order=${order}">${tr('امتحان الدورة', 'Course exam')} ${order} ↗</a>`).join('')}</div><a class="button button-outline" href="courses.html">${tr('افتح الكورسات', 'Open courses')} ↗</a></div>`;
    if (status.passed) {
      credential = await loadPathCredential(pathId);
      frame(progress + credentialCard(credential));
      enhanceCredential(credential);
      return;
    }
    if (!status.access) { frame(`<div class="assessment-card"><h2>${tr('المسار يتطلب الأساسيات وخطة مناسبة', 'This path requires Foundations and an eligible plan')}</h2><p>${tr('أكمل امتحان الأساسيات، ثم تحقق من خطة عضويتك لفتح كورسات هذا التخصص.', 'Pass the Foundations exam, then check your membership to unlock these courses.')}</p><a class="button button-primary" href="membership.html">${tr('شاهد الخطط', 'View plans')} ↗</a></div>`); return; }
    if (!status.eligible) { frame(progress + (status.readyForPractical ? `<div class="assessment-card"><h2>${tr('خطوتك التالية: التقييم العملي', 'Next: practical assessment')}</h2><p>${tr('حلل ثلاث عينات تدريبية قبل فتح امتحان المسار.', 'Analyze three training samples before the path exam opens.')}</p><a class="button button-primary" href="practical.html?id=${encodeURIComponent(pathId)}">${tr('ابدأ التقييم العملي', 'Start practical assessment')} ↗</a></div>` : '')); return; }
    if (!status.questions) {
      const note = status.remaining ? `${tr('المحاولة التالية بعد', 'Next attempt after')} ${date(status.nextAt)}` : tr('استهلكت جميع المحاولات المتاحة.', 'All attempts have been used.');
      frame(progress + `<div class="assessment-card"><h2>${note}</h2><p>${status.remaining} / ${status.maxAttempts} ${tr('محاولات متبقية', 'attempts left')}</p></div>`);
      return;
    }
    const questions = status.questions.map((question, index) => `<fieldset><legend>${index + 1}. ${esc(question.question)}</legend>${question.options.map((option, optionIndex) => `<label><input type="radio" name="${esc(question.id)}" value="${optionIndex}" required><span>${esc(option)}</span></label>`).join('')}</fieldset>`).join('');
    frame(progress + `<div class="assessment-card"><h2>${tr('امتحان المسار', 'Path exam')}</h2><p>${tr(`10 أسئلة · النجاح من ${status.passScore}/10 · 3 محاولات مع انتظار 24 ساعة بين المحاولات.`,`10 questions · pass at ${status.passScore}/10 · 3 attempts with a 24-hour wait between attempts.`)}</p><p>${tr('النموذج ثابت عند تحديث الصفحة وتغيير اللغة. قد يتغير اختيار الحالات وترتيب الخيارات في محاولة لاحقة؛ راجع الأدلة بدلاً من حفظ رقم الخيار.','The form remains stable on refresh and language changes. Cases and option order may change on a later attempt; review evidence rather than memorize option numbers.')}</p><form id="path-exam-form" class="practice-form">${questions}<button class="button button-primary" type="submit">${tr('سلّم الامتحان', 'Submit exam')} ↗</button></form></div>`);
  } catch (error) { frame(`<div class="assessment-card"><h2>${tr('تعذر فتح الامتحان', 'Exam unavailable')}</h2><p>${esc(error.message)}</p><button class="button button-outline" id="path-retry" type="button">${tr('أعد المحاولة', 'Retry')}</button></div>`); }
}

root?.addEventListener('click', async (event) => {
  if (event.target.closest('#path-signin')) document.querySelector('#account-button')?.click();
  if (event.target.closest('#path-retry')) refresh();
  const download = event.target.closest('[data-download]');
  if (download && credential) { download.disabled = true; try { await downloadCredential(credential, currentLanguage(), download.dataset.download); } catch (error) { alert(error.message); } finally { download.disabled = false; } }
  if (event.target.closest('#path-correct-name') && !busy) {
    busy = true;
    try { credential = await correctPathCredentialName(pathId); refresh(); }
    catch (error) { alert(error.message); }
    finally { busy = false; }
  }
  if (event.target.closest('#path-share') && !busy) {
    busy = true;
    try { credential = await sharePathCredential(pathId, !credential.shared); refresh(); }
    catch (error) { alert(error.message); }
    finally { busy = false; }
  }
});

root?.addEventListener('submit', async (event) => {
  if (event.target.id !== 'path-exam-form') return;
  event.preventDefault(); if(busy)return; busy = true;
  const button = event.target.querySelector('button[type="submit"]'); button.disabled = true;
  try {
    const answers = Object.fromEntries([...new FormData(event.target)].map(([key, value]) => [key, Number(value)]));
    const result = await submitPathExam(pathId, answers, status.formId);
    if (result.passed) { await refresh(); return; }
    frame(`<div class="assessment-card"><h2>${tr('نتيجتك', 'Your score')}: ${result.score}/10</h2><p>${tr('راجع دروس المسار ثم حاول بعد انتهاء فترة الانتظار.', 'Review the path lessons, then retry after the cooldown.')}</p><button class="button button-outline" id="path-retry" type="button">${tr('عرض الحالة', 'View status')}</button></div>`);
  } catch (error) { button.disabled = false; alert(error.message); }
  finally { busy = false; }
});

document.querySelector('#language-toggle')?.addEventListener('click', () => setTimeout(refresh, 0));
window.addEventListener('biuret-auth-changed', refresh);
refresh();
