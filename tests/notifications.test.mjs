import test from 'node:test';
import assert from 'node:assert/strict';
import {notificationService,notificationId,cleanNotification,defaults} from '../functions/academy-progress/src/notifications.js';
import {emailAdapter,emailTemplate,weeklyWindow} from '../functions/academy-progress/src/notification-email.js';
import {notificationCopy} from '../notification-model.js';
import handler from '../functions/academy-progress/src/main.js';
const startedAt='2026-10-14T00:00:00Z',now=()=>new Date('2026-10-14T10:00:00Z');
const event={type:'credential-ready',pathId:'foundations',reference:`c_${'a'.repeat(32)}`,occurredAt:'2026-10-14T09:00:00Z'};
const status=code=>error=>error.status===code;
function fixture(options={}) {
  const saved=new Map(),writes=[];
  const request=async(raw,options={})=>{
    const url=new URL(raw),rowId=url.pathname.split('/rows/')[1];
    if(options.method==='POST'){const body=JSON.parse(options.body);writes.push(body);if(saved.has(body.rowId))return {status:409,data:{}};const row={$id:body.rowId,...body.data,$permissions:body.permissions};saved.set(row.$id,row);return {status:201,data:row};}
    if(options.method==='PATCH'){const row=saved.get(rowId);if(!row)return {status:404,data:{}};writes.push(JSON.parse(options.body));Object.assign(row,JSON.parse(options.body).data);return {status:200,data:row};}
    if(rowId)return saved.has(rowId)?{status:200,data:saved.get(rowId)}:{status:404,data:{}};
    let rows=[...saved.values()];const queries=url.searchParams.getAll('queries[]').map(JSON.parse);
    for(const q of queries){if(q.method==='equal')rows=rows.filter(r=>q.values.includes(r[q.attribute]));if(q.method==='orderDesc')rows.sort((a,b)=>b[q.attribute].localeCompare(a[q.attribute]));if(q.method==='greaterThanEqual')rows=rows.filter(r=>r[q.attribute]>=q.values[0]);}
    const total=rows.length,cursor=queries.find(q=>q.method==='cursorAfter')?.values[0];if(cursor)rows=rows.slice(rows.findIndex(r=>r.$id===cursor)+1);
    return {status:200,data:{rows:rows.slice(0,queries.find(q=>q.method==='limit')?.values[0]||25),total}};
  };
  return {saved,writes,request,service:notificationService({base:'https://test.invalid/v1',request,table:'notifications-test',startedAt,now,...options})};
}
test('unconfigured notifications are empty with all email choices off and cannot write',async()=>{
  const {service,writes}=fixture({table:''});assert.equal((await service.state('learner')).enabled,false);assert.equal(defaults().weeklyEmail,false);await assert.rejects(service.save('learner',{}),status(503));assert.equal(writes.length,0);
});
test('preferences are private, separate per account and retain only explicit opted-in fields',async()=>{
  const {service,writes}=fixture();const input={language:'en',credentialEmail:true,reviewEmail:false,weeklyEmail:false};
  await assert.rejects(service.save('learner',{...input,userId:'other'}),status(400));
  const result=await service.save('learner',input);assert.equal(result.enabledAt.credentialEmail,now().toISOString());assert.deepEqual(writes[0].permissions,[]);
  assert.equal((await service.preference('other')).credentialEmail,false);await service.save('learner',{...input,credentialEmail:false});assert.deepEqual((await service.preference('learner')).enabledAt,{});
});
test('achievement events are private, idempotent and never expose names, reports, flags or email',async()=>{
  const {service,saved,writes}=fixture();await Promise.all([service.enqueue('learner',event),service.enqueue('learner',{...event,holderName:'private',feedback:'private',flag:'private',email:'private'})]);
  assert.equal(saved.size,1);assert.deepEqual(writes[0].permissions,[]);assert.equal(writes[0].data.payload.includes('private'),false);
  const state=await service.state('learner');assert.equal(state.unread,1);assert.equal(state.items[0].href,'account.html?screen=certificate');assert.equal((await service.state('other')).items.length,0);
  await assert.rejects(service.enqueue('learner',{...event,pathId:'path_soc'}),status(409));
});
test('historic events are skipped and invalid events or mixed-owner reads cannot mutate',async()=>{
  const {service,saved}=fixture();await service.enqueue('learner',{...event,occurredAt:'2026-10-13T10:00:00Z'});assert.equal(saved.size,0);
  assert.equal(cleanNotification({...event,pathId:'../secret'}),null);await service.enqueue('learner',event);await service.enqueue('other',event);
  const one=notificationId('learner',event.type,event.reference),two=notificationId('other',event.type,event.reference);
  await assert.rejects(service.markRead('learner',[one,two]),status(404));assert.equal(saved.get(one).read,false);
  await assert.rejects(service.state('learner',two),status(404));await assert.rejects(service.markRead('learner',[one,one]),status(400));
  assert.equal((await service.markRead('learner',[one])).unread,0);assert.equal(saved.get(two).read,false);
});
test('feed pagination remains scoped after 20 events and safe bilingual links ignore forged URLs',async()=>{
  const {service}=fixture();for(let i=0;i<22;i++)await service.enqueue('learner',{...event,reference:`c_${i.toString(16).padStart(32,'0')}`,occurredAt:`2026-10-14T09:${String(i).padStart(2,'0')}:00Z`});
  const first=await service.state('learner'),next=await service.state('learner',first.nextCursor);assert.equal(first.items.length,20);assert.equal(next.items.length,2);assert.equal(new Set([...first.items,...next.items].map(x=>x.id)).size,22);
  const item={...first.items[0],href:'https://evil.invalid'};assert.equal(notificationCopy(item,'en').href,'account.html?screen=certificate');assert.notEqual(notificationCopy(item,'en').title,notificationCopy(item,'ar').title);
});
test('notification routes require a signed-in account even for a forged user ID',async()=>{
  const response=await handler({req:{headers:{},bodyJson:{action:'notificationState',userId:'learner'}},res:{json:(body,code)=>({body,code})},error:()=>{}});assert.equal(response.code,401);
});
test('reconciliation recovers a new credential from an owned passed attempt, without historic backfill',async()=>{
  const f=fixture(),requests=[],credential={payload:JSON.stringify({pathId:'foundations',status:'active',issuedAt:event.occurredAt})};
  const service=notificationService({base:'https://test.invalid/v1',table:'notifications-test',startedAt,now,request:async(raw,options)=>{
    requests.push(raw);
    if(raw.includes('/6ab933b6001be5900662/rows?'))return {status:200,data:{rows:[{userId:'learner',payload:JSON.stringify({passed:true,credentialId:event.reference})}]}};
    if(raw.includes('/6ab93416002801b57b3f/rows/'))return {status:200,data:credential};
    // Share the independent fixture's notification storage through its request adapter.
    return f.request(raw,options);
  }});
  await service.reconcile('learner');assert.equal((await service.state('learner')).items.length,1);assert.ok(requests.some(x=>decodeURIComponent(x).includes('greaterThanEqual')));
  credential.payload=JSON.stringify({pathId:'foundations',status:'active',issuedAt:'2026-10-13T09:00:00Z'});
  await service.reconcile('learner');assert.equal((await service.state('learner')).items.length,1);
});
function emailFixture(changes={}){
  const calls=[],messages=new Map();let prefs={...defaults(),language:'en',credentialEmail:true,enabledAt:{credentialEmail:startedAt}};
  const request=async(url,options={})=>{
    calls.push({url,...options});
    if(url.endsWith('/users/learner'))return {status:200,data:{$id:'learner',status:true,emailVerification:true,email:'learner@example.test',...changes.user}};
    if(url.includes('/targets?'))return {status:200,data:{targets:[{$id:'verified-target',userId:'learner',providerType:'email',identifier:'learner@example.test'}]}};
    if(options.method==='POST'){const body=JSON.parse(options.body);if(messages.has(body.messageId))return {status:409,data:{}};const message={$id:body.messageId,...body,providerType:'email',status:'processing'};messages.set(body.messageId,message);return {status:201,data:message};}
    return {status:200,data:messages.get(url.split('/').at(-1))};
  };
  const adapter=emailAdapter({base:'https://test.invalid/v1',request,preferences:async()=>prefs,enabled:true,providerReady:true,startedAt,now,...changes});
  return {calls,messages,adapter,setPrefs:value=>prefs=value};
}
test('email adapter does no network work until provider and delivery are explicitly enabled',async()=>{
  for(const change of [{enabled:false},{providerReady:false}]){const f=emailFixture(change);assert.equal((await f.adapter.dispatch('learner',event)).state,'disabled');assert.equal(f.calls.length,0);}
});
test('email opt-out, pre-consent history, unverified account and empty weekly activity never queue',async()=>{
  const f=emailFixture();f.setPrefs(defaults());assert.equal((await f.adapter.dispatch('learner',event)).state,'skipped');assert.equal(f.calls.length,0);
  const future=emailFixture({preferences:async()=>({...defaults(),credentialEmail:true,enabledAt:{credentialEmail:now().toISOString()}})});assert.equal((await future.adapter.dispatch('learner',event)).state,'skipped');
  const unverified=emailFixture({user:{emailVerification:false}});assert.equal((await unverified.adapter.dispatch('learner',event)).state,'unverified');assert.equal(unverified.messages.size,0);
  const weekly=emailFixture({preferences:async()=>({...defaults(),weeklyEmail:true,enabledAt:{weeklyEmail:startedAt}})});assert.equal((await weekly.adapter.dispatch('learner',{type:'weekly-summary',reference:'week_2026-10-14',occurredAt:event.occurredAt,lessons:0,ctf:0,xp:0})).state,'skipped');
});
test('email retries reuse one target-bound message and processing is never reported as delivered',async()=>{
  const f=emailFixture();assert.equal((await f.adapter.dispatch('learner',event)).state,'processing');await f.adapter.dispatch('learner',event);assert.equal(f.messages.size,1);
  const body=JSON.parse(f.calls.find(c=>c.method==='POST').body);assert.deepEqual(body.targets,['verified-target']);assert.deepEqual(body.users,[]);assert.deepEqual(body.topics,[]);
  f.messages.values().next().value.targets=['wrong-target'];await assert.rejects(f.adapter.dispatch('learner',event),/receipt mismatch/);
});
test('email templates use authenticated Academy destinations and exclude raw private event fields',()=>{
  const template=emailTemplate({...event,holderName:'PRIVATE-NAME',feedback:'PRIVATE-REPORT',url:'https://evil.invalid'},'ar');assert.match(template.content,/dir="rtl"/);assert.equal(/PRIVATE|evil/.test(template.content),false);assert.match(template.content,/account.html\?screen=notifications/);assert.match(emailTemplate(event,'en').content,/dir="ltr"/);
});
test('weekly scheduler window is Monday after 9 Jerusalem time and handles the DST-change week',()=>{
  assert.equal(weeklyWindow(new Date('2026-10-19T05:59:00Z')),null);
  assert.deepEqual(weeklyWindow(new Date('2026-10-26T07:00:00Z')),{reference:'week_2026-10-26',start:'2026-10-18T21:00:00.000Z',end:'2026-10-25T22:00:00.000Z'});
  assert.equal(weeklyWindow(new Date('2026-10-27T10:00:00Z')),null);
});
