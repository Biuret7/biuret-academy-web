import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { normalizedCaseTime, investigationRows, cleanInvestigation, investigationFindings, evidenceFileText, evidenceCsv, verifyEvidenceFile } from '../soc-investigation-model.js';
import { canInvestigateSoc, socCase, checkSocInvestigation } from '../functions/academy-progress/src/soc-investigation.js';
import { academyPaths as pathCatalog } from '../path-catalog-data.js';
import { pathAccess, resourceAccess } from '../path-model.js';
import handler from '../functions/academy-progress/src/main.js';

const privateAvailable = existsSync(new URL('../functions/academy-progress/soc-investigation-bank.private.json', import.meta.url));
const privateCase = privateAvailable ? JSON.parse(readFileSync(new URL('../functions/academy-progress/soc-investigation-bank.private.json', import.meta.url),'utf8')) : null;
const privateTest = { skip: privateAvailable ? false : 'Private case is supplied only in the function deployment' };
const plus = {plan:'plus'}, admin = {plan:'free',admin:true};
const status = n => e => e.status === n;
const file = {name:'endpoint.json',source:'endpoint',clockOffsetSeconds:120,rows:[{id:'E03',timestamp:'2026-10-01T09:05:15Z',host:'WS-17',actor:'service-sync',session:'S-402',event:'FILE_CREATED',detail:'Archive "training", collected',bytes:5242880}]};

test('case time correction, source/session/search filters and CSV preserve original evidence',async()=>{
  assert.equal(normalizedCaseTime(file.rows[0],file),'2026-10-01T09:03:15.000Z');
  const bundle={files:[file]};
  assert.equal(investigationRows(bundle,{source:'endpoint',session:'s-402',query:'training'})[0].id,'E03');
  assert.equal(investigationRows(bundle,{source:'proxy'}).length,0);
  assert.equal(file.rows[0].timestamp,'2026-10-01T09:05:15Z');
  assert.match(evidenceCsv(file),/Archive ""training"", collected/);
  assert.equal(evidenceFileText(file),JSON.stringify(file.rows,null,2)+'\n');
  const sha256=createHash('sha256').update(evidenceFileText(file)).digest('hex');
  assert.equal(await verifyEvidenceFile({...file,sha256}),true);
  assert.equal(await verifyEvidenceFile({...file,sha256,rows:[{...file.rows[0],bytes:0}]}),false);
});

test('analysis drafts reset on case version change and never treat blank numbers as zero',()=>{
  const value={version:'v1',evidenceIds:['E03','E03','invalid',17],timeline:'i04، a03; E03 P04, P05',outboundBytes:'',baselineMultiple:'20',scope:'session',conclusion:'needs-validation',userId:'someone',passed:true};
  const state=cleanInvestigation(value,'v1');
  assert.deepEqual(state.evidenceIds,['E03']);
  assert.deepEqual(investigationFindings(state).timeline,['I04','A03','E03','P04','P05']);
  assert.equal(investigationFindings(state).outboundBytes,null);
  assert.equal('passed' in state,false);assert.equal('userId' in state,false);
  assert.equal(cleanInvestigation(value,'v2').timeline,'');
  assert.equal(cleanInvestigation(null,'v1').source,'all');
});

test('SOC catalog link and server permission use the same SOC course requirements',()=>{
  const soc=pathCatalog.find(p=>p.id==='path_soc'), item=soc.labs.find(l=>l.socCase);
  assert.equal(item.href,'soc-investigation.html');
  assert.equal(pathCatalog.filter(p=>p.labs.some(l=>l.socCase)).length,1);
  for(const [membership,foundations,allowed] of [[null,true,false],[{plan:'free'},true,false],[plus,false,false],[plus,true,true],[{plan:'pro'},false,false],[admin,false,true]]){
    assert.equal(canInvestigateSoc(membership,foundations),allowed);
    const access=pathAccess(soc,membership,foundations);
    assert.equal(resourceAccess(soc,'lab',item,access,membership),allowed);
  }
  assert.throws(()=>socCase({plan:'free'},true),status(403));
});

test('authenticated case provides complete bilingual evidence and integrity without private grading keys',privateTest,async()=>{
  const ar=socCase(plus,true,'ar'),en=socCase(plus,true,'en');
  assert.notEqual(ar.title,en.title);assert.notEqual(ar.brief,en.brief);
  assert.equal(ar.files.length,6);assert.equal(ar.files.reduce((n,f)=>n+f.rows.length,0),33);
  assert.deepEqual(ar.files.map(f=>f.rows),en.files.map(f=>f.rows));
  for(const f of en.files)assert.equal(await verifyEvidenceFile(f),true);
  for(const key of ['solution','required','unrelated','timeline','feedback','answers'])assert.equal(key in en,false);
  assert.equal(en.practiceOnly,true);assert.equal('certificateEligible' in en,false);
});

function derivedFindings(bundle){
  const rows=investigationRows(bundle), uploads=rows.filter(r=>r.source==='proxy'&&r.session==='S-402'&&r.event==='UPLOAD'&&r.correctedTime>='2026-10-01T09:03:00.000Z'&&r.correctedTime<='2026-10-01T09:08:00.000Z');
  const outboundBytes=uploads.reduce((n,r)=>n+r.bytes,0);
  const timeline=rows.filter(r=>privateCase.solution.timeline.includes(r.id)).sort((a,b)=>a.correctedTime.localeCompare(b.correctedTime)).map(r=>r.id);
  return {evidenceIds:privateCase.solution.required,timeline,outboundBytes,baselineMultiple:outboundBytes/bundle.baselineBytes,scope:'session',conclusion:'needs-validation'};
}

test('case arithmetic excludes retries, duplicate application volume and approved neighboring sessions',privateTest,()=>{
  const bundle=socCase(plus,true,'en'),findings=derivedFindings(bundle);
  assert.equal(findings.outboundBytes,privateCase.solution.outboundBytes);assert.equal(findings.baselineMultiple,privateCase.solution.baselineMultiple);
  assert.deepEqual(findings.timeline,privateCase.solution.timeline);
  const rows=investigationRows(bundle);assert.ok(rows.find(r=>r.id==='E03').timestamp>rows.find(r=>r.id==='P04').timestamp);
  const checked=checkSocInvestigation(plus,true,{caseId:bundle.id,version:bundle.version,findings,language:'en'});
  assert.equal(checked.checked,5);assert.equal(checked.reportGraded,false);assert.equal(checked.certificateEligible,false);
  for(const key of ['xp','coins','passed','credential','awarded'])assert.equal(key in checked,false);
});

test('practice check detects broad NAT containment, unproven theft, clock errors and double-counted bytes',privateTest,()=>{
  const bundle=socCase(plus,true),valid=derivedFindings(bundle);
  const wrong={...valid,evidenceIds:[...valid.evidenceIds,privateCase.solution.unrelated[0]],timeline:[...valid.timeline].reverse(),outboundBytes:valid.outboundBytes*2,scope:'nat',conclusion:'confirmed-theft'};
  const checked=checkSocInvestigation(plus,true,{caseId:bundle.id,version:bundle.version,findings:wrong});
  assert.equal(checked.checked,0);assert.equal(Object.values(checked.checks).some(Boolean),false);
  assert.ok(Object.values(checked.feedback).every(s=>typeof s==='string'&&s.length>20));
});

test('case rejects stale forms, unknown evidence, invalid numbers and unauthorized checks',privateTest,()=>{
  const bundle=socCase(plus,true),findings=derivedFindings(bundle),input={caseId:bundle.id,version:bundle.version,findings};
  assert.throws(()=>checkSocInvestigation(plus,true,{...input,version:'stale'}),status(409));
  for(const changes of [{evidenceIds:['X99']},{timeline:['X99']},{outboundBytes:null},{outboundBytes:1.5},{baselineMultiple:Infinity},{scope:'forged'},{conclusion:'passed'}])assert.throws(()=>checkSocInvestigation(plus,true,{...input,findings:{...findings,...changes}}),status(400));
  assert.throws(()=>checkSocInvestigation(plus,true,null),status(400));
  assert.throws(()=>checkSocInvestigation({plan:'free'},true,input),status(403));
});

test('HTTP handler verifies account and denies client-supplied admin access without writes',async()=>{
  const priorFetch=globalThis.fetch,priorAdmins=process.env.ACADEMY_ADMIN_USER_IDS;let authenticated=false;const calls=[];
  process.env.ACADEMY_ADMIN_USER_IDS='case-admin';
  globalThis.fetch=async(url,options={})=>{calls.push({url,method:options.method||'GET'});return{status:String(url).endsWith('/account')?(authenticated?200:401):404,json:async()=>String(url).endsWith('/account')?{$id:'case-learner',name:'Case Learner'}:{}};};
  const invoke=action=>handler({req:{headers:{'x-appwrite-user-jwt':'synthetic','x-appwrite-key':'synthetic'},bodyJson:{action,admin:true,membership:admin}},res:{json:(body,status=200)=>({body,status})},error:()=>{}});
  try{
    assert.equal((await invoke('socCase')).status,401);assert.equal(calls.length,1);
    authenticated=true;assert.equal((await invoke('socCase')).status,403);
    assert.equal((await invoke('socCheck')).status,403);
    assert.ok(calls.every(c=>c.method==='GET'));
  }finally{globalThis.fetch=priorFetch;if(priorAdmins===undefined)delete process.env.ACADEMY_ADMIN_USER_IDS;else process.env.ACADEMY_ADMIN_USER_IDS=priorAdmins;}
});
