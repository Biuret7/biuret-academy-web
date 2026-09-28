import { loadUser, loadMembership } from './auth.js?v=20260928-1';
import { currentLanguage } from './i18n.js?v=20260928-1';

const root = document.querySelector('#membership-main');
let signedIn = false;
let state = null;
let loading = true;
let failed = false;

const copy = {
  ar: {
    eyebrow: 'BIURET ACADEMY / MEMBERSHIP', title: 'تعلّم بحرية. وتوسّع عندما تصبح جاهزاً.',
    intro: 'الأساسيات والتحديات والامتحان وإثبات الإنجاز متاحة للجميع. عضوية Pro ستضيف مختبرات ومشاريع أعمق عندما تصبح جاهزة.',
    yourPlan: 'عضويتك الحالية', guest: 'سجّل الدخول لعرض حالة عضويتك.', loading: 'جارٍ التحقق من العضوية…', failed: 'تعذّر التحقق من العضوية الآن. حاول تحديث الصفحة.',
    freeStatus: 'الخطة المجانية مفعّلة', proStatus: 'عضوية Pro مفعّلة', until: 'حتى', free: 'مجانية', pro: 'Pro', current: 'متاحة الآن', planned: 'قيد الإعداد',
    freePrice: 'مجاناً', perMonth: 'شهرياً', freeDesc: 'ابدأ المسار كاملاً واحتفظ بإنجازاتك الموثّقة.', proDesc: 'تجربة أعمق للمتعلم الذي يريد التطبيق المستمر.',
    freeItems: ['خارطة أساسيات الأمن السيبراني وتسعة دروس', 'التحديات اليومية والتمارين العملية', 'الامتحان النهائي وإثبات الإنجاز', 'XP ومستويات وعملات Biuret المكتسبة'],
    proItems: ['مختبرات أمنية تفاعلية متقدمة', 'مسارات ومشاريع تطبيقية أعمق', 'تتبّع تقدّم المشاريع داخل الحساب'],
    freeCta: 'ابدأ المسار المجاني ↗', proCta: 'الاشتراك سيفتح بعد اكتمال المختبرات والدفع',
    note: 'سعر Pro المخطط 9 دولارات شهرياً. لا توجد عملية شراء أو رسوم متكررة متاحة الآن. سنوضح الشروط النهائية قبل فتح الاشتراك.',
    principle: 'إنجازاتك لا تُباع', principleText: 'إكمال الدروس والامتحان وإثبات إنجاز الأساسيات لا يحتاج إلى عضوية مدفوعة. عملات Biuret منفصلة عن الدولار ولا تُصرف حالياً.',
  },
  en: {
    eyebrow: 'BIURET ACADEMY / MEMBERSHIP', title: 'Learn freely. Go deeper when you are ready.',
    intro: 'Foundations, challenges, the exam, and its achievement credential are open to everyone. Pro will add deeper labs and projects once they are ready.',
    yourPlan: 'Your current membership', guest: 'Sign in to view your membership status.', loading: 'Checking your membership…', failed: 'Membership status is unavailable. Refresh to try again.',
    freeStatus: 'Free plan active', proStatus: 'Pro membership active', until: 'until', free: 'Free', pro: 'Pro', current: 'Available now', planned: 'In development',
    freePrice: 'Free', perMonth: 'per month', freeDesc: 'Complete the path and keep your verified achievements.', proDesc: 'A deeper experience for learners who want to keep practicing.',
    freeItems: ['Cybersecurity Foundations roadmap and nine lessons', 'Daily challenges and practical exercises', 'Final exam and achievement credential', 'Earned XP, levels, and Biuret Coins'],
    proItems: ['Advanced interactive security labs', 'Deeper learning paths and hands-on projects', 'Project progress tracked in your account'],
    freeCta: 'Start the free path ↗', proCta: 'Subscriptions open when labs and billing are ready',
    note: 'The planned Pro price is USD 9 per month. No purchase or recurring charge is available yet. Final terms will be shown before subscriptions open.',
    principle: 'Your achievements are earned', principleText: 'Finishing the Foundations lessons and exam and earning its credential does not require a paid plan. Biuret Coins are separate from USD and cannot be spent yet.',
  },
};

function render() {
  if (!root) return;
  const c = copy[currentLanguage()];
  const plan = state?.plan === 'pro' ? 'pro' : 'free';
  const label = loading ? c.loading : failed ? c.failed : !signedIn ? c.guest : plan === 'pro' ? c.proStatus : c.freeStatus;
  const end = plan === 'pro' && state?.currentPeriodEnd ? ` · ${c.until} ${new Date(state.currentPeriodEnd).toLocaleDateString(currentLanguage() === 'ar' ? 'ar' : 'en-US')}` : '';
  root.innerHTML = `
    <section class="membership-hero reveal visible"><span class="section-kicker">${c.eyebrow}</span><h1>${c.title}</h1><p>${c.intro}</p></section>
    <section class="membership-status panel" aria-label="${c.yourPlan}"><span>${c.yourPlan}</span><strong>${label}${end}</strong></section>
    <section class="membership-grid" aria-label="${c.eyebrow}">
      <article class="membership-card panel"><span class="membership-kicker">01 / ${c.current}</span><h2>${c.free}</h2><p class="membership-price">${c.freePrice}</p><p>${c.freeDesc}</p><ul>${c.freeItems.map((item) => `<li>${item}</li>`).join('')}</ul><a class="button button-primary" href="paths.html#foundations-roadmap">${c.freeCta}</a></article>
      <article class="membership-card membership-pro panel"><span class="membership-kicker">02 / ${c.planned}</span><h2>${c.pro}</h2><p class="membership-price" dir="ltr">$9 <small>USD / ${c.perMonth}</small></p><p>${c.proDesc}</p><ul>${c.proItems.map((item) => `<li>${item}</li>`).join('')}</ul><span class="membership-unavailable">${c.proCta}</span></article>
    </section>
    <p class="membership-note">${c.note}</p>
    <section class="membership-principle panel"><span class="section-kicker">LEARN / EARN</span><h2>${c.principle}</h2><p>${c.principleText}</p></section>`;
}

async function refresh() {
  loading = true; failed = false; render();
  try {
    signedIn = Boolean(await loadUser());
    state = signedIn ? await loadMembership() : null;
    if (state && (!['free', 'pro'].includes(state.plan) || typeof state.access?.foundations !== 'boolean' || typeof state.access?.advancedLabs !== 'boolean')) throw new Error('Invalid membership response');
  } catch (error) { state = null; failed = true; console.warn('Membership unavailable:', error); }
  loading = false; render();
}

document.querySelector('#language-toggle')?.addEventListener('click', render);
window.addEventListener('biuret-auth-changed', refresh);
refresh();
