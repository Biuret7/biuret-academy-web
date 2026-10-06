import { startBillingCheckout, openBillingPortal } from './auth.js?v=20261006-audit1';
import { currentLanguage } from './i18n.js?v=20261006-audit1';

let sdk;
let initialized = false;
const t = (ar, en) => currentLanguage() === 'ar' ? ar : en;
function loadSdk() {
  if (!sdk) sdk = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'; script.async = true;
    script.onload = () => window.Paddle ? resolve(window.Paddle) : reject(new Error('Checkout unavailable'));
    script.onerror = () => { sdk = null; script.remove(); reject(new Error('Checkout unavailable')); };
    document.head.append(script);
  });
  return sdk;
}
export async function checkout(plan, status) {
  status.textContent = t('جارٍ تجهيز الدفع التجريبي…', 'Preparing test checkout…');
  try {
    const Paddle = await loadSdk();
    const result = await startBillingCheckout(plan);
    if (result.environment !== 'sandbox' || !result.clientToken?.startsWith('test_') || !/^txn_[a-z0-9]{26}$/.test(result.transactionId)) throw new Error('Invalid checkout response');
    if (!initialized) {
      Paddle.Environment.set('sandbox');
      Paddle.Initialize({ token: result.clientToken, eventCallback: event => {
        if (event.name === 'checkout.completed') {
          status.textContent = t('اكتملت تجربة الدفع. جارٍ التحقق من الاشتراك على الخادم…', 'Test checkout completed. Verifying the subscription on the server…');
          window.dispatchEvent(new CustomEvent('academy-billing-refresh'));
        }
      } }); initialized = true;
    }
    Paddle.Checkout.open({ transactionId: result.transactionId, settings: { displayMode: 'overlay', theme: 'dark', locale: currentLanguage() } });
    status.textContent = t('هذه تجربة Sandbox؛ لا توجد رسوم حقيقية.', 'Sandbox test only. No real charges.');
  } catch {
    status.textContent = t('تعذّر فتح تجربة الدفع. تحقّق من إعداد الخادم والبريد الموثّق، أو أدر اشتراكك التجريبي الحالي.', 'Test checkout could not open. Check server setup and verified email, or manage your existing test subscription.');
  }
}
export async function portal(status) {
  status.textContent = t('جارٍ فتح إدارة الاشتراك التجريبي…', 'Opening test subscription management…');
  try {
    const result = await openBillingPortal();
    const url = new URL(result.url);
    if (url.protocol !== 'https:' || url.hostname !== 'sandbox-customer-portal.paddle.com') throw new Error('Invalid portal');
    window.location.assign(url.href);
  } catch {
    status.textContent = t('تعذّر فتح إدارة الاشتراك. حاول لاحقاً.', 'Subscription management is unavailable. Try again later.');
  }
}
