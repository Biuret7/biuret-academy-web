import test from 'node:test';
import assert from 'node:assert/strict';
import {ctfChallenges,checkCTFAttempt} from '../ctf-model.js';
test('training flags match the supplied evidence and require a reasoning draft',()=>{
  const byId=id=>ctfChallenges.find(c=>c.id===id);
  assert.equal(new URL(byId('real-host').evidence.split('\n')[0]).hostname,'portal.training.example');
  assert.equal(Buffer.from(byId('encoding').evidence.split('\n')[1],'base64').toString(),byId('encoding').flag);
  const timeline=byId('timeline').evidence.split('\n').slice(0,3).map(line=>{const [id,date]=line.split(' ');return{id,date:Date.parse(date)};}).sort((a,b)=>a.date-b.date).map(row=>row.id).join('_');
  assert.equal(`BIURET{${timeline}}`,byId('timeline').flag);
  for(const c of ctfChallenges){assert.ok(c.title.ar&&c.title.en&&c.explanation.ar&&c.explanation.en);assert.equal(checkCTFAttempt(c.id,c.flag,'').code,'reason');assert.equal(checkCTFAttempt(c.id,'BIURET{wrong}','A reasoning draft connecting this result to the supplied evidence.').ok,false);assert.equal(checkCTFAttempt(c.id,c.flag,'A reasoning draft connecting this result to the supplied evidence.').ok,true);}
  assert.equal(checkCTFAttempt('invented','BIURET{x}','x'.repeat(50)).ok,false);
});
