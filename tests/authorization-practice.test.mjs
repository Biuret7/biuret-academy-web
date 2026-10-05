import test from 'node:test';
import assert from 'node:assert/strict';
import { identities, actions, policyAllows, simulate, reviewAttempts, sanitizeAttempts, authorizationReport } from '../authorization-model.js';

const cases = variant => Object.keys(identities).flatMap(identity => ['A','B'].flatMap(object => actions.map(action => ({variant,identity,object,action,prediction:'deny'}))));
test('repaired simulation enforces authentication, tenant isolation and action permissions across all routes',()=>{
  for (const c of cases('fixed')) {
    const i=identities[c.identity], allowed=i.authenticated && i.tenant===c.object && (c.action!=='update' || i.role==='editor');
    const r=simulate(c); assert.equal(r.allowed,allowed); assert.equal(policyAllows(c),allowed); assert.equal(r.compliant,true);
    if (!allowed) assert.equal(r.body,'');
  }
  assert.throws(()=>simulate({variant:'fixed',identity:'admin',object:'A',action:'read'}));
});
test('partial repair still leaks cross-tenant exports but preserves approved controls',()=>{
  assert.equal(simulate({variant:'partial',identity:'viewer-A',object:'B',action:'read'}).allowed,false);
  assert.equal(simulate({variant:'partial',identity:'viewer-A',object:'B',action:'export'}).compliant,false);
  assert.equal(simulate({variant:'partial',identity:'viewer-A',object:'A',action:'export'}).compliant,true);
  assert.equal(simulate({variant:'original',identity:'viewer-A',object:'A',action:'update'}).compliant,false);
  assert.equal(simulate({variant:'partial',identity:'guest',object:'A',action:'export'}).status,401);
});
test('coverage cannot declare a repair complete based on missing, duplicated or other-version cases',()=>{
  assert.equal(reviewAttempts([], 'fixed').outcome,'incomplete');
  assert.equal(reviewAttempts(cases('fixed').slice(0,23),'fixed').outcome,'incomplete');
  const sample=cases('fixed')[0]; assert.equal(reviewAttempts([sample,sample,...cases('original')],'fixed').tested,1);
  assert.equal(reviewAttempts(cases('fixed'),'fixed').outcome,'covered');
  assert.equal(reviewAttempts(cases('partial'),'partial').outcome,'finding');
  assert.equal(reviewAttempts(cases('original'),'original').outcome,'finding');
});
test('local reports recompute observations and omit account identifiers and untrusted extra fields',()=>{
  const c={...cases('partial')[11],secret:'hidden',observed:{allowed:false}};
  const report=authorizationReport({attempts:[c,{identity:'bad'}],owner:'user-secret',email:'email-secret',reasoning:'x'.repeat(4500)},'ar');
  const out=JSON.stringify(report); assert.equal(report.attempts.length,1); assert.equal(report.reasoning.length,4000);
  assert.ok(!out.includes('hidden')&&!out.includes('user-secret')&&!out.includes('email-secret'));
  assert.deepEqual(report.attempts[0].observed,simulate(c));assert.equal(sanitizeAttempts([c,c]).length,1);
});
