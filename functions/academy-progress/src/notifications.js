import { createHash } from 'node:crypto';

const DATABASE = '6aa56477002e28054068';
const ATTEMPTS = '6ab933b6001be5900662';
const CREDENTIALS = '6ab93416002801b57b3f';
const PATHS = ['foundations','path_pentest','path_soc','path_dfir','path_cloud','path_grc','path_appsec','path_mobile','path_threat_intel','path_malware'];
export const notificationId = (owner, type, reference) => `n_${createHash('sha256').update(JSON.stringify([owner,type,reference])).digest('hex').slice(0,32)}`;
const id = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,35}$/.test(value);
const date = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const failure = (message,status=503) => Object.assign(new Error(message),{status});
export const query = (method,attribute,values) => JSON.stringify({method,...(attribute?{attribute}:{}),...(values?{values}:{})});
export function defaults() { return {language:'ar',credentialEmail:false,reviewEmail:false,weeklyEmail:false,enabledAt:{},version:'academy-notifications-v1'}; }
export function cleanNotification(event) {
  if (!event || !PATHS.includes(event.pathId) && event.type !== 'weekly-summary') return null;
  if (!date(event.occurredAt)) return null;
  if (event.type === 'credential-ready' && /^c_[a-f0-9]{32}$/.test(event.reference || '')) {
    return {type:event.type,reference:event.reference,pathId:event.pathId,occurredAt:event.occurredAt};
  }
  if (event.type === 'report-reviewed' && /^s_[a-f0-9]{32}$/.test(event.reference || '') && ['accepted','changes_requested'].includes(event.decision)) {
    return {type:event.type,reference:event.reference,pathId:event.pathId,decision:event.decision,occurredAt:event.occurredAt};
  }
  if (event.type === 'weekly-summary' && /^week_\d{4}-\d{2}-\d{2}$/.test(event.reference || '') &&
    ['lessons','ctf','xp'].every(k=>Number.isSafeInteger(event[k]) && event[k]>=0 && event[k]<=1000000)) {
    return {type:event.type,reference:event.reference,occurredAt:event.occurredAt,lessons:event.lessons,ctf:event.ctf,xp:event.xp};
  }
  return null;
}
export function notificationHref(event) {
  if (!cleanNotification(event)) return null;
  if (event.type === 'weekly-summary') return 'account.html?screen=progress';
  if (event.type === 'credential-ready' && event.pathId === 'foundations') return 'account.html?screen=certificate';
  return `learn.html?screen=${event.type==='credential-ready'?'path-exam':'practical'}&path=${event.pathId}&id=${event.pathId}`;
}

export function notificationService({base,request,table=process.env.ACADEMY_NOTIFICATIONS_TABLE_ID || '',
  startedAt=process.env.ACADEMY_NOTIFICATIONS_STARTED_AT || '',emailEnabled=process.env.ACADEMY_EMAIL_ENABLED === 'true',
  reportsTable=process.env.ACADEMY_REPORTS_TABLE_ID || '',now=()=>new Date()}) {
  const enabled=id(table) && date(startedAt);
  const rows=`${base}/tablesdb/${DATABASE}/tables/${table}/rows`;
  const prefsId=owner=>`p_${createHash('sha256').update(owner).digest('hex').slice(0,32)}`;
  const ready=()=>{if(!enabled)throw failure('Notifications are being configured');};
  async function get(url) {
    const response=await request(url); if(response.status===404)return null;
    if(response.status!==200)throw failure('Notification lookup unavailable'); return response.data;
  }
  async function list(url,queries) {
    const response=await request(`${url}?${queries.map(x=>`queries[]=${encodeURIComponent(x)}`).join('&')}`);
    if(response.status!==200 || !Array.isArray(response.data.rows))throw failure('Notification list unavailable'); return response.data;
  }
  function decode(row,owner,kind) {
    if(row.userId!==owner || row.kind!==kind)throw failure('Notification ownership mismatch',404);
    try{return JSON.parse(row.payload);}catch{throw failure('Notification data unavailable');}
  }
  async function preference(owner) {
    if(!enabled)return {...defaults(),stored:false};
    const row=await get(`${rows}/${prefsId(owner)}`); if(!row)return {...defaults(),stored:false};
    const value=decode(row,owner,'preference');
    if(!value || !['ar','en'].includes(value.language) || ['credentialEmail','reviewEmail','weeklyEmail'].some(k=>typeof value[k]!=='boolean') || !value.enabledAt || typeof value.enabledAt!=='object')throw failure('Notification preferences unavailable');
    return {...defaults(),...value,stored:true};
  }
  async function save(owner,input) {
    ready();
    const fields=['language','credentialEmail','reviewEmail','weeklyEmail'];
    if(!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).some(k=>!fields.includes(k)) ||
      !['ar','en'].includes(input.language) || fields.slice(1).some(k=>typeof input[k]!=='boolean'))throw failure('Invalid notification preferences',400);
    const previous=await preference(owner),stamp=now().toISOString();
    const enabledAt=Object.fromEntries(fields.slice(1).filter(k=>input[k]).map(k=>[k,previous[k] && date(previous.enabledAt[k]) ? previous.enabledAt[k] : stamp]));
    const payload={...input,enabledAt,version:'academy-notifications-v1',updatedAt:stamp};
    const data={userId:owner,kind:'preference',occurredAt:stamp,read:true,payload:JSON.stringify(payload)};
    const result=await request(previous.stored?`${rows}/${prefsId(owner)}`:rows,{method:previous.stored?'PATCH':'POST',body:JSON.stringify(previous.stored?{data}:{rowId:prefsId(owner),data,permissions:[]})});
    if(result.status===409 && !previous.stored)throw failure('Preferences changed; reload before saving',409);
    if(![200,201].includes(result.status))throw failure('Could not save notification preferences');
    return {...payload,stored:true};
  }
  async function enqueue(owner,value) {
    if(!enabled)return null;
    const event=cleanNotification(value); if(!id(owner) || !event)throw failure('Invalid notification event',400);
    if(Date.parse(event.occurredAt)<Date.parse(startedAt))return null;
    const rowId=notificationId(owner,event.type,event.reference),existing=await get(`${rows}/${rowId}`);
    if(existing){const old=decode(existing,owner,'event');if(JSON.stringify(old)!==JSON.stringify(event))throw failure('Notification event conflict',409);return rowId;}
    const result=await request(rows,{method:'POST',body:JSON.stringify({rowId,data:{userId:owner,kind:'event',occurredAt:event.occurredAt,read:false,payload:JSON.stringify(event)},permissions:[]})});
    if(![201,409].includes(result.status))throw failure('Notification recording unavailable');
    if(result.status===409){const saved=await get(`${rows}/${rowId}`);if(!saved || JSON.stringify(decode(saved,owner,'event'))!==JSON.stringify(event))throw failure('Notification event conflict',409);}
    return rowId;
  }
  async function reconcile(owner) {
    if(!enabled)return;
    // Durable achievements remain authoritative if an earlier notification write failed.
    // Bounded newest pages, never arbitrary client-supplied events or historic bulk emails.
    const queries=[query('equal','userId',[owner]),query('greaterThanEqual','$createdAt',[startedAt]),query('orderDesc','$createdAt'),query('limit',null,[40])];
    const attempts=await list(`${base}/tablesdb/${DATABASE}/tables/${ATTEMPTS}/rows`,queries);
    for(const row of attempts.rows){
      if(row.userId!==owner)throw failure('Achievement ownership mismatch');
      let attempt;try{attempt=JSON.parse(row.payload);}catch{continue;}
      if(!attempt.passed || !/^c_[a-f0-9]{32}$/.test(attempt.credentialId || ''))continue;
      const credential=await get(`${base}/tablesdb/${DATABASE}/tables/${CREDENTIALS}/rows/${attempt.credentialId}`);
      if(!credential)continue;
      let record;try{record=JSON.parse(credential.payload);}catch{continue;}
      if(record.status==='active')await enqueue(owner,{type:'credential-ready',reference:attempt.credentialId,pathId:record.pathId || 'foundations',occurredAt:record.issuedAt});
    }
    if(id(reportsTable)){
      const reviews=await list(`${base}/tablesdb/${DATABASE}/tables/${reportsTable}/rows`,[...queries,query('equal','kind',['review'])]);
      for(const row of reviews.rows){
        if(row.userId!==owner || row.kind!=='review')throw failure('Report ownership mismatch');
        let review;try{review=JSON.parse(row.payload);}catch{continue;}
        await enqueue(owner,{type:'report-reviewed',reference:review.reportId,pathId:review.pathId,decision:review.decision,occurredAt:review.reviewedAt});
      }
    }
  }
  async function state(owner,cursor) {
    if(!enabled)return {enabled:false,emailReady:false,preferences:{...defaults(),stored:false},items:[],unread:0,nextCursor:null};
    if(cursor && !/^n_[a-f0-9]{32}$/.test(cursor))throw failure('Invalid notification cursor',400);
    if(cursor){const row=await get(`${rows}/${cursor}`);if(!row || row.userId!==owner || row.kind!=='event')throw failure('Notification not found',404);}
    const filters=[query('equal','userId',[owner]),query('equal','kind',['event'])];
    const [prefs,page,unread]=await Promise.all([preference(owner),list(rows,[...filters,query('orderDesc','occurredAt'),query('limit',null,[20]),...(cursor?[query('cursorAfter',null,[cursor])]:[])]),list(rows,[...filters,query('equal','read',[false]),query('limit',null,[1])])]);
    const items=page.rows.map(row=>{const event=cleanNotification(decode(row,owner,'event'));if(!event)throw failure('Notification data unavailable');return {id:row.$id,...event,read:row.read===true,href:notificationHref(event)};});
    return {enabled:true,emailReady:emailEnabled,preferences:prefs,items,unread:unread.total??unread.rows.length,nextCursor:items.length===20?items.at(-1).id:null};
  }
  async function summary(owner) {
    if(!enabled)return {enabled:false,unread:0};
    const result=await list(rows,[query('equal','userId',[owner]),query('equal','kind',['event']),query('equal','read',[false]),query('limit',null,[1])]);
    return {enabled:true,unread:result.total??result.rows.length};
  }
  async function markRead(owner,values) {
    ready();if(!Array.isArray(values) || values.length<1 || values.length>20 || new Set(values).size!==values.length || values.some(x=>!/^n_[a-f0-9]{32}$/.test(x)))throw failure('Invalid notification selection',400);
    // Check every owner before changing anything, including mixed-owner submissions.
    const records=await Promise.all(values.map(value=>get(`${rows}/${value}`)));
    if(records.some(row=>!row || row.userId!==owner || row.kind!=='event'))throw failure('Notification not found',404);
    for(const row of records.filter(x=>!x.read)){const result=await request(`${rows}/${row.$id}`,{method:'PATCH',body:JSON.stringify({data:{read:true}})});if(result.status!==200)throw failure('Could not mark notification read');}
    return summary(owner);
  }
  return {enabled,preference,save,enqueue,reconcile,state,summary,markRead};
}
