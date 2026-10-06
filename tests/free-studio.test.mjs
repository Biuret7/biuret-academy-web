import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import {studioUnits,studioCases,freeCourseOrders} from '../free-studio-content.js';
import {cleanStudio,studioStorageKey,recordRecall,studioSummary,gradeStudioCase,permissionMode,studioExport} from '../free-studio-model.js';
import {requiredPlan} from '../plan-access.js';
import {requiredLibraryPlan,mayAccessLibrary,publicLibraryFor} from '../functions/academy-progress/src/library.js';

test('four complete starter courses open before Foundations while specialties retain prerequisites',()=>{
  assert.deepEqual(freeCourseOrders,[1,2,4,9]);
  for(const order of freeCourseOrders){assert.equal(requiredPlan('course',order),'free');assert.equal(requiredLibraryPlan('course',order),'free');assert.equal(mayAccessLibrary('course',order,{plan:'free'},false),true);}
  assert.equal(mayAccessLibrary('course',3,{plan:'free'},true),false);
  assert.equal(mayAccessLibrary('course',3,{plan:'plus'},false),false);
  assert.equal(mayAccessLibrary('course',3,{plan:'plus'},true),true);
});
test('beginner practice unlocks with courses without opening privileged assessments',()=>{
  for(const [kind,indices] of Object.entries({quiz:[0,1,3,8],lab:[0,1,5]}))for(const index of indices){assert.equal(requiredPlan(kind,index),'free');assert.equal(mayAccessLibrary(kind,index,{plan:'free'},false),true);}
  assert.equal(mayAccessLibrary('lab',2,{plan:'free'},true),false);
  assert.equal(mayAccessLibrary('operation',1,{plan:'free'},true),false);
});
const privateAvailable=existsSync(new URL('../functions/academy-progress/desktop-library.en.private.json',import.meta.url));
test('Free receives all 26 full starter lessons and filtered specialty bodies in both languages',{skip:!privateAvailable},()=>{
 for(const language of ['ar','en']){
  const library=publicLibraryFor(language,{plan:'free'},false);
  const starters=library.categories.filter(c=>freeCourseOrders.includes(c.order));
  assert.equal(starters.reduce((n,c)=>n+c.lessons.length,0),26);
  for(const c of starters){assert.equal(c.locked,false);for(const lesson of c.lessons){assert.ok(lesson.content.length>(language==='ar'?600:850));assert.ok(lesson.guide.checkpoint);}}
  const restricted=library.categories.find(c=>c.order===3);assert.equal(restricted.locked,true);assert.ok(restricted.lessons.every(l=>!l.content&&!l.guide));
  assert.equal(library.quizzes.filter(q=>!q.locked).length,4);assert.equal(library.labs.filter(l=>!l.locked).length,3);
 }
});
test('studio includes bilingual reasoning, worked examples and tasks for every topic',()=>{
 for(const unit of studioUnits){for(const locale of ['ar','en']){assert.ok(unit.paragraphs.every(p=>p[locale].length>120));assert.ok(unit.example[locale]);assert.ok(unit.task[locale]);assert.ok(unit.feedback[locale]);assert.equal(unit.options.length,3);}assert.ok(unit.answer>=0&&unit.answer<3);}
 assert.equal(studioUnits.length,6);
});
test('notes are scoped per account and anonymous storage is refused',()=>{
 assert.equal(studioStorageKey(null),null);assert.equal(studioStorageKey('guest'),null);assert.equal(studioStorageKey('  '),null);
 assert.notEqual(studioStorageKey('learner-1'),studioStorageKey('learner-2'));assert.ok(studioStorageKey('a:/b').endsWith('a%3A%2Fb'));
});
test('a wrong recall remains due now; confidence changes future guidance only',()=>{
 const u=studioUnits[0],now=10000000;
 const wrong=recordRecall({units:{[u.id]:{note:'My reasoning'}}},u.id,(u.answer+1)%3,3,now);
 assert.equal(wrong.correct,false);assert.equal(wrong.state.units[u.id].due,now);assert.equal(wrong.state.units[u.id].note,'My reasoning');
 for(const [confidence,days] of [[1,1],[2,3],[3,7]]){const correct=recordRecall(wrong.state,u.id,u.answer,confidence,now);assert.equal(correct.correct,true);assert.equal(correct.state.units[u.id].due,now+days*86400000);assert.equal(studioSummary(correct.state,now).checked,1);}
 assert.equal(recordRecall({},'missing',0,1),null);assert.equal(recordRecall({},u.id,99,1),null);assert.equal(recordRecall({},u.id,0,0),null);
});
test('stored passed flags and unrelated keys cannot forge formative outcomes or rewards',()=>{
 const input={xp:9999,coins:9999,certificate:true,units:{scope:{passed:true,answer:999,note:'x'.repeat(5000)},unknown:{answer:1}},cases:{destination:{passed:true,variant:99,answer:'wrong'}},portfolio:{scope:'My scope',email:'private@example.invalid'}};
 const clean=cleanStudio(input),report=studioExport(input,'en');assert.equal(clean.units.scope.note.length,4000);assert.equal(studioSummary(clean).checked,0);assert.equal(studioSummary(clean).cases,0);assert.equal(report.units[0].practiceCorrect,false);assert.equal(report.cases[0].extractionCorrect,false);
 assert.equal(report.portfolio.scope,'My scope');assert.doesNotMatch(JSON.stringify(report),/9999|private@example.invalid|certificate":true/);
});
test('each synthetic case has two separately graded evidence variants',()=>{
 for(const c of studioCases)for(let i=0;i<2;i++){assert.equal(gradeStudioCase(c.id,i,c.variants[i].expected),true);assert.equal(gradeStudioCase(c.id,i,'unrelated'),false);assert.equal(gradeStudioCase(c.id,i,c.variants[1-i].expected),false);}
 assert.equal(gradeStudioCase('missing',0,'2'),false);assert.equal(gradeStudioCase('triage',9,'2'),false);
});
test('permission explainer converts every traditional bit combination correctly',()=>{
 for(let mode=0;mode<512;mode++){const bits=Array.from({length:9},(_,i)=>Boolean(mode&(1<<(8-i))));assert.equal(permissionMode(bits),mode.toString(8).padStart(3,'0'));}
 assert.equal(permissionMode([true]),null);assert.equal(permissionMode(Array(9).fill(1)),null);
});
test('portfolio export preserves entered evidence and explicitly labels formative practice',()=>{
 const s={portfolio:{scope:'Synthetic files only',evidence:'row 3',finding:'bounded inference'},cases:{triage:{variant:1,answer:'3',note:'Session context missing'}}};
 for(const locale of ['ar','en']){const report=studioExport(s,locale);assert.equal(report.language,locale);assert.equal(report.cases[2].extractionCorrect,true);assert.equal(report.cases[2].note,'Session context missing');assert.equal(report.portfolio.scope,s.portfolio.scope);assert.ok(report.notice);}
});
