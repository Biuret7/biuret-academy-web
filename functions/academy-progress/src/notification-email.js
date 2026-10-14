// Dormant server-side integration. No public action dispatches email.
// Call only from a future private scheduled worker after provider setup.
import { createHash } from 'node:crypto';
import { cleanNotification, notificationHref } from './notifications.js';
const fields={'credential-ready':'credentialEmail','report-reviewed':'reviewEmail','weekly-summary':'weeklyEmail'};
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const emailMessageId=(owner,event)=>`m_${createHash('sha256').update(JSON.stringify([owner,event.type,event.reference])).digest('hex').slice(0,32)}`;
export function emailTemplate(value,language='ar') {
  const event=cleanNotification(value);if(!event)return null;
  const en=language==='en',href=`https://academy.biuret.dev/${notificationHref(event)}`;
  const copy={
    'credential-ready':en?['Your Biuret Academy certificate is ready','Your learning achievement is available in your account.','View certificate']:['شهادتك في Biuret Academy جاهزة','إثبات إنجازك متاح الآن داخل حسابك.','عرض الشهادة'],
    'report-reviewed':en?['Your Biuret Academy report has been reviewed','The review result and feedback are available in your account.','Read feedback']:['تمت مراجعة تقريرك في Biuret Academy','نتيجة المراجعة وملاحظات المراجع متاحة داخل حسابك.','قراءة الملاحظات'],
    'weekly-summary':en?['Your week at Biuret Academy',`${event.lessons} verified lessons · ${event.ctf} CTF challenges · ${event.xp} XP earned.`,'View progress']:['أسبوعك في Biuret Academy',`${event.lessons} دروس موثقة · ${event.ctf} تحديات CTF · ${event.xp} XP مكتسبة.`,'عرض التقدم']
  }[event.type];
  return {subject:copy[0],content:`<!doctype html><html lang="${en?'en':'ar'}" dir="${en?'ltr':'rtl'}"><body style="margin:0;background:#eef2f1;color:#15221c;font-family:Arial,sans-serif"><main style="max-width:560px;margin:24px auto;padding:28px;background:#fff;border:1px solid #b7c5bd;border-radius:16px"><p style="font-weight:bold;color:#385822">BIURET / ACADEMY</p><h1 style="font-size:24px">${escape(copy[0])}</h1><p style="line-height:1.8">${escape(copy[1])}</p><p><a href="${escape(href)}" style="color:#274e18;font-weight:bold">${escape(copy[2])} ↗</a></p><hr style="border:0;border-top:1px solid #d6dfd9"><p style="font-size:12px;line-height:1.8">${en?'You chose this email in your Academy account.':'اخترت استقبال هذا النوع من البريد في حسابك بالأكاديمية.'} <a href="https://academy.biuret.dev/account.html?screen=notifications">${en?'Manage email preferences':'تعديل تفضيلات البريد'}</a></p></main></body></html>`,html:true};
}
export function emailAdapter({base,request,preferences,enabled=false,providerReady=false,startedAt='',now=()=>new Date()}) {
  async function dispatch(owner,value) {
    if(!enabled || !providerReady)return {state:'disabled'};
    const event=cleanNotification(value),field=fields[event?.type];
    if(!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,35}$/.test(owner) || !event || !Number.isFinite(Date.parse(startedAt)))throw Error('Invalid email event');
    const prefs=await preferences(owner),stamp=Date.parse(event.occurredAt),current=now().getTime();
    if(!prefs[field] || !Number.isFinite(Date.parse(prefs.enabledAt?.[field])) || stamp<Math.max(Date.parse(startedAt),Date.parse(prefs.enabledAt[field])) || stamp>current || current-stamp>7*86400000)return {state:'skipped'};
    if(event.type==='weekly-summary' && event.lessons+event.ctf===0)return {state:'skipped'};
    const user=await request(`${base}/users/${owner}`);
    if(user.status!==200)throw Error('Email account lookup unavailable');
    if(user.data.$id!==owner || !user.data.status || !user.data.emailVerification || !user.data.email)return {state:'unverified'};
    const targetList=await request(`${base}/users/${owner}/targets?queries[]=${encodeURIComponent(JSON.stringify({method:'equal',attribute:'providerType',values:['email']}))}`);
    if(targetList.status!==200 || !Array.isArray(targetList.data.targets))throw Error('Email target lookup unavailable');
    const target=targetList.data.targets.find(x=>x.providerType==='email' && x.userId===owner && x.identifier===user.data.email && /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,35}$/.test(x.$id));
    if(!target)return {state:'target-missing'};
    // Recheck consent immediately before creating a message, including its language.
    const latest=await preferences(owner);
    if(!latest[field] || !Number.isFinite(Date.parse(latest.enabledAt?.[field])) || stamp<Date.parse(latest.enabledAt[field]))return {state:'skipped'};
    const messageId=emailMessageId(owner,event),template=emailTemplate(event,latest.language);
    let result=await request(`${base}/messaging/messages/email`,{method:'POST',body:JSON.stringify({messageId,...template,targets:[target.$id],users:[],topics:[],cc:[],bcc:[],draft:false})});
    if(result.status===409)result=await request(`${base}/messaging/messages/${messageId}`);
    if(![200,201].includes(result.status))throw Error('Email queue unavailable; retry the same event ID');
    const message=result.data;
    if(message.$id!==messageId || message.providerType!=='email' || message.targets?.length!==1 || message.targets[0]!==target.$id || message.users?.length || message.topics?.length || !['draft','processing','scheduled','sent','failed'].includes(message.status))throw Error('Email receipt mismatch');
    return {state:message.status,messageId};
  }
  return {dispatch};
}

// DST-aware local week boundaries for the future hourly private worker.
const local=value=>Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(value).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
function midnight(key) {
  const guess=Date.parse(`${key}T00:00:00Z`);
  for(let offset=1;offset<=4;offset++){const candidate=new Date(guess-offset*3600000),p=local(candidate);if(`${p.year}-${p.month}-${p.day}`===key && p.hour==='00')return candidate.toISOString();}
  throw Error('Jerusalem time boundary unavailable');
}
export function weeklyWindow(now=new Date()) {
  const p=local(now),key=`${p.year}-${p.month}-${p.day}`,day=new Date(`${key}T12:00:00Z`);
  if(day.getUTCDay()!==1 || Number(p.hour)<9)return null;
  day.setUTCDate(day.getUTCDate()-7);const start=day.toISOString().slice(0,10);
  return {reference:`week_${key}`,start:midnight(start),end:midnight(key)};
}
