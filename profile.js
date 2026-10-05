import { user, loadUser, loadMembership, loadLearningRewards, loadExam } from './auth.js?v=20261005-forms1';
import { currentLanguage } from './i18n.js?v=20261005-forms1';
import { renderAvatar } from './identity.js?v=20261005-forms1';
const root = document.querySelector('#profile-main');
const tr = (ar, en) => currentLanguage() === 'ar' ? ar : en;
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let snapshot = {}, loading = true, sequence = 0;
const date = value => value ? new Intl.DateTimeFormat(currentLanguage() === 'ar' ? 'ar' : 'en', {dateStyle:'medium'}).format(new Date(value)) : '—';
function render() {
  if (!root || !user()) return;
  const person = user(), plan = snapshot.plan, rewards = snapshot.rewards, exam = snapshot.exam;
  root.innerHTML = `<section class="profile-hero"><span class="section-kicker">BIURET / ${tr('مساحتك الشخصية','YOUR PERSONAL SPACE')}</span><h1>${tr('ملفك. تعلّمك. إنجازك.','Your profile. Your learning. Your progress.')}</h1><p>${tr('حساب واحد يجمع هويتك في Biuret ورحلتك في الأكاديمية.','One account connects your Biuret identity and your Academy learning journey.')}</p></section>
  <section class="profile-identity"><span class="profile-avatar" data-profile-avatar aria-hidden="true"></span><div><span class="section-kicker">${tr('حسابك في BIURET','YOUR BIURET ACCOUNT')}</span><h2>${esc(person.name)}</h2><p><bdi dir="ltr">${esc(person.email)}</bdi></p><div class="profile-tags"><span>${person.emailVerification ? tr('البريد موثّق','Email verified') : tr('البريد غير موثّق','Email not verified')}</span><span>${plan?.admin ? tr('إدارة الأكاديمية','Academy administrator') : tr('متعلّم','Learner')}</span></div></div><div class="profile-actions"><button class="button button-outline" data-profile-edit>${tr('تعديل الاسم الكامل','Edit full name')}</button><a class="button button-text" href="https://biuret.dev/settings.html">${tr('الصورة وإعدادات الحساب','Photo and account settings')} ↗</a></div></section>
  <section class="profile-metrics" aria-label="${tr('ملخص تعلّمك','Your learning snapshot')}">${[[rewards?.level,tr('المستوى','Level')],[rewards?.xp,'XP'],[rewards?.awards?.length === undefined ? undefined : `${rewards.awards.length}/9`,tr('دروس الأساسيات الموثّقة','Verified Foundations lessons')],[rewards?.coins,tr('Biuret Coins','Biuret Coins')]].map(([value,label])=>`<article><strong dir="ltr">${value ?? '—'}</strong><span>${label}</span></article>`).join('')}</section>
  ${loading ? `<p role="status">${tr('جارٍ تحميل تقدمك الموثّق…','Loading verified progress…')}</p>` : snapshot.error ? `<div class="path-notice"><p>${tr('تعذّر تحميل بعض بيانات التعلّم. تفاصيل الحساب ظاهرة، ويمكنك إعادة المحاولة.','Some learning data could not be loaded. Your account details remain available; retry to update progress.')}</p><button class="button button-outline" data-profile-retry>${tr('أعد المحاولة','Retry')}</button></div>` : ''}
  <div class="profile-columns"><section class="profile-panel"><h2>${tr('تفاصيل الحساب','Account details')}</h2><dl>${[[tr('الاسم على الشهادات','Name on certificates'),person.name],[tr('عضو منذ','Member since'),date(person.$createdAt)],[tr('آخر وصول للحساب','Last account access'),date(person.accessedAt)],[tr('حالة الحساب','Account status'),person.status ? tr('نشط','Active') : tr('غير نشط','Inactive')],[tr('المصادقة المتعددة','Multi-factor authentication'),person.mfa ? tr('مفعّلة','Enabled') : tr('غير مفعّلة','Not enabled')],[tr('الوصول إلى المحتوى','Learning access'),plan?.admin ? tr('كل المحتوى مفتوح للإدارة','All content available to administrators') : tr('الأساسيات مجانية؛ المسارات حسب الوصول الموثّق','Free Foundations; paths follow verified access')]].map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><details><summary>${tr('معرّف الحساب','Account identifier')}</summary><code dir="ltr">${esc(person.$id)}</code></details><a class="profile-text-link" href="https://biuret.dev/account.html">${tr('افتح ملفك في موقع Biuret','Open your Biuret portfolio profile')} ↗</a></section>
  <section class="profile-panel"><span class="section-kicker">${tr('خطوتك القادمة','YOUR NEXT STEP')}</span><h2>${exam?.passed ? tr('اختر تخصصك القادم','Choose your next specialty') : tr('أكمل الأساسيات على راحتك','Continue Foundations at your own pace')}</h2><p>${tr('تقدّم واضح ومحفوظ، وتدريب يجهزك للتقييم العملي والامتحان.','A clear, saved route with practice that prepares you for the practical assessment and final exam.')}</p><a class="button button-primary" href="${exam?.passed ? 'paths.html' : 'path.html?id=foundations'}">${tr('تابع رحلة التعلّم','Continue your learning journey')} ↗</a><div class="profile-shortcuts">${[['progress.html',tr('تقدّمك وسجل الإنجاز','Progress and achievement history')],['certificate.html',tr('شهادة الأساسيات','Foundations certificate')],['paths.html',tr('مسارات التخصص','Specialty paths')],['membership.html',tr('الوصول والمشتريات','Access and purchases')],['notes.html',tr('ملاحظاتك','Your notes')],['review.html',tr('مراجعتك الذكية','Smart review')]].map(([href,label])=>`<a href="${href}">${label}<span aria-hidden="true">↗</span></a>`).join('')}</div></section></div>`;
  renderAvatar(root.querySelector('[data-profile-avatar]'), person);
}
async function refresh() {
  const version = ++sequence; loading = true; snapshot = {}; render();
  try {
    const person = user() || await loadUser(); if (!person || version !== sequence) return;
    render();
    const results = await Promise.allSettled([loadMembership(),loadLearningRewards(),loadExam()]);
    if (version !== sequence || user()?.$id !== person.$id) return;
    for (const [i,key] of ['plan','rewards','exam'].entries()) if(results[i].status==='fulfilled') snapshot[key]=results[i].value; else snapshot.error=true;
  } catch { if(version===sequence) snapshot.error=true; }
  if(version===sequence) { loading=false; render(); }
}
root?.addEventListener('click', event => { if(event.target.closest('[data-profile-edit]')) document.querySelector('#account-button').click(); if(event.target.closest('[data-profile-retry]')) refresh(); });
document.querySelector('#language-toggle')?.addEventListener('click',render);
window.addEventListener('biuret-auth-changed',refresh);
refresh();
