import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {cloudRequests,evaluateCloud,compareEvidence,evidenceOriginal,temporalOrder,timeline,normalizeTimeline,caseworkReport} from '../cloud-dfir-model.js';
import {academyPaths} from '../path-catalog-data.js';
test('cloud model denies writes without a grant and constrains excess resource reads while preserving logs',()=>{
  for(const config of ['drift','repaired'])for(const request of cloudRequests){
    const r=evaluateCloud(request,config);
    assert.equal(r.allowed,config==='drift'?request.startsWith('read:'):request==='read:logs');
  }
  assert.equal(evaluateCloud('read:payroll','repaired').reason,'explicit-deny');
  assert.equal(evaluateCloud('write:logs','drift').reason,'no-grant');
  assert.throws(()=>evaluateCloud('delete:logs','repaired'));
});
test('real SHA-256 detects a changed copy and does not fill custody gaps or establish source truth',async()=>{
  const good=await compareEvidence('documented'),changed=await compareEvidence('changed'),gap=await compareEvidence('gap');
  assert.equal(good.originalHash,createHash('sha256').update(evidenceOriginal).digest('hex'));
  assert.equal(good.match,true);assert.equal(good.comparisonUsable,true);
  assert.equal(changed.match,false);assert.equal(changed.comparisonUsable,false);
  assert.equal(gap.match,true);assert.equal(gap.comparisonUsable,false);
  for(const r of [good,changed,gap])assert.equal(r.sourceTruth,'unestablished');
  await assert.rejects(compareEvidence('untrusted'));
});
test('timeline normalization preserves original times and keeps overlapping uncertainty unresolved',()=>{
  const rows=normalizeTimeline(timeline);
  assert.equal(rows[0].utc,'2026-10-05T09:00:00.000Z');
  assert.equal(rows[0].time,timeline[0].time);
  assert.equal(temporalOrder(timeline[0],timeline[1]),'uncertain');
  assert.equal(temporalOrder(timeline[1],timeline[2]),'before');
  assert.notEqual(rows[1].session,rows[2].session);
  assert.throws(()=>normalizeTimeline([{time:'not-a-date',uncertaintySeconds:1}]));
});
test('casework export keeps distinct before/after cases, recomputes outcomes and omits automatic identity fields',async()=>{
  const r=await caseworkReport({owner:'secret-user',email:'secret-mail',observations:['drift/read:payroll','repaired/read:payroll','bad'],reasoning:'x'.repeat(5000),results:[{allowed:true}]},'cloud','en');
  assert.equal(r.results.length,2);assert.equal(r.results[0].allowed,true);assert.equal(r.results[1].allowed,false);
  assert.equal(r.reasoning.length,4000);assert.ok(!JSON.stringify(r).includes('secret-'));
  const f=await caseworkReport({observations:['gap','gap','changed']},'dfir','ar');assert.equal(f.results.length,2);assert.equal(f.results[0].custody,false);
});
const base=new URL('../functions/academy-progress/',import.meta.url);
test('Cloud and DFIR guides replace generic tasks and retain private grading boundaries',{skip:!existsSync(new URL('learning-edition.private.json',base))},async()=>{
  const g=JSON.parse(readFileSync(new URL('learning-edition.private.json',base),'utf8'));
  const lib=JSON.parse(readFileSync(new URL('desktop-library.en.private.json',base),'utf8'));
  const {publicLibraryFor}=await import('../functions/academy-progress/src/library.js');
  const pub=publicLibraryFor('en',{admin:true},true).categories.flatMap(c=>c.lessons);
  const tasks=new Set();let count=0;
  for(const c of lib.categories.filter(c=>[7,12,13].includes(c.order)))for(const l of c.lessons){
    const x=g.lessons[l.id];count++;tasks.add(x.exercise.en);
    for(const lang of ['ar','en']){assert.ok(x.concept[lang].includes('\n\n'));assert.ok(x.exercise[lang].length>70);assert.ok(x.analysis[lang].length>70);}
    assert.ok(x.sources.length);assert.equal(Object.hasOwn(pub.find(v=>v.id===l.id).guide.checkpoint,'answer'),false);
  }
  assert.equal(count,15);assert.equal(tasks.size,15);
});
test('Cloud path links its dedicated lab variant without changing its server access index',()=>{
  const cloud=academyPaths.find(p=>p.id==='path_cloud').labs.find(l=>l.index===7);
  assert.equal(cloud.href,'practice-lab.html?id=7&context=cloud');
  assert.ok(academyPaths.find(p=>p.id==='path_dfir').labs.some(l=>l.index===6));
});
