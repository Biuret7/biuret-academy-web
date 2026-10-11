import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import {ctfChallenges,ctfCategories,ctfLevels,ctfGuides,filterCTFChallenges} from '../ctf-model.js';
const sha=data=>createHash('sha256').update(data).digest('hex');
function unzip(data){
 let end=-1;for(let n=data.length-22;n>=Math.max(0,data.length-65557);n--)if(data.readUInt32LE(n)===0x06054b50){end=n;break;}
 assert.notEqual(end,-1);const count=data.readUInt16LE(end+10),files=new Map();let pos=data.readUInt32LE(end+16);
 for(let i=0;i<count;i++){
  assert.equal(data.readUInt32LE(pos),0x02014b50);const method=data.readUInt16LE(pos+10),size=data.readUInt32LE(pos+20),rawSize=data.readUInt32LE(pos+24),nameSize=data.readUInt16LE(pos+28),extra=data.readUInt16LE(pos+30),comment=data.readUInt16LE(pos+32),offset=data.readUInt32LE(pos+42);
  const name=data.subarray(pos+46,pos+46+nameSize).toString('utf8');assert.ok(!files.has(name));assert.doesNotMatch(name,/(?:^\/|\.\.|\\|:|organizer|solution|solver|scoreboard)/i);
  assert.equal(data.readUInt32LE(offset),0x04034b50);const start=offset+30+data.readUInt16LE(offset+26)+data.readUInt16LE(offset+28),packed=data.subarray(start,start+size);assert.ok([0,8].includes(method));const body=method===8?inflateRawSync(packed):packed;assert.equal(body.length,rawSize);files.set(name,body);pos+=46+nameSize+extra+comment;
 }return files;
}
test('the archive replaces the old six missions with all 40 localized concepts',()=>{
 assert.equal(ctfChallenges.length,40);assert.equal(new Set(ctfChallenges.map(c=>c.id)).size,40);
 assert.deepEqual([1,2,3,4,5].map(level=>ctfChallenges.filter(c=>c.level===level).length),[4,10,13,11,2]);
 assert.deepEqual(ctfChallenges.filter(c=>c.status==='ready').map(c=>c.id).sort(),['biuret-cybertrace','biuret-vault']);
 for(const c of ctfChallenges){assert.ok(ctfCategories[c.category]&&ctfLevels[c.level]);for(const lang of ['ar','en'])assert.ok(c.title[lang]&&c.brief[lang]);assert.ok(!('flag' in c)&&!('solution' in c));assert.equal(Boolean(c.package),c.status==='ready');}
 assert.ok(!ctfChallenges.some(c=>['real-host','encoding','session-correlation','permissions','transport','timeline'].includes(c.id)));
});
test('availability, specialty, level and bilingual search compose without inventing ready packages',()=>{
 assert.equal(filterCTFChallenges({availability:'planned'}).length,38);assert.equal(filterCTFChallenges({availability:'ready'}).length,2);
 assert.equal(filterCTFChallenges({availability:'ready',category:'forensics',level:'3',query:'CYBERTRACE'}).length,1);
 assert.equal(filterCTFChallenges({availability:'planned',query:'الخزنة'}).length,0);
 assert.equal(filterCTFChallenges({query:'الخزنة'})[0].id,'biuret-vault');assert.equal(filterCTFChallenges({level:'5'}).length,2);
 assert.equal(filterCTFChallenges({query:'<script>alert(1)</script>'}).length,0);
});
test('player ZIP downloads match their manifests and contain no organizer solution files',()=>{
 for(const c of ctfChallenges.filter(c=>c.package)){
  assert.match(c.package.url,/^assets\/biuret-[a-z-]+-player\.zip$/);const data=readFileSync(new URL('../'+c.package.url,import.meta.url));assert.equal(data.length,c.package.bytes);assert.equal(sha(data),c.package.sha256);
  const files=unzip(data);assert.equal(files.size,c.package.files.length);
  for(const f of c.package.files){assert.equal(files.get(f.name)?.length,f.bytes);assert.equal(sha(files.get(f.name)),f.sha256);}
  assert.ok(files.has(c.package.folder+'/'+c.package.launch));assert.ok(ctfGuides[c.id]);
  for(const items of Object.values(ctfGuides[c.id]))for(const item of items)assert.ok(item.ar&&item.en);
  const py=files.get(c.package.folder+'/'+c.package.launch).toString();assert.doesNotMatch(py,/import (?:socket|requests|subprocess)|os\.system\(|eval\(|exec\(/);
 }
});
