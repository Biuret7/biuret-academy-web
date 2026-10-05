import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {mobileDecision,assessSources,assessControl,specialistReport,specialistVariant,specialistPractices} from '../specialist-model.js';
import {academyPaths} from '../path-catalog-data.js';

test('mobile repair rejects non-owners and preserves owners; signed-out requests never return records',()=>{
  for(const c of ['before','after']){
    assert.deepEqual([mobileDecision('owner',c).status,mobileDecision('owner',c).recordData],[200,true]);
    assert.deepEqual([mobileDecision('signed-out',c).status,mobileDecision('signed-out',c).recordData],[401,false]);
  }
  assert.equal(mobileDecision('other','before').recordData,true);
  assert.deepEqual([mobileDecision('other','after').status,mobileDecision('other','after').recordData],[403,false]);
  assert.throws(()=>mobileDecision('invented','after'));assert.throws(()=>mobileDecision('owner','invalid'));
});
test('intel desk counts independent origins, retains conflicts and never infers actor attribution',()=>{
  assert.equal(assessSources('copies').independentSupport,1);
  assert.equal(assessSources('copies').decision,'single-origin');
  assert.equal(assessSources('independent').decision,'corroborated');
  assert.equal(assessSources('independent').independentSupport,2);
  assert.equal(assessSources('conflict').decision,'unresolved');
  for(const id of ['copies','independent','conflict'])assert.equal(assessSources(id).attribution,'unestablished');
  assert.throws(()=>assessSources('__proto__'));
});
test('GRC review requires current operating evidence and owned acceptance; policy and stale proof leave gaps',()=>{
  const policy=assessControl('policy'),tested=assessControl('tested'),expired=assessControl('expired');
  assert.equal(policy.design,true);assert.equal(policy.verified,false);assert.equal(policy.decision,'open-gap');
  assert.equal(tested.verified,true);assert.equal(tested.activeAcceptance,true);assert.equal(tested.decision,'review-ready');
  assert.equal(expired.fresh,false);assert.equal(expired.activeAcceptance,false);assert.equal(expired.decision,'open-gap');
  assert.ok(tested.scope.includes('Not organization-wide'));assert.throws(()=>assessControl('missing'));
});
test('practice exports recompute distinct outcomes, limit notes and omit automatic account data',()=>{
  const r=specialistReport({owner:'private-identity',email:'private-mail',reasoning:'x'.repeat(5000),observations:['before/other','after/other','after/other','fake'],results:[{allowed:true}]},'mobile','en');
  assert.equal(r.results.length,2);assert.equal(r.results[0].recordData,true);assert.equal(r.results[1].recordData,false);
  assert.equal(r.reasoning.length,4000);assert.ok(!JSON.stringify(r).includes('private-'));
  assert.equal(specialistReport({observations:['copies']},'intel','ar').results[0].decision,'single-origin');
  assert.equal(specialistReport({observations:['expired']},'grc','en').results[0].activeAcceptance,false);
  assert.throws(()=>specialistReport({},'__proto__','en'));
});
test('specialist routes retain existing access indices and match dedicated path metadata',()=>{
  for(const [kind,v] of Object.entries(specialistPractices)){
    assert.equal(specialistVariant(v.index,kind),kind);assert.equal(specialistVariant(v.index+1,kind),null);
    const lab=academyPaths.find(p=>p.id===v.path).labs.find(l=>l.index===v.index);
    assert.equal(lab.href,`practice-lab.html?id=${v.index}&context=${kind}`);assert.deepEqual(lab.title,v.title);
  }
  assert.equal(specialistVariant(7,'__proto__'),null);
  assert.equal(academyPaths.find(p=>p.id==='path_cloud').labs.find(l=>l.index===7).href,'practice-lab.html?id=7&context=cloud');
  assert.ok(academyPaths.find(p=>p.id==='path_dfir').labs.some(l=>l.href==='practice-lab.html?id=6'));
});
const base=new URL('../functions/academy-progress/',import.meta.url);
test('12 specialist guides have distinct exercises, aligned formative answers and private grading',{skip:!existsSync(new URL('learning-edition.private.json',base))},async()=>{
  const bank=JSON.parse(readFileSync(new URL('learning-edition.private.json',base),'utf8'));
  const ids=['desktop-topic-49','desktop-topic-50','desktop-topic-51','desktop-topic-72','desktop-v5-desktop-14-1','desktop-topic-52','desktop-topic-53','desktop-topic-54','desktop-topic-73','desktop-v5-desktop-15-1','desktop-topic-5','desktop-topic-58'];
  const {publicLibraryFor,lessonCheckpoint}=await import('../functions/academy-progress/src/library.js');
  const pub=publicLibraryFor('en',{admin:true},true).categories.flatMap(c=>c.lessons),locked=publicLibraryFor('en',{plan:'free'},true);
  const exercises=new Set();
  for(const id of ids){
    const g=bank.lessons[id];exercises.add(g.exercise.en);
    for(const lang of ['ar','en'])for(const f of ['concept','analysis','exercise'])assert.ok(g[f][lang].length>70,`${id} ${lang} ${f}`);
    assert.ok(g.sources.length);assert.ok(g.objectives.en.length>=3);assert.equal(g.checkpoint.options.length,4);
    assert.equal(lessonCheckpoint(id,g.checkpoint.answer).correct,true);assert.equal(lessonCheckpoint(id,(g.checkpoint.answer+1)%4).correct,false);
    const check=pub.find(l=>l.id===id).guide.checkpoint;assert.equal(Object.hasOwn(check,'answer'),false);assert.equal(Object.hasOwn(check,'explanation'),false);
  }
  assert.equal(exercises.size,12);
  for(const c of locked.categories.filter(c=>[14,15].includes(c.order)))for(const l of c.lessons){assert.equal(l.guide,undefined);assert.equal(l.content,undefined);}
});
