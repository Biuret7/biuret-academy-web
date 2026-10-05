import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const FORM_VERSION = 'transfer-forms-20261005';
let variants;
export function assessmentVariants(kind, key) {
  if (!variants) {
    variants = JSON.parse(process.env.ACADEMY_ASSESSMENT_VARIANTS || readFileSync(new URL('../assessment-variants.private.json', import.meta.url), 'utf8'));
    if (variants.revision !== FORM_VERSION) throw new Error('Assessment variants revision invalid');
    for (const group of ['courses', 'paths']) {
      if (!variants[group] || typeof variants[group] !== 'object') throw new Error('Assessment variants missing');
      for (const items of Object.values(variants[group])) {
        if (!Array.isArray(items) || items.length !== 2 || new Set(items.map(q => q.id)).size !== 2 || items.some(q =>
          !/^[a-z0-9-]+$/.test(q.id) || !Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options?.length ||
          !Array.isArray(q.options) || q.options.length !== 4 || !['ar', 'en'].every(lang =>
            typeof q.question?.[lang] === 'string' && q.question[lang].length > 30 &&
            typeof q.explanation?.[lang] === 'string' && q.explanation[lang].length > 20 &&
            q.options.every(o => typeof o?.[lang] === 'string' && o[lang])))) throw new Error('Assessment variants invalid');
      }
    }
    if ([1,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18].some(k => !variants.courses[k]) ||
      ['path_pentest','path_soc','path_dfir','path_cloud','path_appsec','path_mobile','path_threat_intel','path_malware'].some(k => !variants.paths[k])) throw new Error('Assessment variants incomplete');
  }
  return variants[kind === 'course' ? 'courses' : 'paths'][key] || [];
}

const hash = value => createHash('sha256').update(value).digest('hex');
const rank = (items, seed, id) => [...items].sort((a,b) => hash(`${seed}:${id(a)}`).localeCompare(hash(`${seed}:${id(b)}`)));

// Select language-neutral IDs/option indices first. The same form is graded on
// the server and survives refresh/language changes. No client controls the seed.
export function assessmentForm(base, extra, { userId, scope, slot = 1, language = 'ar' }) {
  if (!Array.isArray(base) || base.length < 3 || !Number.isInteger(slot) || slot < 1 || slot > 3 || typeof userId !== 'string' || !userId) throw new Error('Assessment form context invalid');
  const seed = `${FORM_VERSION}:${userId}:${scope}:${hash(JSON.stringify([...base,...extra]))}`;
  let selected = base;
  if (extra.length && scope.startsWith('course:')) {
    selected = [...base,...extra];
  } else if (extra.length) {
    const ranked = rank(base, seed, q => q.id);
    const start = (Number.parseInt(hash(seed).slice(0,8),16) + (slot - 1) * extra.length) % ranked.length;
    selected = [...extra, ...Array.from({length:base.length-extra.length},(_,i)=>ranked[(start+i)%ranked.length])];
  }
  if (new Set(selected.map(q => q.id)).size !== selected.length) throw new Error('Assessment form IDs invalid');
  const ordered = rank(selected, `${seed}:slot:${slot}`, q => q.id);
  const formId = hash(`${seed}:slot:${slot}:${ordered.map(q=>q.id).join(',')}`).slice(0,24);
  const lang = language === 'en' ? 'en' : 'ar';
  const questions = ordered.map(q => {
    const indices = rank(q.options.map((_,i)=>i), `${seed}:${slot}:${q.id}`, i=>String(i));
    return {id:q.id, question:q.question[lang], options:indices.map(i=>q.options[i][lang]), answer:indices.indexOf(q.answer)};
  });
  return {formId, questions, formVersion:FORM_VERSION};
}
