import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import handler, { levelForXp } from '../functions/academy-progress/src/main.js';
import { ctfService, ctfProofId } from '../functions/academy-progress/src/ctf.js';
import { ctfCatalog } from '../functions/academy-progress/src/ctf-catalog.js';
import { ctfChallenges } from '../ctf-model.js';
import { ctfRewards, CTF_MAX_ATTEMPTS } from '../ctf-rewards.js';
import { ctfRewards as serverRewards } from '../functions/academy-progress/src/ctf-policy.js';
const sha = s => createHash('sha256').update(s).digest('hex');
const flag = 'FLAG{synthetic_test_only}';
const bank = [1,2,3,4,5].map(level => ({ id: 'test-'+level, level, title: { ar: 'تحدي '+level, en: 'Test '+level }, packageSha256: sha('package '+level), prefix: 'salt::', digest: sha('salt::'+flag) }));
const account = { $id: 'learner-a', name: 'Test Learner' };
function memory() {
  const rows = new Map();
  const request = async (url, options = {}) => {
    if (options.method === 'POST') {
      const input = JSON.parse(options.body);
      assert.deepEqual(input.permissions, []);
      if (rows.has(input.rowId)) return { status: 409, data: {} };
      rows.set(input.rowId, { ...input.data, $createdAt: '2026-10-11T12:00:00.000Z' });
      return { status: 201, data: rows.get(input.rowId) };
    }
    const id = url.split('/').at(-1);
    return { status: rows.has(id) ? 200 : 404, data: rows.get(id) || {} };
  };
  return { rows, request };
}
test('reward policy and ready inventory agree between server and browser', () => {
  assert.deepEqual(ctfRewards, serverRewards);
  assert.deepEqual(ctfCatalog, ctfChallenges.filter(c=>c.package).map(c=>({ id:c.id, title:c.title, level:c.level, packageSha256:c.package.sha256 })));
  for(let n=2;n<=5;n++)for(const key of ['points','xp','coins'])assert.ok(ctfRewards[n][key]>ctfRewards[n-1][key]);
  const workflow = readFileSync(new URL('../.github/workflows/deploy-pages.yml',import.meta.url),'utf8');
  assert.match(workflow,/ctf-rewards.js/);
  assert.doesNotMatch(workflow,/cp .*ctf-bank/);
});
test('wrong or malformed flags and unavailable challenges never award progress', async () => {
  const m=memory(),s=ctfService({base:'https://test',...m,bank});
  assert.equal((await s.submit(account,'test-1','wrong',true)).code,422);
  for(const f of [null,{},'','a','x'.repeat(257),'FLAG{bad\nflag}'])assert.equal((await s.submit(account,'test-1',f,true)).code,400);
  assert.equal((await s.submit(account,'planned',flag,true)).code,404);
  assert.deepEqual((await s.state(account.$id)).completions,[]);
  assert.equal(m.rows.size,1);
});
test('every difficulty earns fixed XP and points, with coins only for eligible accounts', async () => {
  const m=memory(),s=ctfService({base:'https://test',...m,bank});
  for(const c of bank){
    const result=await s.submit(account,c.id,' '+flag+' ',false);
    assert.equal(result.code,200);assert.equal(result.data.awarded,true);
    assert.deepEqual([result.data.completion.xp,result.data.completion.points,result.data.completion.coins],[ctfRewards[c.level].xp,ctfRewards[c.level].points,0]);
    assert.equal(result.data.completion.learnerName,account.name);
    assert.equal(result.data.completion.verification,'server-flag-match');
  }
  const free=await s.state(account.$id,true);
  assert.equal(free.coins,0);assert.equal(free.completions.length,5);
  const other={...account,$id:'learner-plus'};
  await s.submit(other,'test-3',flag,true);
  assert.equal((await s.state(other.$id,false)).coins,20); // Downgrade keeps earned coins.
  assert.equal((await s.submit(account,'test-3',flag,true)).data.completion.coins,0); // Upgrade cannot remint.
  assert.doesNotMatch(JSON.stringify([...m.rows.values()]),/synthetic_test_only|digest|prefix/);
});
test('parallel correct submissions save one proof and one reward, isolated per learner', async () => {
  const m=memory(),s=ctfService({base:'https://test',...m,bank});
  const results=await Promise.all(Array.from({length:6},()=>s.submit(account,'test-1',flag,true)));
  assert.equal(results.filter(r=>r.data.awarded).length,1);
  assert.equal((await s.state(account.$id)).coins,5);
  assert.equal((await s.state('other')).xp,0);
  assert.equal((await s.submit(account,'test-1','wrong',true)).data.awarded,false);
  m.rows.set(ctfProofId('other','test-1'),m.rows.get(ctfProofId(account.$id,'test-1')));
  await assert.rejects(s.state('other'),/mismatch/);
});
test('server attempt slots limit concurrent guesses and reset at UTC midnight', async () => {
  const m=memory();let date=new Date('2026-10-11T23:00:00Z');
  const s=ctfService({base:'https://test',...m,bank,now:()=>date});
  const results=await Promise.all(Array.from({length:12},()=>s.submit(account,'test-1','wrong',false)));
  assert.equal(results.filter(r=>r.code===422).length,CTF_MAX_ATTEMPTS);
  assert.equal(results.filter(r=>r.code===429).length,2);
  const blocked=await s.submit(account,'test-1',flag,true);
  assert.equal(blocked.code,429);assert.equal(blocked.data.retryAt,'2026-10-12T00:00:00.000Z');
  assert.equal((await s.submit({...account,$id:'other'},'test-1',flag,false)).code,200);
  assert.equal((await s.submit(account,'test-2',flag,false)).code,200);
  date=new Date('2026-10-12T00:00:00Z');assert.equal((await s.submit(account,'test-1',flag,false)).code,200);
});
test('partial storage failures never produce an optimistic award and a retry is safe', async () => {
  const m=memory();let failing=true;
  const s=ctfService({base:'https://test',bank,request:async(url,options={})=>{
    if(failing&&options.method==='POST'&&JSON.parse(options.body).rowId.startsWith('c_'))return{status:500,data:{}};
    return m.request(url,options);
  }});
  await assert.rejects(s.submit(account,'test-1',flag,true),/completion write failed/);
  assert.equal((await s.state(account.$id)).xp,0);
  failing=false;assert.equal((await s.submit(account,'test-1',flag,true)).data.awarded,true);
  assert.equal((await s.submit(account,'test-1',flag,true)).data.awarded,false);
});
test('function verifies account, name and server plan; combined XP never changes lesson prerequisites', async () => {
  const m=memory(),priorFetch=globalThis.fetch,priorBank=process.env.ACADEMY_CTF_BANK;
  const fixture=ctfCatalog.map(c=>({...c,prefix:'salt::',digest:sha('salt::'+flag)}));
  process.env.ACADEMY_CTF_BANK=JSON.stringify(fixture);let name='Test Learner';
  globalThis.fetch=async(url,options={})=>{
    const r=new URL(url).pathname==='/v1/account'?{status:options.headers['X-Appwrite-JWT']==='valid'?200:401,data:{...account,name}}:await m.request(url,options);
    return{status:r.status,json:async()=>r.data};
  };
  const invoke=(bodyJson,jwt='valid')=>handler({req:{headers:{'x-appwrite-user-jwt':jwt,'x-appwrite-key':'test'},bodyJson},res:{json:(body,status=200)=>({body,status})},error:()=>{}});
  try{
    assert.equal((await invoke({action:'ctfSubmit',challengeId:fixture[0].id,flag},'bad')).status,401);
    name='Nickname';assert.equal((await invoke({action:'ctfSubmit',challengeId:fixture[0].id,flag})).status,403);name='Test Learner';
    const result=await invoke({action:'ctfSubmit',challengeId:fixture[0].id,flag,userId:'victim',level:5,coins:999,plan:'pro'});
    assert.equal(result.status,200);assert.equal(result.body.completion.coins,0);assert.equal(result.body.completion.xp,50);
    const state=await invoke({action:'state'});assert.equal(state.body.xp,50);assert.equal(state.body.level,levelForXp(50).level);assert.equal(state.body.awards.length,0);assert.equal(state.body.ctf.completions.length,1);
  }finally{globalThis.fetch=priorFetch;if(priorBank===undefined)delete process.env.ACADEMY_CTF_BANK;else process.env.ACADEMY_CTF_BANK=priorBank;}
});
