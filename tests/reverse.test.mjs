import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {traceBranch,reverseReport,reversePractice} from '../reverse-model.js';
import {academyPaths} from '../path-catalog-data.js';
import {lessons} from '../learning-content.js';
test('32-bit boundary branches distinguish signed and unsigned without treating equality as less-than',()=>{
 for(const mode of ['signed','unsigned']){assert.equal(traceBranch('three',mode).taken,true);assert.equal(traceBranch('equal',mode).taken,false);}
 for(const id of ['high-bit','all-ones']){assert.equal(traceBranch(id,'signed').taken,true);assert.equal(traceBranch(id,'unsigned').taken,false);}
 assert.equal(traceBranch('all-ones','signed').signed,-1);assert.equal(traceBranch('all-ones','unsigned').unsigned,4294967295);
 assert.equal(traceBranch('high-bit','signed').signed,-2147483648);
 assert.equal(traceBranch('equal','signed').instruction,'jl');assert.equal(traceBranch('equal','unsigned').instruction,'jb');
});
test('invalid comparison modes and inherited object keys are rejected',()=>{
 for(const id of ['__proto__','missing',null])assert.throws(()=>traceBranch(id,'signed'));
 for(const mode of ['__proto__','signed64',null])assert.throws(()=>traceBranch('three',mode));
});
test('reverse export recomputes outcomes and strips injected results and identity fields',()=>{
 const r=reverseReport({owner:'private-owner',email:'private-email',reasoning:'x'.repeat(5000),observations:['all-ones/signed','all-ones/unsigned','all-ones/signed','fake'],results:[{taken:false}]},'en');
 assert.equal(r.results.length,2);assert.equal(r.results[0].taken,true);assert.equal(r.results[1].taken,false);assert.equal(r.reasoning.length,4000);
 assert.ok(!JSON.stringify(r).includes('private-'));assert.ok(r.scope.includes('not automatically graded'));assert.equal(reverseReport(null,'fake').language,'en');
});
test('malware path includes reverse desk while DFIR retains original lab access',()=>{
 const lab=academyPaths.find(p=>p.id===reversePractice.path).labs.find(l=>l.index===reversePractice.index);
 assert.equal(lab.href,'practice-lab.html?id=6&context=reverse');assert.deepEqual(lab.title,reversePractice.title);
 assert.ok(academyPaths.find(p=>p.id==='path_dfir').labs.some(l=>l.href==='practice-lab.html?id=6'));
});
const base=new URL('../functions/academy-progress/',import.meta.url),hasPrivate=existsSync(new URL('learning-edition.private.json',base));
const read=n=>JSON.parse(readFileSync(new URL(n,base),'utf8'));
test('all 99 private guides now have specific exercises; 28 new cases keep private checkpoint grading',{skip:!hasPrivate},async()=>{
 const edition=read('learning-edition.private.json'),ids=read('desktop-library.en.private.json').categories.filter(c=>[1,5,6,8,16].includes(c.order)).flatMap(c=>c.lessons.map(l=>l.id));
 assert.equal(Object.keys(edition.lessons).length,99);
 for(const g of Object.values(edition.lessons))assert.ok(!g.exercise.en.startsWith('Write four points:'));
 const {publicLibraryFor,lessonCheckpoint}=await import('../functions/academy-progress/src/library.js'),pub=publicLibraryFor('en',{admin:true},true).categories.flatMap(c=>c.lessons);
 for(const id of ids){const g=edition.lessons[id];for(const lang of ['ar','en'])for(const f of ['concept','analysis','exercise'])assert.ok(g[f][lang].length>70,`${id}/${lang}/${f}`);assert.ok(g.sources.length);assert.equal(lessonCheckpoint(id,g.checkpoint.answer).correct,true);assert.equal(lessonCheckpoint(id,(g.checkpoint.answer+1)%4).correct,false);assert.equal(Object.hasOwn(pub.find(l=>l.id===id).guide.checkpoint,'answer'),false);}
 const free=publicLibraryFor('en',{plan:'free'},true);for(const c of free.categories.filter(c=>[5,6,8,16].includes(c.order)))for(const l of c.lessons){assert.equal(l.guide,undefined);assert.equal(l.content,undefined);}
});
test('assessment mapping covers all final slots and links only lessons taught in the required course bundle',{skip:!hasPrivate},()=>{
 const map=JSON.parse(readFileSync(new URL('../content/assessment-coverage.json',import.meta.url))),library=read('desktop-library.en.private.json'),courseBank=read('course-exam-bank.private.json'),paths=read('path-exam-bank.private.json'),practical=read('practical-bank.private.json');
 const native=lessons.map(l=>l.id),idsFor=path=>path==='foundations'?native:academyPaths.find(p=>p.id===path).courses.flatMap(c=>c.lessonIds);
 for(const c of library.categories){const groups=map.courseLessonGroups[c.order];assert.equal(groups.length,courseBank[c.order].length);for(const group of groups){assert.ok(group.length);for(const id of group)assert.ok(c.lessons.some(l=>l.id===id),`${c.order}/${id}`);}}
 for(const [path,groups]of Object.entries(map.pathCaseGroups)){const allowed=idsFor(path);assert.equal(groups.length,3);assert.equal((path==='foundations'?read('exam-bank.private.json'):paths[path]).length,10);for(const group of groups)for(const id of group)assert.ok(allowed.includes(id),`${path}/${id}`);}
 for(const [path,groups]of Object.entries(map.practicalLessonGroups)){assert.equal(groups.length,practical[path].length);for(const group of groups)for(const id of group)assert.ok(idsFor(path).includes(id),`${path}/${id}`);}
 assert.equal(Object.keys(map.pathCaseGroups).length,10);assert.equal(Object.keys(map.courseLessonGroups).length,18);
});
