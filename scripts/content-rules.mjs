import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// These IDs and formative answers are also enforced by academy-progress.
// Changing them requires a coordinated server migration and exam version.
export const VERIFIED_LESSONS = [
  ['url-safety', [['url-parts', 1], ['url-traps', 1], ['url-decision', 2]]],
  ['identity-access', [['identity-passwords', 1], ['identity-sessions', 1], ['identity-least-privilege', 1]]],
  ['evidence-response', [['evidence-logs', 1], ['evidence-integrity', 0], ['evidence-triage', 2]]],
];

export function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

const baseline = JSON.parse(readFileSync(new URL('../content/releases/foundations-2026-09-27.json', import.meta.url), 'utf8'));
if (digest(baseline) !== '3c71479b1c9e44bb501a9eda5549e3062c61b9f22b3da6118d20b16d70675678') {
  throw new Error('Foundations assessment baseline changed');
}
const baselineChecks = Object.fromEntries(baseline.lessons.map((lesson) => [lesson.id, lesson.check]));

function localized(value, at, errors) {
  if (!value || typeof value !== 'object' || ['ar', 'en'].some((language) => typeof value[language] !== 'string' || !value[language].trim())) {
    errors.push(`${at}: Arabic and English text required`);
  }
}

export function validatePack(pack) {
  const errors = [];
  if (pack?.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (pack?.learningPath?.id !== 'foundations') errors.push('path must be foundations');
  if (!Array.isArray(pack?.courses) || !Array.isArray(pack?.lessons)) return [...errors, 'courses and lessons must be arrays'];
  localized(pack.learningPath?.title, 'path.title', errors);
  localized(pack.learningPath?.summary, 'path.summary', errors);
  if (pack.learningPath?.nodes?.length !== 4) errors.push('roadmap must have three courses and one exam');
  const ids = new Set();
  for (const [courseIndex, [courseId, expectedLessons]] of VERIFIED_LESSONS.entries()) {
    const course = pack.courses[courseIndex];
    const node = pack.learningPath?.nodes?.[courseIndex];
    if (course?.id !== courseId || course?.pathId !== 'foundations') errors.push(`course ${courseIndex + 1}: published ID/order changed`);
    if (node?.id !== courseId || node?.type !== 'course' || node?.state !== 'published') errors.push(`roadmap node ${courseIndex + 1}: published course changed`);
    localized(course?.title, `${courseId}.title`, errors);
    localized(course?.summary, `${courseId}.summary`, errors);
    localized(node?.title, `${courseId}.roadmap.title`, errors);
    localized(node?.description, `${courseId}.roadmap.description`, errors);
    if (!Array.isArray(course?.outcomes) || !course.outcomes.length) errors.push(`${courseId}: outcomes required`);
    else course.outcomes.forEach((item, i) => localized(item, `${courseId}.outcomes.${i}`, errors));
    if (JSON.stringify(course?.lessonIds) !== JSON.stringify(expectedLessons.map(([id]) => id))) errors.push(`${courseId}: verified lesson order changed`);
    for (const [lessonIndex, [lessonId, answer]] of expectedLessons.entries()) {
      const lesson = pack.lessons.find((item) => item.id === lessonId);
      if (!lesson || lesson.courseId !== courseId || lesson.order !== lessonIndex + 1) { errors.push(`${lessonId}: verified lesson mapping changed`); continue; }
      ids.add(lessonId);
      localized(lesson.title, `${lessonId}.title`, errors);
      localized(lesson.summary, `${lessonId}.summary`, errors);
      if (!Array.isArray(lesson.sections) || !lesson.sections.length) errors.push(`${lessonId}: sections required`);
      else lesson.sections.forEach((section, i) => { localized(section.title, `${lessonId}.sections.${i}.title`, errors); localized(section.body, `${lessonId}.sections.${i}.body`, errors); });
      if (lesson.exampleLabel) localized(lesson.exampleLabel, `${lessonId}.exampleLabel`, errors);
      if (typeof lesson.example !== 'string' || !lesson.example.trim()) errors.push(`${lessonId}: example required`);
      localized(lesson.check?.question, `${lessonId}.check.question`, errors);
      localized(lesson.check?.explanation, `${lessonId}.check.explanation`, errors);
      if (!Array.isArray(lesson.check?.options) || lesson.check.options.length !== 3) errors.push(`${lessonId}: three check options required`);
      else lesson.check.options.forEach((option, i) => localized(option, `${lessonId}.check.options.${i}`, errors));
      if (lesson.check?.answer !== answer) errors.push(`${lessonId}: server-verified answer changed`);
      if (JSON.stringify(lesson.check?.question) !== JSON.stringify(baselineChecks[lessonId].question) ||
        JSON.stringify(lesson.check?.options) !== JSON.stringify(baselineChecks[lessonId].options)) {
        errors.push(`${lessonId}: published check wording or options changed; coordinate a server assessment release`);
      }
    }
  }
  if (pack.courses.length !== 3 || pack.lessons.length !== 9 || ids.size !== 9) errors.push('current release must contain exactly three courses and nine verified lessons');
  const exam = pack.learningPath?.nodes?.[3];
  if (exam?.id !== 'foundations-final' || exam?.type !== 'exam' || exam?.state !== 'published') errors.push('final exam roadmap contract changed');
  localized(exam?.title, 'exam.title', errors);
  localized(exam?.description, 'exam.description', errors);
  return errors;
}

export function renderLearningModule(pack) {
  return `// Generated from a reviewed content release. Edit content/drafts and run the release workflow.\n` +
    `export const learningPath = ${JSON.stringify(pack.learningPath, null, 2)};\n\n` +
    `export const courses = ${JSON.stringify(pack.courses, null, 2)};\n\n` +
    `export const lessons = ${JSON.stringify(pack.lessons, null, 2)};\n\n` +
    `export const courseById = Object.fromEntries(courses.map((course) => [course.id, course]));\n` +
    `export const lessonById = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));\n` +
    `export const localized = (value, language) => value?.[language] || value?.ar || '';\n`;
}
