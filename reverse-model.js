// Deterministic synthetic 32-bit comparison, not a CPU emulator or binary runner.
export const reversePractice=Object.freeze({index:6,path:'path_malware',course:'desktop-16',title:{ar:'تتبع الفرع وتفسير signed وunsigned',en:'Branch tracing: signed and unsigned interpretation'}});
export const branchInputs=Object.freeze({'three':3,'equal':4,'high-bit':0x80000000,'all-ones':0xffffffff});
export function traceBranch(id,mode){
  if(!Object.hasOwn(branchInputs,id)||!['signed','unsigned'].includes(mode))throw new TypeError('Unknown branch case');
  const unsigned=branchInputs[id],signed=unsigned>=0x80000000?unsigned-0x100000000:unsigned;
  const value=mode==='signed'?signed:unsigned,taken=value<4;
  return {id,mode,width:32,hex:'0x'+unsigned.toString(16).padStart(8,'0').toUpperCase(),unsigned,signed,threshold:4,instruction:mode==='signed'?'jl':'jb',taken,path:taken?'short_branch':'fallthrough'};
}
export function sanitizeReverse(raw){
  const s=raw&&typeof raw==='object'?raw:{};
  const valid=Object.keys(branchInputs).flatMap(id=>['signed','unsigned'].map(mode=>`${id}/${mode}`));
  return {observations:[...new Set((Array.isArray(s.observations)?s.observations:[]).filter(v=>valid.includes(v)))],reasoning:typeof s.reasoning==='string'?s.reasoning.slice(0,4000):''};
}
export function reverseReport(raw,language){
  const s=sanitizeReverse(raw);
  return {schema:'biuret-reverse-practice-v1',language:language==='ar'?'ar':'en',...s,results:s.observations.map(v=>traceBranch(...v.split('/'))),scope:'Local synthetic 32-bit cmp/jl/jb model. No binary execution, flags emulation, account identifiers, XP or certificate. Written reasoning is not automatically graded.'};
}
