import test from 'node:test';
import assert from 'node:assert/strict';
import { pathJourney, lessonContinuation } from '../learning-journey-model.js';
const path={free:false,courses:[{lessonIds:['a','b']},{lessonIds:['c']}],practical:'practical.html?id=test',exam:'path-exam.html?id=test',certificate:'certificate.html?path=test'};
const base={path,access:'owned',signedIn:true,completed:3,status:{completedCourses:2}};
test('course exams are required before the practical recommendation',()=>{
 assert.equal(pathJourney({...base,status:{completedCourses:1}}).action.href,'#path-course');
 assert.equal(pathJourney(base).action.href,path.practical);
});
test('actual practical and final results select the next step without opening an exam',()=>{
 assert.equal(pathJourney({...base,status:{completedCourses:2,practicalPassed:true}}).action.href,path.exam);
 assert.equal(pathJourney({...base,status:{completedCourses:2,practicalPassed:true,passed:true}}).action.href,path.certificate);
});
test('loading, failures and missing identity or entitlement cannot recommend a learning link',()=>{
 for(const input of [{pending:true},{failed:true},{signedIn:false},{access:'purchase'},{access:'foundations'},{status:null}])assert.equal(pathJourney({...base,...input}).action,null);
 assert.equal(pathJourney({...base,access:'foundations'}).reason,'foundations');
});
test('administrator bypass counts do not become verified lesson or course completion',()=>{
 const state=pathJourney({...base,admin:true,access:'admin',status:{completedCourses:2,readyForPractical:true}});
 assert.equal(state.lessons,null);assert.equal(state.steps[0].state,'current');assert.equal(state.action.href,'#path-course');
});
test('Foundations use the next verified lesson and then practical, exam and credential',()=>{
 const free={...path,free:true};
 assert.equal(pathJourney({...base,path:free,completed:1,status:{},foundationNext:{href:'lesson.html?id=b'}}).action.href,'lesson.html?id=b');
 assert.equal(pathJourney({...base,path:free,status:{}}).action.href,path.practical);
 assert.equal(pathJourney({...base,path:free,status:{practicalPassed:true}}).action.href,path.exam);
});
test('Foundations administrator progress uses real awards rather than specialty bypass counts',()=>{
 const state=pathJourney({...base,path:{...path,free:true},admin:true,completed:1,status:{},foundationNext:{href:'lesson.html?id=b'}});
 assert.equal(state.lessons,1);assert.equal(state.admin,false);assert.equal(state.current,'learn');
});
test('lesson continuation does not offer the next lesson before a verified checkpoint',()=>{
 const input={nextHref:'lesson.html?id=next',courseHref:'course.html?id=current',checkpointId:'lesson-check'};
 assert.equal(lessonContinuation({...input,complete:false,ready:true}).href,'#lesson-check');
 assert.equal(lessonContinuation({...input,complete:false,ready:false}).href,input.courseHref);
 assert.equal(lessonContinuation({...input,complete:true}).href,input.nextHref);
});
