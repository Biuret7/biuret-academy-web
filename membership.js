import { loadUser, loadMembership, loadBilling } from './auth.js?v=20261004-ux1';
import { currentLanguage } from './i18n.js?v=20260929-1';
import { checkout, portal } from './billing-checkout.js?v=20261004-1';

const root = document.querySelector('#membership-main');
let signedIn = false;
let state = null;
let loading = true;
let failed = false;
let billing = null;
let billingFailed = false;

const copy = {
  ar: {
    eyebrow: 'BIURET ACADEMY / MEMBERSHIP', title: 'اختر العمق الذي يناسب رحلتك.',
    intro: 'يبدأ كل حساب جديد بخطة Free تلقائياً. أكمل الأساسيات وامتحانها أولاً، ثم اختر تخصصك. تحدد خطتك مقدار المحتوى الذي يمكنك فتحه.',
    yourPlan: 'عضويتك الحالية', guest: 'سجّل الدخول لعرض حالة عضويتك.', loading: 'جارٍ التحقق من العضوية…', failed: 'تعذّر التحقق من العضوية الآن. حاول تحديث الصفحة.',
    statuses: { free: 'خطة Free مفعّلة تلقائياً', plus: 'عضوية Plus مفعّلة', pro: 'عضوية Pro مفعّلة' }, admin: 'صلاحية الإدارة: جميع المحتويات مفتوحة', until: 'حتى',
    free: 'Free', plus: 'Plus', pro: 'Pro', available: 'متاحة الآن', planned: 'قيد الإعداد', featured: 'الأكثر شمولاً',
    freePrice: 'مجاناً', perMonth: 'شهرياً',
    freeDesc: 'بداية مرتبة ومحدودة دون دفع.', plusDesc: 'تخصصات وتطبيقات أكثر بقليل.', proDesc: 'الوصول الكامل لمكتبة التعلم والتطبيق.',
    freeItems: ['3 كورسات الأساسيات و9 دروس موثقة', 'امتحان الأساسيات وإثبات إنجازها', 'كورس تمهيدي واحد من البرنامج', 'مختبر تدريبي واحد و3 تحديات برنامج', '5 تحديات يومية أساسية', 'XP ومستويات؛ دون كسب عملات جديدة'],
    plusItems: ['كل ما في Free', '8 كورسات برنامج و8 اختبارات تدريبية', '4 مختبرات و8 تحديات برنامج', '10 أدلة أدوات و3 سيناريوهات عمليات', '10 تحديات يومية من المسارات الأساسية', '10 عملات Biuret لكل درس أساسي موثق جديد'],
    proItems: ['كل ما في Free وPlus', 'جميع كورسات البرنامج الـ18 ودروسه الـ99', 'المختبرات الثمانية وكل تحديات البرنامج الـ13', 'جميع الاختبارات التدريبية الـ12', 'جميع أدلة الأدوات الـ15 وسيناريوهات العمليات الستة', 'كل تحديات الأكاديمية اليومية الـ15', 'وصول غير محدود للمحتوى المنشور ضمن الخطة', 'كسب عملات Biuret من الدروس الأساسية الموثقة'],
    freeCta: 'ابدأ المسار المجاني ↗', plusCta: 'اشتراكات Plus ستفتح لاحقاً', proCta: 'اشتراكات Pro ستفتح لاحقاً',
    note: 'Plus بسعر مخطط 5 دولارات وPro بسعر مخطط 10 دولارات شهرياً. الدفع والاشتراك الجديد غير متاحين بعد؛ لن تُخصم أي رسوم الآن. صلاحيات العضويات المدفوعة المفعّلة مسبقاً تعمل وفق خطتها.',
    principle: 'طريقك قبل خطتك', principleText: 'تبدأ بدروس الأساسيات التسعة وامتحانها. بعدها تفتح مواد التخصص المتاحة حسب عضويتك. XP والمستويات متاحان للجميع عند إكمال الدروس الأساسية الموثقة، وعملات Biuret الجديدة لعضويتي Plus وPro فقط. العملات السابقة محفوظة ولا يمكن صرفها حالياً.',
  },
  en: {
    eyebrow: 'BIURET ACADEMY / MEMBERSHIP', title: 'Choose how deep you want to go.',
    intro: 'Every new account starts on Free automatically. Finish Foundations and its exam first, then choose a specialty. Your plan determines how much content opens.',
    yourPlan: 'Your current membership', guest: 'Sign in to view your membership status.', loading: 'Checking your membership…', failed: 'Membership status is unavailable. Refresh to try again.',
    statuses: { free: 'Free plan active automatically', plus: 'Plus membership active', pro: 'Pro membership active' }, admin: 'Administrator access: all content unlocked', until: 'until',
    free: 'Free', plus: 'Plus', pro: 'Pro', available: 'Available now', planned: 'In development', featured: 'Most complete',
    freePrice: 'Free', perMonth: 'per month',
    freeDesc: 'An ordered, limited start at no cost.', plusDesc: 'A little more depth and practice.', proDesc: 'Full access to the published learning library.',
    freeItems: ['3 Foundations courses and 9 verified lessons', 'Foundations exam and achievement credential', '1 introductory program course', '1 program lab and 3 program challenges', '5 core daily challenges', 'XP and levels; no new coin earnings'],
    plusItems: ['Everything in Free', '8 program courses and 8 practice quizzes', '4 program labs and 8 program challenges', '10 tool guides and 3 operations scenarios', '10 core daily challenges', '10 Biuret Coins per newly verified Foundations lesson'],
    proItems: ['Everything in Free and Plus', 'All 18 program courses and 99 lessons', 'All 8 program labs and 13 program challenges', 'All 12 program practice quizzes', 'All 15 tool guides and 6 operations scenarios', 'All 15 core daily challenges', 'Unlimited access to published content in the plan', 'Earn Biuret Coins from verified Foundations lessons'],
    freeCta: 'Start the free path ↗', plusCta: 'Plus subscriptions open later', proCta: 'Pro subscriptions open later',
    note: 'Planned monthly prices: Plus USD 5 and Pro USD 10. New subscriptions and payment are not available yet; no charge will be made now. Previously activated paid memberships retain their plan access.',
    principle: 'Your route comes first.', principleText: 'Begin with nine Foundations lessons and their exam. Then open specialty content included in your membership. XP and levels are available for verified Foundations lessons on every plan; new Biuret Coins require Plus or Pro. Earlier coins remain saved and cannot be spent yet.',
  },
};

function card(c, plan, position) {
  const paid = plan !== 'free';
  const price = paid ? `<span dir="ltr">$${plan === 'plus' ? 5 : 10}</span> <small>USD / ${c.perMonth}</small>` : c.freePrice;
  return `<article class="membership-card membership-${plan} panel">
    <div class="membership-card-top"><span class="membership-kicker">0${position} / ${paid ? c.planned : c.available}</span>${plan === 'pro' ? `<span class="membership-featured">${c.featured}</span>` : ''}</div>
    <h2>${c[plan]}</h2><p class="membership-price">${price}</p><p class="membership-description">${c[`${plan}Desc`]}</p>
    <ul>${c[`${plan}Items`].map((item) => `<li>${item}</li>`).join('')}</ul>
    ${paid ? `<span class="membership-unavailable">${c[`${plan}Cta`]}</span>` : `<a class="button button-primary" href="paths.html#foundations-roadmap">${c.freeCta}</a>`}
  </article>`;
}

function render() {
  if (!root) return;
  const c = copy[currentLanguage()];
  const plan = ['free', 'plus', 'pro'].includes(state?.plan) ? state.plan : 'free';
  const label = loading ? c.loading : failed ? c.failed : !signedIn ? c.guest : state?.admin ? c.admin : c.statuses[plan];
  const end = plan !== 'free' && state?.currentPeriodEnd ? ` · ${c.until} ${new Date(state.currentPeriodEnd).toLocaleDateString(currentLanguage() === 'ar' ? 'ar' : 'en-US')}` : '';
  root.innerHTML = `
    <section class="membership-hero reveal visible"><span class="section-kicker">${c.eyebrow}</span><h1>${c.title}</h1><p>${c.intro}</p></section>
    <section class="membership-status panel" aria-label="${c.yourPlan}"><span>${c.yourPlan}</span><strong>${label}${end}</strong></section>
    <section class="membership-grid" aria-label="${c.eyebrow}">${['free', 'plus', 'pro'].map((tier, index) => card(c, tier, index + 1)).join('')}</section>
    <p class="membership-note">${c.note}</p>
    <section class="membership-comparison" aria-label="${currentLanguage() === 'ar' ? 'مقارنة الخطط' : 'Compare plans'}"><table><thead><tr><th>${currentLanguage() === 'ar' ? 'ما الذي تفتحه خطتك؟' : 'What does your plan unlock?'}</th><th>Free</th><th>Plus · $5</th><th>Pro · $10</th></tr></thead><tbody>${[
      [currentLanguage() === 'ar' ? 'الأساسيات وامتحانها' : 'Foundations and its exam', '✓', '✓', '✓'],
      [currentLanguage() === 'ar' ? 'كورسات البرنامج' : 'Program courses', '1', '8', '18'],
      [currentLanguage() === 'ar' ? 'مختبرات تدريبية' : 'Practice labs', '1', '4', '8'],
      [currentLanguage() === 'ar' ? 'اختبارات تدريبية مستقلة' : 'Independent practice quizzes', '1', '8', '12'],
      [currentLanguage() === 'ar' ? 'تحديات البرنامج' : 'Program challenges', '3', '8', '13'],
      [currentLanguage() === 'ar' ? 'XP ومستويات' : 'XP and levels', '✓', '✓', '✓'],
      [currentLanguage() === 'ar' ? 'كسب عملات جديدة' : 'Earn new coins', '—', '✓', '✓'],
    ].map(row => `<tr>${row.map((cell, index) => `<${index ? 'td' : 'th'}>${cell}</${index ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table></section>
    <section class="membership-faq"><h2>${currentLanguage() === 'ar' ? 'قبل أن تختار' : 'Before you choose'}</h2>${(currentLanguage() === 'ar' ? [
      ['هل أحتاج اشتراكاً لأبدأ؟', 'لا. Free هي خطة كل حساب جديد تلقائياً، وتتيح الأساسيات وامتحانها وإثبات الإنجاز. لا تحتاج بطاقة لتبدأ.'],
      ['هل الدفع متاح الآن؟', 'إعداد الدفع حالياً على بيئة Paddle التجريبية فقط. الأسعار بالدولار شهرياً؛ الدفع الحقيقي غير مفعّل بعد.'],
      ['هل الاختبارات التدريبية تمنح شهادة؟', 'الاختبارات التدريبية للمراجعة. شهادة المسار تتطلب إكمال دروسه ومتطلباته العملية واجتياز امتحانه المنفصل.'],
      ['ماذا يحدث للعملات السابقة؟', 'يبقى رصيدك محفوظاً. Plus وPro تتيحان كسب عملات جديدة من الدروس الأساسية الموثقة. استخدام الرصيد في المتجر لم يفتح بعد.'],
    ] : [
      ['Do I need a subscription to begin?', 'No. Every account starts on Free, including Foundations, its exam and achievement credential. No card is required.'],
      ['Can I pay now?', 'Payment is currently being configured in Paddle Sandbox only. Prices are in USD per month; real payments are not enabled yet.'],
      ['Do practice quizzes award certificates?', 'Practice quizzes help you review. A path credential requires its lessons, practical requirements and a separate final exam.'],
      ['What happens to my earlier coins?', 'Your balance stays saved. Plus and Pro enable new coins from verified Foundations lessons. Spending coins in the shop is not available yet.'],
    ]).map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join('')}</section>
    <section class="membership-principle panel"><span class="section-kicker">LEARN / EARN</span><h2>${c.principle}</h2><p>${c.principleText}</p></section>`;
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
