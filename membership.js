import { loadUser, loadMembership, loadBilling } from './auth.js?v=20261005-reviews1';
import { currentLanguage } from './i18n.js?v=20261005-reviews1';
import { checkout, portal } from './billing-checkout.js?v=20261005-reviews1';

const root = document.querySelector('#membership-main');
let signedIn = false;
let state = null;
let loading = true;
let failed = false;
let billing = null;
let billingFailed = false;

const copy = { ar: { perMonth: 'شهرياً' }, en: { perMonth: 'per month' } };

function render() {
  if (!root) return;
  const c = copy[currentLanguage()];
  const ar = currentLanguage() === 'ar';
  const tr = (arabic, english) => ar ? arabic : english;
  const label = loading ? tr('جارٍ التحقق من الوصول…', 'Checking access…') : failed ? tr('تعذّر التحقق. حدّث الصفحة للمحاولة مجدداً.', 'Access unavailable. Refresh to retry.') : !signedIn ? tr('سجّل الدخول لتبدأ الأساسيات المجانية.', 'Sign in to start free Foundations.') : state?.admin ? tr('حساب الإدارة: كل المحتوى مفتوح.', 'Administrator: all content unlocked.') : ['plus', 'pro'].includes(state?.plan) ? tr('الوصول السابق محفوظ خلال الانتقال إلى شراء المسارات.', 'Existing access is preserved during the move to path purchases.') : tr('الأساسيات مجانية بالكامل لحسابك.', 'Foundations are completely free for your account.');
  root.innerHTML = `<section class="membership-hero reveal visible"><span class="section-kicker">BIURET / ${tr('الوصول والمشتريات', 'ACCESS & PURCHASES')}</span><h1>${tr('الأساسيات مجاناً.<br>تخصصك بحزمة واحدة.', 'Free Foundations.<br>One bundle for your specialty.')}</h1><p>${tr('لا تحتاج اشتراكاً شهرياً لبدء التعلم. أكمل الأساسيات مجاناً، ثم اختر مساراً يجمع دوراته وتدريباته وتقييمه وشهادة إكماله.', 'You do not need a monthly subscription to start. Complete Foundations for free, then choose a bundle with its courses, practice, assessment and completion certificate.')}</p></section><section class="membership-status panel"><span>${tr('وصول حسابك', 'Your account access')}</span><strong>${label}</strong></section><section class="membership-grid"><article class="membership-card panel"><span class="section-kicker">01 / ${tr('ابدأ', 'START')}</span><h2>${tr('الأساسيات', 'Foundations')}</h2><p class="membership-price">${tr('مجاني بالكامل', 'Completely free')}</p><ul><li>${tr('جميع دروس الأساسيات', 'All Foundations lessons')}</li><li>${tr('الكويزات والمختبرات والتحديات المرتبطة', 'Related quizzes, labs and challenges')}</li><li>${tr('التقييم العملي والامتحان وشهادة الإكمال', 'Practical assessment, exam and completion certificate')}</li></ul><a class="button button-primary" href="path.html?id=foundations">${tr('استكشف الأساسيات', 'Explore Foundations')} ↗</a></article><article class="membership-card panel"><span class="section-kicker">02 / ${tr('تخصص', 'SPECIALIZE')}</span><h2>${tr('شراء مسار', 'Buy a path')}</h2><p class="membership-price">${tr('دفعة واحدة', 'One-time purchase')}</p><ul><li>${tr('جميع الدورات المرتبطة بالمسار', 'All courses included in the path')}</li><li>${tr('التدريبات والمختبرات والتحديات في حزمة واحدة', 'Quizzes, labs and challenges in one bundle')}</li><li>${tr('الامتحان وشهادة الإكمال بعد النجاح', 'Exam and completion certificate after passing')}</li></ul><a class="button button-outline" href="paths.html">${tr('استكشف جميع المسارات', 'Explore all paths')} ↗</a></article><article class="membership-card panel"><span class="section-kicker">03 / ${tr('أثبت إنجازك', 'PROVE YOUR PROGRESS')}</span><h2>${tr('تعلّم على راحتك', 'Learn at your own pace')}</h2><p>${tr('متطلبات واضحة، وتقدم محفوظ، وشهادة تحمل اسمك الحقيقي وتفاصيل إنجازك عند النجاح.', 'Clear requirements, saved progress and a certificate in your real name with achievement details when you pass.')}</p><p>${tr('شهادة إكمال Biuret Academy توثق الإنجاز داخل المنصة؛ ليست اعتماداً مهنياً خارجياً.', 'A Biuret Academy completion certificate documents achievement on the platform; it is separate from external professional accreditation.')}</p><a class="button button-outline" href="progress.html">${tr('عرض تقدمي', 'View my progress')} ↗</a></article></section><p class="membership-note">${tr('شراء المسارات وربط ملكيتها بحسابك قيد الإعداد. الأسعار لم تحدد بعد، ولا توجد رسوم أو عملية شراء متاحة في هذه المرحلة.', 'Path purchases and account ownership are being prepared. Prices are not set yet, and no purchase or charge is available in this stage.')}</p>`;
  if ((billingFailed || (billing && !billing.enabled)) && state?.admin) {
    const notice = document.createElement('p'); notice.className = 'membership-note';
    notice.textContent = billingFailed ? (currentLanguage() === 'ar' ? 'تعذّر التحقق من الاشتراك التجريبي. حدّث الصفحة للمحاولة مجدداً.' : 'Test subscription status is unavailable. Refresh the page to retry.') : (currentLanguage() === 'ar' ? 'تجربة الدفع لم تجهز بعد؛ راجع إعدادات Sandbox في Appwrite.' : 'Test billing is not ready yet. Review the Sandbox configuration in Appwrite.');
    root.append(notice);
    console.warn('Sandbox setup incomplete:', (billing?.setupMissing || []).join(', '));
  }
  if (billing?.enabled && state?.admin) {
    const sandbox = document.createElement('section'); sandbox.className = 'membership-principle panel';
    const statusLabels = currentLanguage() === 'ar' ? { active: 'نشط', trialing: 'فترة تجريبية', past_due: 'دفعة متأخرة', paused: 'متوقف مؤقتاً', canceled: 'ملغى' } : { active: 'Active', trialing: 'Trial', past_due: 'Past due', paused: 'Paused', canceled: 'Canceled' };
    const subscriptionStatus = statusLabels[billing.subscription?.status] || '';
    sandbox.innerHTML = `<span class="section-kicker">PADDLE / SANDBOX</span><h2>${currentLanguage() === 'ar' ? 'تجربة اشتراك الإدارة' : 'Administrator subscription test'}</h2><p>${currentLanguage() === 'ar' ? 'للاختبار فقط؛ لا توجد دفعات حقيقية ولا تتغير خطط المتعلمين.' : 'Testing only. No real payments and no changes to learner plans.'}</p><p>${billing.subscription ? `${billing.subscription.plan.toUpperCase()} · ${subscriptionStatus} · ${new Date(billing.subscription.currentPeriodEnd).toLocaleDateString(currentLanguage() === 'ar' ? 'ar' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : currentLanguage() === 'ar' ? 'لا يوجد اشتراك تجريبي بعد.' : 'No test subscription yet.'}</p><p>${billing.subscription?.cancelAt ? `${currentLanguage() === 'ar' ? 'الإلغاء مجدول في' : 'Cancellation scheduled for'} ${new Date(billing.subscription.cancelAt).toLocaleDateString(currentLanguage() === 'ar' ? 'ar' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}</p><div class="hero-actions">${billing.subscription ? `<button class="button button-outline" data-billing-portal>${currentLanguage() === 'ar' ? 'الإلغاء والفواتير وإدارة الاشتراك' : 'Manage subscription, cancellation and invoices'}</button>` : ['plus', 'pro'].map(plan => `<button class="button button-outline" data-billing-checkout="${plan}">${currentLanguage() === 'ar' ? 'اختبر' : 'Test'} ${plan.toUpperCase()} · $${plan === 'plus' ? 5 : 10}/${c.perMonth}</button>`).join('')}<button class="button button-text" data-billing-refresh>${currentLanguage() === 'ar' ? 'حدّث الحالة' : 'Refresh status'}</button></div><p id="billing-status" role="status"></p>`;
    root.append(sandbox);
    const status = sandbox.querySelector('#billing-status');
    sandbox.querySelectorAll('[data-billing-checkout]').forEach(button => button.addEventListener('click', async () => {
      const controls = sandbox.querySelectorAll('button'); controls.forEach(control => control.disabled = true);
      await checkout(button.dataset.billingCheckout, status); controls.forEach(control => control.disabled = false);
    }));
    sandbox.querySelector('[data-billing-portal]')?.addEventListener('click', () => portal(status));
    sandbox.querySelector('[data-billing-refresh]').addEventListener('click', refresh);
  }
}

async function refresh() {
  loading = true; failed = false; render();
  try {
    signedIn = Boolean(await loadUser());
    state = signedIn ? await loadMembership() : null;
    billing = null; billingFailed = false;
    if (state?.admin) {
      try { billing = await loadBilling(); } catch { billingFailed = true; }
    }
    if (state && (!['free', 'plus', 'pro'].includes(state.plan) || typeof state.access?.foundations !== 'boolean' || typeof state.access?.advancedLabs !== 'boolean' || typeof state.access?.coinEarning !== 'boolean')) throw new Error('Invalid membership response');
  } catch (error) { state = null; failed = true; console.warn('Membership unavailable:', error); }
  loading = false; render();
}

document.querySelector('#language-toggle')?.addEventListener('click', render);
window.addEventListener('biuret-auth-changed', refresh);
window.addEventListener('academy-billing-refresh', refresh);
refresh();
