import test from 'node:test';
import assert from 'node:assert/strict';
import { reportReviewService, reportId, validateReport } from '../functions/academy-progress/src/report-review.js';
import handler from '../functions/academy-progress/src/main.js';

const learner = {$id:'review-learner',name:'Test Learner'}, reviewer = {$id:'review-admin',name:'Test Reviewer'};
const fields = {evidence:'Source A event 123 at 08:00Z is the relevant observation.',reasoning:'The observed event supports a limited hypothesis, not attribution.',limits:'No collection from host B, so the conclusion excludes host B.',retest:'Allow authorized account A; reject unauthorized account B and record results.'};
const input = (changes={}) => ({pathId:'path_soc',fields,language:'en',baseRevision:0,consent:true,...changes});
const decision = id => ({reportId:id,decision:'changes_requested',feedback:'Explain the missing source before broadening this conclusion.',scores:{evidence:1,reasoning:1,limits:2,retest:1}});
function fixture(table='reports-test') {
  const saved = new Map(), writes=[];
  const request = async (raw, options={}) => {
    const url=new URL(raw), id=url.pathname.split('/rows/')[1];
    if(options.method==='POST'){
      const body=JSON.parse(options.body);writes.push(body);
      if(saved.has(body.rowId))return{status:409,data:{}};
      const row={$id:body.rowId,...body.data,$permissions:body.permissions,$createdAt:new Date(1760000000000+saved.size*1000).toISOString()};saved.set(row.$id,row);return{status:201,data:row};
    }
    if(id)return saved.has(id)?{status:200,data:saved.get(id)}:{status:404,data:{}};
    let rows=[...saved.values()];
    const queries=url.searchParams.getAll('queries[]').map(JSON.parse);
    for(const q of queries){
      if(q.method==='equal')rows=rows.filter(r=>q.values.includes(r[q.attribute]));
      if(q.method==='orderDesc')rows.sort((a,b)=>a[q.attribute]<b[q.attribute]?1:a[q.attribute]>b[q.attribute]?-1:0);
      if(q.method==='cursorAfter')rows=rows.slice(rows.findIndex(r=>r.$id===q.values[0])+1);
    }
    rows=rows.slice(0,queries.find(q=>q.method==='limit')?.values[0]||25);
    return{status:200,data:{rows}};
  };
  return {service:reportReviewService({base:'https://test.invalid/v1',request,table}),saved,writes};
}
async function withAdmin(run){const old=process.env.ACADEMY_ADMIN_USER_IDS;process.env.ACADEMY_ADMIN_USER_IDS=reviewer.$id;try{await run();}finally{if(old===undefined)delete process.env.ACADEMY_ADMIN_USER_IDS;else process.env.ACADEMY_ADMIN_USER_IDS=old;}}
const status = code => e => e.status===code;

test('report field boundaries strip extra identity/grade values and reject invalid text',()=>{
  assert.deepEqual(validateReport({...fields,userId:'forged',grade:100}),fields);
  assert.equal(validateReport({...fields,evidence:'short'}),null);
  assert.equal(validateReport({...fields,evidence:'x'.repeat(4001)}),null);
  assert.equal(validateReport({...fields,evidence:'valid length but control\u0000'}),null);
  assert.equal(validateReport([]),null);
});
test('disabled reports retain local-draft state and reject writes',async()=>{
  const {service,writes}=fixture('');assert.deepEqual(await service.state(learner.$id,'path_soc'),{enabled:false,current:null,history:[]});
  await assert.rejects(service.submit(learner,input(),true),status(503));assert.equal(writes.length,0);
});
test('submission requires consent, readiness and bounded revision; saved copies are private and owned',async()=>{
  const {service,writes}=fixture();
  await assert.rejects(service.submit(learner,input({consent:false}),true),status(400));
  await assert.rejects(service.submit(learner,input(),false),status(403));
  await assert.rejects(service.submit(learner,input({baseRevision:20}),true),status(400));
  const state=await service.submit(learner,input({userId:'another'}),true);
  assert.equal(state.current.status,'pending');assert.equal(state.current.revision,1);assert.deepEqual(writes[0].permissions,[]);
  assert.equal(JSON.parse(writes[0].data.payload).userId,learner.$id);
  assert.equal((await service.state('another','path_soc')).current,null);
  assert.equal(JSON.stringify(state).includes('review-learner'),false);
  await assert.rejects(service.submit(learner,input({baseRevision:1}),true),status(409));
});
test('duplicate and simultaneous submissions reuse one immutable copy; conflicts cannot overwrite it',async()=>{
  const {service,saved}=fixture();const results=await Promise.all([service.submit(learner,input(),true),service.submit(learner,input(),true)]);
  assert.equal(results[0].current.id,results[1].current.id);assert.equal(saved.size,1);
  await service.submit(learner,input(),true);assert.equal(saved.size,1);
  await assert.rejects(service.submit(learner,input({fields:{...fields,evidence:fields.evidence+' changed'}}),true),status(409));
  assert.equal((await service.state(learner.$id,'path_soc')).current.fields.evidence,fields.evidence);
});
test('reviewer authorization and self-review prevention cover queue, detail and decisions',async()=>withAdmin(async()=>{
  const {service,writes}=fixture();const state=await service.submit(learner,input(),true);
  await assert.rejects(service.queue(learner),status(403));await assert.rejects(service.detail(learner,state.current.id),status(403));await assert.rejects(service.decide(learner,decision(state.current.id)),status(403));
  const own=await service.submit(reviewer,input(),true);await assert.rejects(service.decide(reviewer,decision(own.current.id)),status(403));
  assert.equal(writes.length,2);
}));
test('requested changes allow a new copy while preserving the original report and review audit',async()=>withAdmin(async()=>{
  const {service,saved,writes}=fixture();const first=(await service.submit(learner,input(),true)).current;
  const review=await service.decide(reviewer,decision(first.id));assert.equal(review.status,'changes_requested');
  const revised={...fields,evidence:fields.evidence+' Source B now confirms the boundary.'};
  const state=await service.submit(learner,input({baseRevision:1,fields:revised}),true);
  assert.equal(state.current.revision,2);assert.equal(state.current.status,'pending');assert.equal(state.history.length,2);
  assert.equal(state.history[1].review.feedback,decision(first.id).feedback);assert.deepEqual(state.history[1].fields,fields);
  assert.equal(JSON.stringify(state).includes('review-admin'),false);assert.equal(saved.size,3);assert.ok(writes.every(w=>w.permissions.length===0));
  await assert.rejects(service.decide(reviewer,{...decision(first.id),feedback:'A conflicting later decision on the old copy.'}),status(409));
  assert.equal((await service.detail(reviewer,first.id)).current,false);
}));
test('review scoring validates acceptance; duplicate decisions are idempotent and cannot replace audit',async()=>withAdmin(async()=>{
  const {service,saved}=fixture();const id=(await service.submit(learner,input(),true)).current.id;
  await assert.rejects(service.decide(reviewer,{...decision(id),decision:'accepted'}),status(400));
  await assert.rejects(service.decide(reviewer,{...decision(id),decision:'accepted',scores:{evidence:2,reasoning:2,limits:2,retest:0}}),status(400));
  const accepted={...decision(id),decision:'accepted',scores:{evidence:2,reasoning:2,limits:1,retest:1}};
  assert.equal((await service.decide(reviewer,accepted)).status,'accepted');await service.decide(reviewer,accepted);assert.equal(saved.size,2);
  await assert.rejects(service.decide(reviewer,{...accepted,feedback:'Different feedback cannot overwrite an existing audit.'}),status(409));
  await assert.rejects(service.submit(learner,input({baseRevision:1}),true),status(409));
}));
test('admin queue uses bounded pages and validates cursors, paths and report IDs',async()=>withAdmin(async()=>{
  const {service}=fixture();for(let i=0;i<11;i++)await service.submit({$id:`learner-${i}`,name:'Test Learner'},input(),true);
  const first=await service.queue(reviewer);assert.equal(first.items.length,10);assert.ok(first.nextCursor);
  const second=await service.queue(reviewer,first.nextCursor);assert.equal(second.items.length,1);assert.equal(second.nextCursor,null);
  await assert.rejects(service.queue(reviewer,'bad-cursor'),status(400));await assert.rejects(service.detail(reviewer,'bad-id'),status(400));await assert.rejects(service.state(learner.$id,'unknown'),status(404));
}));
test('handler rejects anonymous and unconfigured reviewer actions before any private lookup',async()=>withAdmin(async()=>{
  const old=globalThis.fetch;let authenticated=false, calls=0;
  globalThis.fetch=async()=>{calls++;return{status:authenticated?200:401,json:async()=>({$id:learner.$id,name:learner.name})};};
  const invoke=action=>handler({req:{headers:{'x-appwrite-user-jwt':'test','x-appwrite-key':'test'},bodyJson:{action}},res:{json:(body,status=200)=>({body,status})},error:()=>{}});
  try{assert.equal((await invoke('adminReportQueue')).status,401);authenticated=true;assert.equal((await invoke('adminReportQueue')).status,403);assert.equal(calls,2);}finally{globalThis.fetch=old;}
}));
