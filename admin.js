import { user, loadUser, academyAdminStatus, academyAdminCredential, academyAdminRevoke } from './auth.js?v=20260928-4';
import { currentLanguage, applyLanguage } from './i18n.js?v=20260928-6';

const root = document.querySelector('#admin-main');
const tr = (ar, en) => currentLanguage() === 'en' ? en : ar;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const errorText = (error, fallback) => ({
  'Credential not found': tr('لم يُعثر على إثبات الإنجاز.', 'Credential not found.'),
  'Invalid credential ID': tr('معرّف الإنجاز غير صالح.', 'Invalid credential ID.'),
  'Provide a reason of 12–500 characters': tr('اكتب سبباً من 12 إلى 500 حرف.', 'Provide a reason of 12–500 characters.'),
})[error?.message] || error?.message || fallback;
let ready = false;
let record = null;
let busy = false;
let message = '';

function render() {
  root.innerHTML = `<section class="assessment-hero section-frame"><a class="learning-back" href="index.html">← ${tr('الأكاديمية', 'Academy')}</a><span class="section-kicker">BIURET / CONTENT OPERATIONS</span><h1>${tr('إدارة الإنجازات', 'Credential operations')}</h1><p>${tr('ابحث بمعرّف الإنجاز قبل أي إجراء. يقتصر الإلغاء على الحسابات الإدارية المحددة في Appwrite.', 'Look up a credential ID before taking action. Revocation is limited to configured Appwrite administrator accounts.')}</p></section><section class="assessment-body section-frame">${!ready ? `<div class="assessment-card"><h2>${tr('وصول مقيّد', 'Restricted access')}</h2><p>${esc(message || tr('جارٍ التحقق من صلاحيتك…', 'Checking your access…'))}</p>${!user() ? `<button class="button button-primary" id="admin-signin" type="button">${tr('تسجيل الدخول', 'Sign in')} ↗</button>` : ''}</div>` : `<div class="assessment-card"><span class="section-kicker">CREDENTIAL / LOOKUP</span><h2>${tr('ابحث عن إثبات إنجاز', 'Find an achievement')}</h2><form id="lookup-form" class="admin-form"><label for="credential-id">${tr('معرّف الإنجاز', 'Credential ID')}</label><div class="admin-inline"><input id="credential-id" name="id" pattern="c_[a-f0-9]{32}" placeholder="c_..." value="${esc(record?.id || '')}" required><button class="button button-outline" type="submit">${tr('بحث', 'Search')} ↗</button></div></form></div>${record ? `<div class="assessment-card admin-result"><span class="section-kicker">${esc(record.status.toUpperCase())}</span><h2>${esc(record.holderName)}</h2><p>${tr('صدر في', 'Issued')} ${esc(new Date(record.issuedAt).toLocaleString(currentLanguage() === 'en' ? 'en' : 'ar'))} · ${record.shared ? tr('الرابط العام مفعل', 'Public link enabled') : tr('الرابط خاص', 'Private link')}</p>${record.shared ? `<p><a href="certificate.html?id=${encodeURIComponent(record.id)}" target="_blank" rel="noopener">${tr('افتح صفحة التحقق', 'Open verification page')} ↗</a></p>` : ''}${record.status === 'active' ? `<form id="revoke-form" class="admin-form"><label for="revoke-reason">${tr('سبب الإلغاء', 'Revocation reason')}</label><textarea id="revoke-reason" name="reason" minlength="12" maxlength="500" rows="4" required placeholder="${tr('دوّن السبب للمراجعة الداخلية؛ لا يظهر في الرابط العام.', 'Record the internal reason; it is not shown on the public link.')}"></textarea><p>${tr('الإلغاء دائم في هذا الإصدار، ويُسجّل باسم حسابك الإداري.', 'Revocation is permanent for this version and is logged under your administrator account.')}</p><button class="button button-danger" type="submit" ${busy ? 'disabled' : ''}>${tr('إلغاء إثبات الإنجاز', 'Revoke credential')}</button></form>` : `<p class="answer-feedback error">${tr('أُلغي هذا الإنجاز في', 'Revoked at')} ${esc(record.revokedAt ? new Date(record.revokedAt).toLocaleString(currentLanguage() === 'en' ? 'en' : 'ar') : '')}</p>`}</div>` : ''}${message ? `<p class="answer-feedback" role="status">${esc(message)}</p>` : ''}`}</section>`;
}

async function checkAccess() {
  record = null; ready = false; message = ''; render();
  await loadUser().catch(() => null);
  if (!user()) { message = tr('سجّل دخولك بحساب Biuret الإداري.', 'Sign in with your Biuret administrator account.'); render(); return; }
  try { await academyAdminStatus(); ready = true; message = ''; }
  catch { message = tr('هذا الحساب لا يملك صلاحية إدارة الإنجازات.', 'This account does not have credential administration access.'); }
  render();
}

async function lookup(form) {
  if (busy || !ready || !form?.reportValidity()) return;
  const id = form.querySelector('#credential-id').value.trim();
  message = ''; record = null; render();
  try { record = await academyAdminCredential(id); }
  catch (error) { message = errorText(error, tr('تعذر العثور على الإنجاز.', 'Credential lookup failed.')); }
  render();
}

root.addEventListener('click', (event) => {
  if (event.target.closest('#admin-signin')) document.querySelector('#account-button')?.click();
  const button = event.target.closest('#lookup-form button[type="submit"]');
  if (button) { event.preventDefault(); void lookup(button.closest('form')); }
});
root.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy || !ready) return;
  if (event.target.id === 'lookup-form') {
    await lookup(event.target);
  } else if (event.target.id === 'revoke-form' && record?.status === 'active') {
    const reason = event.target.querySelector('#revoke-reason').value.trim();
    if (!confirm(tr(`هل تريد إلغاء الإنجاز ${record.id} نهائياً؟`, `Permanently revoke credential ${record.id}?`))) return;
    busy = true; message = ''; render();
    try { record = await academyAdminRevoke(record.id, reason); message = tr('سُجل الإلغاء بنجاح.', 'Revocation recorded.'); }
    catch (error) { message = errorText(error, tr('تعذر تنفيذ الإلغاء.', 'Revocation failed.')); }
    finally { busy = false; render(); }
  }
});
document.querySelector('#language-toggle')?.addEventListener('click', () => { applyLanguage(); render(); });
window.addEventListener('biuret-auth-changed', checkAccess);
await checkAccess();
