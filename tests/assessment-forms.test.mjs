import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {assessmentForm,assessmentVariants} from '../functions/academy-progress/src/assessment-forms.js';
import {courseExamService,courseQuestions} from '../functions/academy-progress/src/course-exam.js';
import {pathExamService,pathQuestions} from '../functions/academy-progress/src/path-exam.js';
import {practicalDraft,practicalReport} from '../practical-report-model.js';
import {academyPaths} from '../path-catalog-data.js';
const root=new URL('../functions/academy-progress/',import.meta.url),read=name=>JSON.parse(readFileSync(new URL(name,root),'utf8'));
const has=existsSync(new URL('assessment-variants.private.json',root));
const key=questions=>Object.fromEntries(questions.map(q=>[q.id,q.answer]));
function fixture(){const rows=new Map();return{rows,request:async(url,o={})=>{
 if(o.method==='POST'){const b=JSON.parse(o.body),target=`${url}/${b.rowId}`;if(rows.has(target))return{status:409};const row={...b.data,$createdAt:new Date(Date.now()-25*3600000).toISOString(),$permissions:b.permissions};rows.set(target,row);return{status:201,data:row};}
 return rows.has(url)?{status:200,data:rows.get(url)}:{status:404};
}};}
test('local practical draft bounds fields and exports no identity, auto-grade or injected verdict',()=>{
 const value={evidence:'x'.repeat(5000),reasoning:'Scoped decision',limits:null,retest:42,email:'secret@example.test',grade:'passed',answers:{id:1},admin:true};
 const report=practicalReport(value,'path_soc','ar');assert.equal(report.evidence.length,4000);assert.equal(report.limits,'');assert.equal(report.retest,'');assert.equal(report.reviewStatus,'not-reviewed');assert.equal(report.practiceOnly,true);
 assert.doesNotMatch(JSON.stringify(report),/secret@example|passed|"answers"|"admin"/);assert.deepEqual(practicalDraft(null),{evidence:'',reasoning:'',limits:'',retest:''});assert.throws(()=>practicalReport({},'__proto__','en'));
});
test('new transfer cases cover remaining courses and paths, map to taught lessons and differ from formative banks',{skip:!has},()=>{
 const variants=read('assessment-variants.private.json'),library=read('desktop-library.en.private.json'),guides=read('learning-edition.private.json').lessons,practice=read('practice-quiz-bank.private.json').flat();
 assert.equal(Object.keys(variants.courses).length,16);assert.equal(Object.keys(variants.paths).length,8);
 for(const [kind,groups] of Object.entries({course:variants.courses,path:variants.paths}))for(const [id,items]of Object.entries(groups)){
  const allowed=kind==='course'?library.categories.find(c=>c.order===Number(id)).lessons.map(l=>l.id):academyPaths.find(p=>p.id===id).courses.flatMap(c=>c.lessonIds);
  assert.equal(items.length,2);for(const q of items){for(const lesson of q.lessonIds)assert.ok(allowed.includes(lesson),`${id}/${lesson}`);
   for(const lang of ['ar','en']){assert.ok(q.question[lang].includes('\n'));assert.ok(q.explanation[lang].length>20);assert.ok(!practice.some(p=>p.question[lang]===q.question[lang]));assert.ok(!Object.values(guides).some(g=>q.question[lang].includes(g.artifact[lang])));assert.equal(new Set(q.options.map(o=>o[lang])).size,4);}}
 }
});
test('every form preserves required coverage and semantics across Arabic, English and reload',{skip:!has},()=>{
 for(let order=1;order<=19;order++){
  const ar=courseQuestions(order,'ar','form-learner'),en=courseQuestions(order,'en','form-learner'),again=courseQuestions(order,'ar','form-learner');assert.deepEqual(ar,again);assert.equal(ar.formId,en.formId);assert.equal(ar.questions.length,read('course-exam-bank.private.json')[order].length+assessmentVariants('course',order).length);for(const q of read('course-exam-bank.private.json')[order])assert.ok(ar.questions.some(item=>item.id===q.id));
  assert.deepEqual(ar.questions.map(q=>[q.id,q.answer]),en.questions.map(q=>[q.id,q.answer]));for(const q of assessmentVariants('course',order))assert.ok(ar.questions.some(item=>item.id===q.id));
 }
 for(const [id,bank]of Object.entries(read('path-exam-bank.private.json')))for(let slot=1;slot<=3;slot++){
  const context={userId:'form-learner',scope:`path:${id}`,slot},extra=assessmentVariants('path',id),ar=assessmentForm(bank,extra,{...context,language:'ar'}),en=assessmentForm(bank,extra,{...context,language:'en'});
  assert.equal(ar.questions.length,10);assert.equal(new Set(ar.questions.map(q=>q.id)).size,10);assert.equal(ar.formId,en.formId);assert.deepEqual(ar.questions.map(q=>[q.id,q.answer]),en.questions.map(q=>[q.id,q.answer]));
 }
});
test('path retries use different old-case subsets and forms without losing required new cases',{skip:!has},()=>{
 for(const id of Object.keys(read('assessment-variants.private.json').paths)){
  const forms=[1,2,3].map(slot=>pathQuestions(id,'en','retry-learner',slot));
  for(let i=0;i<forms.length;i++){assert.equal(forms[i].filter(q=>q.id.startsWith('transfer-path')).length,2);for(let j=i+1;j<forms.length;j++)assert.notDeepEqual(forms[i].map(q=>q.id).sort(),forms[j].map(q=>q.id).sort());}
 }
 assert.throws(()=>assessmentForm([],[],{userId:'x',scope:'x'}));assert.throws(()=>assessmentForm(read('path-exam-bank.private.json').path_soc,[],{userId:'x',scope:'x',slot:4}));
});
test('server rejects stale or absent course forms and grades shuffled choices without disclosing rationale',{skip:!has},async()=>{
 const f=fixture(),service=courseExamService({base:'https://fixture.test',request:f.request,getRead:async()=>true,membership:{plan:'pro'},foundationsPassed:true});
 const state=await service.state('course-user',17,'en');assert.match(state.data.formId,/^[a-f0-9]{24}$/);assert.ok(state.data.questions.every(q=>Object.keys(q).sort().join(',')==='id,options,question'));
 const correct=key(courseQuestions(17,'ar','course-user').questions);assert.equal((await service.submit('course-user',17,correct)).code,409);assert.equal((await service.submit('course-user',17,correct,'stale')).code,409);assert.equal(f.rows.size,0);
 const wrong=Object.fromEntries(Object.entries(correct).map(([id,a])=>[id,(a+1)%4]));assert.equal((await service.submit('course-user',17,wrong,state.data.formId)).data.score,0);assert.equal(f.rows.size,0);
 assert.equal((await service.submit('course-user',17,correct,state.data.formId)).data.passed,true);const payload=JSON.parse([...f.rows.values()][0].payload);assert.equal(payload.formId,state.data.formId);assert.equal(payload.questionIds.length,6);assert.equal(payload.assessmentEdition,'transfer-forms-20261005');assert.ok(!Object.hasOwn(payload,'answers'));
 assert.equal((await service.state('course-user',17)).data.questions,undefined);
});
test('path grading rejects previous attempt forms and persists historical counts for credential recovery',{skip:!has},async()=>{
 const f=fixture(),service=pathExamService({base:'https://fixture.test',request:f.request,getRead:async()=>true,getCoursePassed:async()=>true,getPracticalPassed:async()=>true,membership:{plan:'pro'},foundationsPassed:true});
 const first=await service.state('retry-user','path_soc','en'),answers1=key(pathQuestions('path_soc','en','retry-user',1));
 assert.equal((await service.submit('retry-user','Real Learner','path_soc',answers1,'missing')).code,409);assert.equal(f.rows.size,0);
 const wrong=Object.fromEntries(Object.entries(answers1).map(([id,a])=>[id,(a+1)%4]));assert.equal((await service.submit('retry-user','Real Learner','path_soc',wrong,first.data.formId)).data.passed,false);
 const second=await service.state('retry-user','path_soc','ar');assert.notEqual(second.data.formId,first.data.formId);assert.equal((await service.submit('retry-user','Real Learner','path_soc',answers1,first.data.formId)).code,409);
 const correct=key(pathQuestions('path_soc','ar','retry-user',2));assert.equal((await service.submit('retry-user','Real Learner','path_soc',correct,second.data.formId)).data.passed,true);
 const cert=await service.credential('retry-user','path_soc'),attempt=[...f.rows.values()].map(row=>JSON.parse(row.payload)).find(p=>p.passed&&p.slot===2);assert.equal(cert.data.lessonCount,attempt.lessonCount);assert.equal(cert.data.courseCount,attempt.courseCount);assert.equal(cert.data.assessmentEdition,'transfer-forms-20261005');
 assert.equal((await service.state('retry-user','path_soc')).data.questions,undefined);
});
