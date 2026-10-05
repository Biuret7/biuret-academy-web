const fields = ['evidence','reasoning','limits','retest'];
export function practicalDraft(value = {}) {
  return Object.fromEntries(fields.map(key=>[key, typeof value?.[key] === 'string' ? value[key].slice(0,4000) : '']));
}
export function practicalReport(value, pathId, language) {
  if (!/^(foundations|path_(pentest|soc|dfir|cloud|grc|appsec|mobile|threat_intel|malware))$/.test(pathId)) throw new Error('Invalid report path');
  return {schemaVersion:1,kind:'practical-self-review',pathId,language:language==='en'?'en':'ar',
    ...practicalDraft(value),reviewStatus:'not-reviewed',practiceOnly:true,
    limitations:'Learner-authored notes; not independently verified tool execution or a manually graded submission.'};
}
