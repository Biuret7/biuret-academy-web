import {user,loadUser,loadNotifications,loadNotificationSummary,saveNotificationPreferences,readNotifications} from './auth.js?v=20261014-notify1';
import {currentLanguage,setPageHeaderTitle} from './i18n.js?v=20261014-notify1';
import {notificationCopy,notificationIcons} from './notification-model.js?v=20261014-notify1';
const root=document.querySelector('#notifications-main');
const text=(ar,en)=>currentLanguage()==='en'?en:ar;
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${notificationIcons[name] || notificationIcons.bell}</svg>`;
let owner=null,revision=0,state=null,draft=null,busy=false,notice='',failed=false,bell,bellCount=0,bellRevision=0;
const embedded=window.parent!==window;
function statusText(){const values={'load-failed':['تعذّر تحميل الإشعارات. حاول مجدداً.','Could not load notifications. Try again.'],read:['تم تعليم الإشعارات كمقروءة.','Notifications marked as read.'],'read-failed':['تعذّر حفظ حالة القراءة. أعد المحاولة.','Could not save read status. Retry.'],saved:['حُفظت اختياراتك. يمكنك تعديلها في أي وقت.','Your choices are saved. You can change them anytime.'],'save-failed':['تعذّر حفظ الاختيارات. بقيت تعديلاتك هنا؛ حاول مجدداً.','Could not save. Your edits are kept here; retry.']};return values[notice]?text(...values[notice]):'';}

const defaults=()=>({language:currentLanguage(),credentialEmail:false,reviewEmail:false,weeklyEmail:false});
function badge(unread=bellCount) {
  if(!bell)return;
  const count=Number.isSafeInteger(unread)&&unread>=0?unread:0;bellCount=count;
  bell.querySelector('.notification-badge').textContent=count>99?'99+':String(count);
  bell.querySelector('.notification-badge').hidden=!count;
  bell.setAttribute('aria-label',count?text(`الإشعارات، ${count} غير مقروءة`,`Notifications, ${count} unread`):text('الإشعارات','Notifications'));
  bell.title=text('إشعارات الأكاديمية','Academy notifications');
}
function render() {
  if(!root)return;
  setPageHeaderTitle('الإشعارات','Notifications');
  const heading=`<header class="notification-heading"><span class="section-kicker">ACADEMY / NOTIFICATIONS</span><h1>${text('مستجدات حسابك','Your account updates')}</h1><p>${text('شهاداتك وملاحظات المراجع في مكان واحد. اختر رسائل البريد التي تناسبك.','Your certificates and review feedback in one place. Choose the emails that suit you.')}</p></header>`;
  if(!user()){root.innerHTML=heading+`<section class="notification-empty">${icon('bell')}<h2>${text('سجّل الدخول لعرض إشعاراتك','Sign in to see your notifications')}</h2><p>${text('هذه المساحة مرتبطة بحسابك ولا تعرض بيانات أي متعلّم آخر.','This space belongs to your account.')}</p><button class="button button-primary" data-notification-signin>${text('تسجيل الدخول','Sign in')}</button></section>`;return;}
  if(!state){root.innerHTML=heading+`<section class="notification-empty" role="status"><h2>${failed?text('تعذّر تحميل الإشعارات','Notifications unavailable'):text('جارٍ تحميل إشعاراتك…','Loading your notifications…')}</h2>${failed?`<button class="button button-outline" data-notification-retry>${text('أعد المحاولة','Retry')}</button>`:''}</section>`;return;}
  const items=state.items.map(item=>({item,copy:notificationCopy(item,currentLanguage())})).filter(x=>x.copy);
  const toggle=(field,title,description)=>`<label class="notification-preference"><span><strong>${title}</strong><small>${description}</small></span><input name="${field}" type="checkbox" ${draft[field]?'checked':''} ${busy || !state.enabled?'disabled':''}><span class="notification-switch" aria-hidden="true"></span></label>`;
  root.innerHTML=heading+`<div class="notification-layout"><section class="notification-feed" aria-labelledby="notification-feed-title"><div class="notification-feed-heading"><h2 id="notification-feed-title">${text('آخر المستجدات','Latest updates')}</h2><button class="notification-text-button" data-notification-read-all ${busy || !items.some(x=>!x.item.read)?'disabled':''}>${text('تعليم المعروض كمقروء','Mark displayed as read')}</button></div>${!state.enabled?`<div class="notification-empty"><h3>${text('مركز الإشعارات قيد التجهيز','Notifications are being prepared')}</h3><p>${text('ستظهر هنا مستجدات إنجازاتك ومراجعة تقاريرك بعد اكتمال الربط.','Your achievement and report-review updates will appear here once setup is complete.')}</p></div>`:items.length?items.map(({item,copy})=>`<article class="notification-item ${item.read?'is-read':'is-unread'}"><span class="notification-item-icon">${icon(copy.icon)}</span><div><div class="notification-item-title"><h3>${copy.title}</h3>${item.read?'':`<span class="notification-new">${text('جديد','New')}</span>`}</div><p>${esc(copy.description)}</p><time datetime="${esc(item.occurredAt)}">${esc(new Intl.DateTimeFormat(currentLanguage()==='en'?'en':'ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(item.occurredAt)))}</time><div class="notification-item-actions"><a href="${esc(copy.href)}">${copy.action} ↗</a>${item.read?'':`<button class="notification-text-button" data-notification-read="${item.id}" ${busy?'disabled':''}>${text('تمت القراءة','Mark read')}</button>`}</div></div></article>`).join(''):`<div class="notification-empty">${icon('bell')}<h3>${text('لا توجد إشعارات جديدة بعد','No new notifications yet')}</h3><p>${text('ستظهر شهادة المسار الجاهزة ونتائج مراجعة التقارير هنا. تابع تعلّمك على راحتك.','New certificates and report-review decisions will appear here. Keep learning at your own pace.')}</p><a class="button button-outline" href="learn.html?screen=paths">${text('تابع تعلّمك','Continue learning')} ↗</a></div>`}${state.nextCursor?`<button class="button button-outline notification-more" data-notification-more ${busy?'disabled':''}>${text('عرض المزيد','Show more')}</button>`:''}</section><aside class="notification-settings"><span class="section-kicker">${text('على راحتك','ON YOUR TERMS')}</span><h2>${text('تفضيلات البريد','Email preferences')}</h2><p class="notification-provider-state">${state.emailReady?text('البريد متاح للمستخدمين الذين يختارونه ويؤكدون بريدهم.','Email is available to learners who opt in and verify their email.'):text('خدمة الإيميل لم تُربط بعد. يمكنك حفظ اختياراتك للمستقبل؛ الإرسال متوقف حالياً.','Email delivery is not connected yet. You can save your choices for later; sending is currently off.')}</p><form id="notification-preferences-form">${toggle('credentialEmail',text('الشهادة جاهزة','Certificate ready'),text('رسالة برابط شهادتك عند إصدارها.','An email linking to your certificate when it is issued.'))}${toggle('reviewEmail',text('نتيجة مراجعة التقرير','Report review result'),text('رسالة تخبرك أن ملاحظات المراجع متاحة في حسابك.','An email letting you know review feedback is available in your account.'))}${toggle('weeklyEmail',text('ملخص أسبوعي اختياري','Optional weekly summary'),text('الاثنين بعد 9 صباحاً بتوقيت القدس، عند وجود تعلّم موثّق خلال الأسبوع.','Monday after 9 a.m. Jerusalem time, when you have verified learning that week.'))}<label class="notification-language">${text('لغة رسائل البريد','Email language')}<select name="language" ${busy || !state.enabled?'disabled':''}><option value="ar" ${draft.language==='ar'?'selected':''}>العربية</option><option value="en" ${draft.language==='en'?'selected':''}>English</option></select></label><p class="notification-consent-copy">${text('تفعيل خيار يعني موافقتك على إرسال هذا النوع إلى بريد حسابك المؤكّد عند توفر الخدمة. تستطيع إيقافه من هنا. التفاصيل الخاصة للتقرير والشهادة تبقى داخل حسابك.','Enabling an option opts you into that email type at your verified account email once delivery is available. You can turn it off here. Private report and certificate details stay in your account.')}</p><button class="button button-primary" type="submit" ${busy || !state.enabled?'disabled':''}>${busy?text('جارٍ الحفظ…','Saving…'):text('حفظ تفضيلات البريد','Save email preferences')}</button></form><p class="notification-status" role="status">${esc(statusText())}</p></aside></div>`;
}
async function refresh(more=false) {
  const token=++revision,who=user()?.$id; if(!who){state=draft=null;render();return;}
  failed=false;busy=more; if(!more){state=null;render();}
  try{const next=await loadNotifications(more?state?.nextCursor:null);if(token!==revision || user()?.$id!==who)return;
    if(!Array.isArray(next.items) || !next.preferences || typeof next.enabled!=='boolean')throw Error('Invalid notifications');
    state=more?{...next,items:[...state.items,...next.items].filter((x,i,all)=>all.findIndex(y=>y.id===x.id)===i)}:next;
    if(!draft)draft=next.preferences.stored?{...next.preferences}:defaults();badge(state.unread);
  }catch{if(token!==revision || user()?.$id!==who)return;failed=true;notice='load-failed';}
  busy=false;render();
}
async function updateBell() {
  if(embedded)return;
  const token=++bellRevision,who=user()?.$id;
  if(!who){bell?.remove();bell=null;bellCount=0;return;}
  if(!bell){const host=document.querySelector('.nav-actions');if(!host)return;bell=document.createElement('a');bell.className='notifications-link';bell.href='account.html?screen=notifications';bell.innerHTML=icon('bell')+'<span class="notification-badge" hidden></span>';host.insertBefore(bell,document.querySelector('#account-button'));}
  badge();
  try{const result=await loadNotificationSummary();if(token===bellRevision && user()?.$id===who)badge(result.unread);}catch{if(token===bellRevision && user()?.$id===who)badge();}
}
root?.addEventListener('change',event=>{const input=event.target;if(draft && ['language','credentialEmail','reviewEmail','weeklyEmail'].includes(input.name)){draft[input.name]=input.type==='checkbox'?input.checked:input.value;notice='';}});
root?.addEventListener('click',async event=>{
  const target=event.target.closest('button');if(!target || target.disabled)return;
  if(target.hasAttribute('data-notification-signin'))return document.querySelector('#account-button')?.click();
  if(target.hasAttribute('data-notification-retry'))return refresh();
  if(target.hasAttribute('data-notification-more'))return refresh(true);
  const ids=target.dataset.notificationRead?[target.dataset.notificationRead]:target.hasAttribute('data-notification-read-all')?state?.items.filter(x=>!x.read).map(x=>x.id):null;
  if(!ids?.length)return;const who=user()?.$id,token=++revision;busy=true;render();
  try{for(let start=0;start<ids.length;start+=20){const batch=ids.slice(start,start+20),result=await readNotifications(batch);if(token!==revision || user()?.$id!==who)return;state.items=state.items.map(x=>batch.includes(x.id)?{...x,read:true}:x);state.unread=result.unread;badge(result.unread);if(embedded)window.parent.postMessage({channel:'biuret-notifications',type:'refresh'},location.origin);}notice='read';}
  catch{if(token!==revision || user()?.$id!==who)return;notice='read-failed';}busy=false;render();
});
root?.addEventListener('submit',async event=>{
  if(event.target.id!=='notification-preferences-form')return;event.preventDefault();if(busy || !state?.enabled)return;
  const who=user()?.$id,token=++revision,payload=Object.fromEntries(['language','credentialEmail','reviewEmail','weeklyEmail'].map(k=>[k,draft[k]]));busy=true;notice='';render();
  try{const result=await saveNotificationPreferences(payload);if(token!==revision || user()?.$id!==who)return;draft={...result.preferences};state.preferences=result.preferences;notice='saved';}
  catch{if(token!==revision || user()?.$id!==who)return;notice='save-failed';}busy=false;render();
});
function languageChanged(){badge(state?.unread ?? bellCount);render();}
new MutationObserver(languageChanged).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
window.addEventListener('biuret-auth-changed',()=>{if(owner!==user()?.$id){owner=user()?.$id || null;++revision;state=draft=null;notice='';busy=false;}updateBell();if(root)refresh();});
window.addEventListener('focus',()=>{if(!document.hidden)updateBell();});
window.addEventListener('message',event=>{if(!embedded && event.origin===location.origin && event.source===document.querySelector('#workspace-content')?.contentWindow && event.data?.channel==='biuret-notifications' && event.data.type==='refresh')updateBell();});
if(root || !embedded)loadUser().then(()=>{owner=user()?.$id || null;updateBell();if(root)refresh();}).catch(()=>{render();});
