import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {assessSupplier,supplierReport,assurancePractice} from '../assurance-model.js';
import {academyPaths} from '../path-catalog-data.js';
const root=new URL('../functions/academy-progress/',import.meta.url),rd=f=>JSON.parse(readFileSync(new URL(f,root),'utf8')),has=existsSync(new URL('learning-edition.private.json',root));
test('supplier review does not accept a fresh unrelated control or expiry-boundary decision',()=>{
 assert.equal(assessSupplier('wrong-scope').fresh,true);assert.equal(assessSupplier('wrong-scope').scopeMatches,false);assert.equal(assessSupplier('wrong-scope').decision,'open-gap');
 assert.equal(assessSupplier('expired').scopeMatches,true);assert.equal(assessSupplier('expired').activeDecision,false);assert.equal(assessSupplier('expired').decision,'open-gap');
 assert.equal(assessSupplier('supported').decision,'review-ready');for(const id of ['__proto__','constructor',null])assert.throws(()=>assessSupplier(id));
});
test('supplier exports recompute findings and omit identity and injected outcomes',()=>{
 const r=supplierReport({email:'secret@example.test',owner:'owner-secret',observations:['supported','supported','wrong-scope','__proto__'],reasoning:'a'.repeat(5000),results:[{decision:'all-safe'}]},'ar');
 assert.equal(r.results.length,2);assert.equal(r.results[1].decision,'open-gap');assert.equal(r.reasoning.length,4000);assert.doesNotMatch(JSON.stringify(r),/secret|all-safe/);
});
test('GRC bundle includes dedicated course, separate practice and both relevant desks',()=>{
 const path=academyPaths.find(p=>p.id==='path_grc');assert.deepEqual(path.courses.map(c=>c.order),[1,19,8]);
 assert.equal(path.courses.find(c=>c.order===19).lessonIds.length,6);assert.ok(path.quizzes.some(q=>q.index===12));
 assert.ok(path.labs.some(l=>l.href==='practice-lab.html?id=7&context=grc'));assert.ok(path.labs.some(l=>l.href==='practice-lab.html?id=7&context=supplier'));
 assert.equal(assurancePractice.course,'desktop-19');
});
test('new GRC teaching stays private, requires Foundations for Plus, and grades checkpoints server-side',{skip:!has},async()=>{
 const {publicLibraryFor,mayAccessLibrary,lessonCheckpoint}=await import('../functions/academy-progress/src/library.js');
 assert.equal(mayAccessLibrary('course',19,{plan:'plus'},false),false);assert.equal(mayAccessLibrary('course',19,{plan:'plus'},true),true);assert.equal(mayAccessLibrary('course',19,{plan:'free'},true),false);
 for(const lang of ['ar','en']){const free=publicLibraryFor(lang,{plan:'free'},true).categories.find(c=>c.order===19);for(const l of free.lessons)assert.equal(l.guide,undefined);
 const open=publicLibraryFor(lang,{plan:'plus'},true).categories.find(c=>c.order===19);for(const l of open.lessons){assert.ok(l.guide.concept.length>300);assert.equal(Object.hasOwn(l.guide.checkpoint,'answer'),false);const a=rd('learning-edition.private.json').lessons[l.id].checkpoint.answer;assert.equal(lessonCheckpoint(l.id,a).correct,true);assert.equal(lessonCheckpoint(l.id,(a+1)%4).correct,false);}}
});
test('GRC course exam requires all six lessons and records its current assessment edition',{skip:!has},async()=>{
 const {courseExamService,courseQuestions}=await import('../functions/academy-progress/src/course-exam.js');let payload;
 const request=async(url,o={})=>o.method==='POST'?(payload=JSON.parse(JSON.parse(o.body).data.payload),{status:201}):{status:404};
 const create=getRead=>courseExamService({base:'https://fixture.test',request,getRead,membership:{plan:'plus'},foundationsPassed:true});
 assert.equal((await create(async(u,id)=>id!=='grc-supplier').state('learner',19)).data.eligible,false);
 const service=create(async()=>true),state=await service.state('learner',19,'en');assert.equal(state.data.requiredLessons,6);assert.ok(state.data.questions.every(q=>!Object.hasOwn(q,'answer')&&!Object.hasOwn(q,'explanation')));
 const bank=courseQuestions(19,'ar','learner').questions,answers=Object.fromEntries(bank.map(q=>[q.id,q.answer]));assert.equal((await service.submit('learner',19,answers,state.data.formId)).data.passed,true);assert.equal(payload.assessmentEdition,'assurance-transfer-20261005');
});
test('new GRC requirements do not invalidate historical path passes or rewrite certificate counts',{skip:!has},async()=>{
 const {pathExamService,pathAttemptId}=await import('../functions/academy-progress/src/path-exam.js');const rows=new Map(),base='https://fixture.test',attempt=`${base}/tablesdb/6aa56477002e28054068/tables/6ab933b6001be5900662/rows/${pathAttemptId('old-user','path_grc',1)}`,id='c_'+'2'.repeat(32),cert=`${base}/tablesdb/6aa56477002e28054068/tables/6ab93416002801b57b3f/rows/${id}`;
 rows.set(attempt,{userId:'old-user',payload:JSON.stringify({version:'program-path-v1',credentialVersion:'program-path-v2',pathId:'path_grc',slot:1,score:9,passed:true,holderName:'Prior Learner',credentialId:id}),$createdAt:'2026-10-04T10:00:00Z'});
 rows.set(cert,{payload:JSON.stringify({version:'program-path-v2',pathId:'path_grc',holderName:'Prior Learner',status:'active',courseCount:2,lessonCount:14}),$permissions:[]});
 const request=async(url,o={})=>{if(o.method==='POST'){const b=JSON.parse(o.body),row={...b.data,$permissions:b.permissions};rows.set(`${url}/${b.rowId}`,row);return{status:201,data:row};}if(o.method==='PATCH'){const b=JSON.parse(o.body);rows.set(url,{...rows.get(url),...b.data,$permissions:b.permissions});return{status:200,data:rows.get(url)};}return rows.has(url)?{status:200,data:rows.get(url)}:{status:404};};
 const service=pathExamService({base,request,getRead:async()=>false,getCoursePassed:async()=>false,getPracticalPassed:async()=>true,membership:{plan:'plus'},foundationsPassed:true});
 const state=await service.state('old-user','path_grc');assert.equal(state.data.passed,true);assert.equal(state.data.questions,undefined);
 const shared=await service.share('old-user','path_grc',true);assert.equal(shared.data.courseCount,2);const corrected=await service.correctName('old-user','path_grc','Prior Fullname');assert.equal(corrected.data.lessonCount,14);assert.equal(corrected.data.courseCount,2);
 rows.delete(cert);const recovered=await service.credential('old-user','path_grc');assert.equal(recovered.data.courseCount,2);assert.equal(recovered.data.lessonCount,14);
});
test('new finals have private explanations and different artifacts from worked lesson examples',{skip:!has},()=>{
 const edition=rd('learning-edition.private.json'),banks=rd('course-exam-bank.private.json'),path=rd('path-exam-bank.private.json').path_grc,practice=rd('practice-quiz-bank.private.json').flat();
 const finals=[...banks[2],...banks[4],...banks[19],...path],taught=Object.values(edition.lessons);
 for(const q of finals)for(const lang of ['ar','en']){assert.ok(q.explanation[lang].length>20);assert.ok(q.question[lang].includes('\n'));assert.ok(!practice.some(p=>p.question[lang]===q.question[lang]));assert.ok(!taught.some(g=>q.question[lang].includes(g.artifact[lang])));}
});
