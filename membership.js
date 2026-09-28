import { loadUser, loadMembership } from './auth.js?v=20260928-2';
import { currentLanguage } from './i18n.js?v=20260928-1';

const root = document.querySelector('#membership-main');
let signedIn = false;
let state = null;
let loading = true;
let failed = false;

const copy = {
  ar: {
    eyebrow: 'BIURET ACADEMY / MEMBERSHIP', title: 'اختر العمق الذي يناسب رحلتك.',
    intro: 'ابدأ بالأساسيات مجاناً، وانتقل لاحقاً إلى Plus أو Pro عندما نفتح الاشتراكات. تقدمك وXP يبقيان مع حسابك في كل خطة.',
    yourPlan: 'عضويتك الحالية', guest: 'سجّل الدخول لعرض حالة عضويتك.', loading: 'جارٍ التحقق من العضوية…', failed: 'تعذّر التحقق من العضوية الآن. حاول تحديث الصفحة.',
    statuses: { free: 'الخطة المجانية مفعّلة', plus: 'عضوية Plus مفعّلة', pro: 'عضوية Pro مفعّلة' }, until: 'حتى',
    free: 'Free', plus: 'Plus', pro: 'Pro', available: 'متاحة الآن', planned: 'قيد الإعداد', featured: 'الأكثر شمولاً',
    freePrice: 'مجاناً', perMonth: 'شهرياً',
    freeDesc: 'الأساسيات الضرورية لتبدأ بثقة.', plusDesc: 'خطوة إضافية في التطبيق والمكافآت.', proDesc: 'تجربة كاملة لمن يريد التدريب بعمق.',
    freeItems: ['مسار الأساسيات ودروسه التسعة', 'XP ومستويات تقدّم موثقة', 'امتحان الأساسيات وإثبات الإنجاز'],
    plusItems: ['جميع مزايا Free', '10 عملات Biuret عند إكمال كل درس جديد', 'مهام تدريب أسبوعية إضافية', 'تحديات تطبيقية موسعة', 'لوحة أهداف تعلّم أسبوعية'],
    proItems: ['جميع مزايا Free وPlus', 'اكتساب عملات Biuret من الدروس', 'وصول غير محدود للمختبرات المتقدمة', 'مسارات أمن سيبراني تخصصية', 'مشاريع عملية مع مراحل واضحة', 'تحديات متقدمة وسيناريوهات واقعية', 'تتبّع تقدّم المشاريع داخل الحساب', 'تقييمات ومراجعات أعمق', 'إثباتات إنجاز للمسارات المتقدمة', 'مكتبة موارد وقوالب احترافية'],
    freeCta: 'ابدأ المسار المجاني ↗', plusCta: 'اشتراكات Plus ستفتح لاحقاً', proCta: 'اشتراكات Pro ستفتح لاحقاً',
    note: 'أسعار مخططة: Plus بسعر 5 دولارات وPro بسعر 10 دولارات شهرياً. المزايا الإضافية قيد التطوير، ولا يوجد شراء أو رسوم متكررة الآن. سنعرض الشروط النهائية قبل فتح الاشتراكات.',
    principle: 'XP للجميع، والعملات للأعضاء', principleText: 'تُمنح نقاط XP والمستويات عند إكمال الدروس في كل الخطط. بدءاً من هذا التحديث، لا يكسب حساب Free عملات Biuret جديدة؛ كسب العملات عند إكمال الدروس مخصص لعضويتي Plus وPro. العملات السابقة تبقى في السجل، وهي منفصلة عن الدولار ولا تُصرف حالياً.',
  },
  en: {
    eyebrow: 'BIURET ACADEMY / MEMBERSHIP', title: 'Choose how deep you want to go.',
    intro: 'Start Foundations for free, then move to Plus or Pro when subscriptions open. Your progress and XP stay with your account on every plan.',
    yourPlan: 'Your current membership', guest: 'Sign in to view your membership status.', loading: 'Checking your membership…', failed: 'Membership status is unavailable. Refresh to try again.',
    statuses: { free: 'Free plan active', plus: 'Plus membership active', pro: 'Pro membership active' }, until: 'until',
    free: 'Free', plus: 'Plus', pro: 'Pro', available: 'Available now', planned: 'In development', featured: 'Most complete',
    freePrice: 'Free', perMonth: 'per month',
    freeDesc: 'The essentials to get started with confidence.', plusDesc: 'More practice and lesson rewards.', proDesc: 'A complete experience for deeper practice.',
    freeItems: ['Nine lessons in the Foundations path', 'Verified XP and learning levels', 'Foundations exam and achievement credential'],
    plusItems: ['Everything in Free', '10 Biuret Coins for each newly completed lesson', 'Extra weekly practice missions', 'Expanded hands-on challenges', 'Weekly learning goals dashboard'],
    proItems: ['Everything in Free and Plus', 'Earn Biuret Coins from lessons', 'Unlimited access to advanced labs', 'Specialist cybersecurity paths', 'Practical projects with clear milestones', 'Advanced challenges and realistic scenarios', 'Project progress tracked in your account', 'Deeper assessments and reviews', 'Achievement credentials for advanced paths', 'Professional resource and template library'],
    freeCta: 'Start the free path ↗', plusCta: 'Plus subscriptions open later', proCta: 'Pro subscriptions open later',
    note: 'Planned prices: Plus at USD 5 and Pro at USD 10 per month. Additional features are in development. There is no purchase or recurring charge yet; final terms will be shown before subscriptions open.',
    principle: 'XP for everyone. Coins for members.', principleText: 'Completing lessons earns XP and levels on every plan. From this update, Free accounts cannot earn new Biuret Coins; lesson coin rewards require Plus or Pro. Previously earned coins remain in the ledger. Coins are separate from USD and cannot be spent yet.',
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
  const label = loading ? c.loading : failed ? c.failed : !signedIn ? c.guest : c.statuses[plan];
  const end = plan !== 'free' && state?.currentPeriodEnd ? ` · ${c.until} ${new Date(state.currentPeriodEnd).toLocaleDateString(currentLanguage() === 'ar' ? 'ar' : 'en-US')}` : '';
  root.innerHTML = `
    <section class="membership-hero reveal visible"><span class="section-kicker">${c.eyebrow}</span><h1>${c.title}</h1><p>${c.intro}</p></section>
    <section class="membership-status panel" aria-label="${c.yourPlan}"><span>${c.yourPlan}</span><strong>${label}${end}</strong></section>
    <section class="membership-grid" aria-label="${c.eyebrow}">${['free', 'plus', 'pro'].map((tier, index) => card(c, tier, index + 1)).join('')}</section>
    <p class="membership-note">${c.note}</p>
    <section class="membership-principle panel"><span class="section-kicker">LEARN / EARN</span><h2>${c.principle}</h2><p>${c.principleText}</p></section>`;
}

async function refresh() {
  loading = true; failed = false; render();
  try {
    signedIn = Boolean(await loadUser());
    state = signedIn ? await loadMembership() : null;
    if (state && (!['free', 'plus', 'pro'].includes(state.plan) || typeof state.access?.foundations !== 'boolean' || typeof state.access?.advancedLabs !== 'boolean' || typeof state.access?.coinEarning !== 'boolean')) throw new Error('Invalid membership response');
  } catch (error) { state = null; failed = true; console.warn('Membership unavailable:', error); }
  loading = false; render();
}

document.querySelector('#language-toggle')?.addEventListener('click', render);
window.addEventListener('biuret-auth-changed', refresh);
refresh();
