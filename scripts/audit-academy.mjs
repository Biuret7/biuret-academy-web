import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { academyPaths } from '../path-catalog-data.js';
import { lessons as foundations } from '../learning-content.js';

// This report contains metadata and counts, never private question text or keys.
const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFileSync(resolve(root, name), 'utf8');
const parse = name => JSON.parse(read(`functions/academy-progress/${name}.private.json`));
const findings = [];
const add = (severity, code, location, detail) => findings.push({ severity, code, location, detail });
const walk = (value, at, fn) => {
  if (typeof value === 'string') fn(value, at);
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, `${at}.${k}`, fn);
};
const files = readdirSync(root).filter(f => /\.(html|js|css)$/.test(f));
const pages = files.filter(f => f.endsWith('.html'));
const caches = new Set();
let checkedReferences = 0;
for (const file of files) {
  const source = read(file);
  const references = file.endsWith('.html') ? [...source.matchAll(/(?:href|src)="([^"<>]+)"/g)].map(m => m[1])
    : file.endsWith('.js') ? [...source.matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g)].map(m => m[1]) : [];
  for (const reference of references) {
    if (/^(?:https?:|mailto:|data:|#)/.test(reference) || reference.includes('${')) continue;
    const path = reference.split(/[?#]/)[0];
    checkedReferences++;
    if (path && !existsSync(resolve(root, path.replace(/^\//, '')))) add('error', 'missing-local-target', file, path);
    const version = reference.match(/\.js\?v=([^&#]+)/)?.[1];
    if (version) caches.add(version);
  }
  if (file.endsWith('.html')) {
    if (!/<html[^>]+lang="ar"[^>]+dir="rtl"/.test(source)) add('error', 'default-language-direction', file, 'Arabic shell must default to RTL.');
    if (!/<main\b/.test(source)) add('error', 'missing-main', file, 'A main landmark is required.');
    if (!/class="skip-link"/.test(source)) add('error', 'missing-skip-link', file, 'Keyboard skip navigation is required.');
    const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (duplicates.length) add('error', 'duplicate-dom-id', file, [...new Set(duplicates)].join(', '));
  }
}
if (caches.size !== 1) add('error', 'mixed-module-versions', 'public modules', [...caches].join(', '));

const privateAvailable = existsSync(resolve(root, 'functions/academy-progress/desktop-library.ar.private.json'));
let inventory = { pages: pages.length, paths: academyPaths.length, foundationLessons: foundations.length, checkedReferences, moduleVersions: [...caches] };
let lessons = [];
let assessment = [];
if (privateAvailable) {
  const libraries = { ar: parse('desktop-library.ar'), en: parse('desktop-library.en') };
  const edition = parse('learning-edition');
  const parity = (a, b, path) => {
    if (typeof a !== typeof b) return add('error', 'locale-shape', path, 'Arabic and English value types differ.');
    if (Array.isArray(a) && a.length !== b.length) return add('error', 'locale-length', path, 'Localized array lengths differ.');
    if (a && typeof a === 'object') for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) parity(a[k], b[k], `${path}.${k}`);
  };
  parity(libraries.ar, libraries.en, 'library');
  for (const c of libraries.en.categories) for (const lesson of c.lessons) {
    const arabic = libraries.ar.categories.find(x => x.id === c.id)?.lessons.find(x => x.id === lesson.id);
    const guide = edition.lessons[lesson.id];
    const badScript = /[\u0400-\u04ff\ufffd]/.test(lesson.content);
    lessons.push({ id: lesson.id, course: c.order, title: lesson.title, englishCharacters: lesson.content.length, arabicCharacters: arabic?.content.length || 0,
      corruptedText: badScript, checkpoint: Boolean(guide?.checkpoint), sources: guide?.sources?.length || 0 });
    if (badScript) add('error', 'corrupt-english-lesson', lesson.id, 'Unexpected Cyrillic or replacement characters in English teaching copy.');
    if (!guide || !arabic) add('error', 'missing-lesson-locale-guide', lesson.id, 'Explanation, localized guide and checkpoint must all exist.');
    if (lesson.content.length < 850 || (arabic?.content.length || 0) < 650) add('review', 'short-explanation', lesson.id, 'Review explanation depth separately from its applied guide.');
    if (!guide?.sources?.length) add('review', 'missing-primary-reference', lesson.id, 'No primary reference attached to this guide.');
  }
  walk(libraries.en, 'en', (text, path) => {
    if (/[\u0600-\u06ff]/.test(text)) add('error', 'untranslated-english', path, 'Unexpected Arabic text in English data.');
    if (/\ufffd|Ã|â€/.test(text)) add('error', 'broken-encoding', path, 'Encoding anomaly.');
  });
  for (const kind of ['labs', 'challenges']) {
    const entries = libraries.en[kind];
    if (new Set(entries.map(x => x.verify_q)).size < entries.length) add('review', 'repeated-practice-stem', kind, `${entries.length} items contain repeated generic verification stems.`);
  }
  for (const bankName of ['exam-bank', 'course-exam-bank', 'path-exam-bank', 'practical-bank', 'practice-quiz-bank']) {
    const bank = parse(bankName);
    const groups = Array.isArray(bank) && bank[0]?.question ? { foundations: bank } : bank;
    for (const [id, questions] of Object.entries(groups)) {
      let lengthCue = 0;
      for (const question of questions) {
        const check = question.options;
        if (!check || !Number.isInteger(question.answer) || question.answer < 0 || question.answer >= check.length) {
          add('error', 'invalid-private-question', `${bankName}/${id}`, 'Question schema invalid.'); continue;
        }
        for (const lang of ['ar', 'en']) if (!question.question?.[lang] || check.some(option => !option?.[lang])) add('error', 'missing-assessment-locale', `${bankName}/${id}`, 'Question or option is missing a locale.');
        if (['ar', 'en'].every(lang => check[question.answer][lang].length > Math.max(...check.filter((_, i) => i !== question.answer).map(x => x[lang].length)))) lengthCue++;
      }
      assessment.push({ bank: bankName, group: id, questions: questions.length, correctAnswerUniquelyLongestBothLanguages: lengthCue });
      if (questions.length > 2 && lengthCue / questions.length >= 0.8) add('review', 'assessment-length-cue', `${bankName}/${id}`, `${lengthCue}/${questions.length} answers are uniquely longest in both languages; distractors need editorial calibration.`);
    }
  }
  inventory = { ...inventory, programCourses: libraries.en.categories.length, programLessons: lessons.length, programTools: libraries.en.tools.length,
    practiceQuizSets: libraries.en.quizzes.length, programLabs: libraries.en.labs.length, programChallenges: libraries.en.challenges.length, operationRooms: libraries.en.operations.length,
    assessedCourseBanks: assessment.filter(x => x.bank === 'course-exam-bank').length, specialtyExamBanks: assessment.filter(x => x.bank === 'path-exam-bank').length };
}
const report = { generatedAt: new Date().toISOString(), scope: 'Academy: static inventory, metadata, localization structure, technical contracts and assessment quality heuristics. Not an independent expert certification.',
  privateAvailable, inventory, pages, lessons, assessment, findings,
  summary: { errors: findings.filter(x => x.severity === 'error').length, editorialReviews: findings.filter(x => x.severity === 'review').length } };
const outputIndex = process.argv.indexOf('--output');
if (outputIndex >= 0) writeFileSync(resolve(process.argv[outputIndex + 1]), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ inventory, summary: report.summary, errors: findings.filter(x => x.severity === 'error'), editorialCodes: [...new Set(findings.filter(x => x.severity === 'review').map(x => x.code))] }, null, 2));
if (process.argv.includes('--strict') && report.summary.errors) process.exitCode = 1;
