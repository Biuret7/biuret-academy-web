import { readFileSync } from 'node:fs';
import { additionalPaths } from './additional-paths.js';

const ORDER = { free: 0, plus: 1, pro: 2 };
const FREE = { course: 1, quiz: 1, lab: 1, challenge: 3, tool: 4, operation: 1 };
const PLUS = { course: 8, quiz: 8, lab: 4, challenge: 8, tool: 10, operation: 3 };
const cached = new Map();
let practiceBankCache;
let learningEdition;

function edition() {
  if (!learningEdition) {
    learningEdition = JSON.parse(process.env.ACADEMY_LEARNING_EDITION || readFileSync(new URL('../learning-edition.private.json', import.meta.url), 'utf8'));
    if (learningEdition.version !== 'learning-quality-20261004' || !learningEdition.lessons) throw new Error('Learning edition invalid');
    for (const guide of Object.values(learningEdition.lessons)) {
      const check = guide.checkpoint;
      if (!check || !Array.isArray(check.options) || check.options.length !== 4 || !Number.isInteger(check.answer) || check.answer < 0 || check.answer >= check.options.length ||
        !['ar', 'en'].every((lang) => typeof guide.concept?.[lang] === 'string' && typeof check.question?.[lang] === 'string' && check.options.every((option) => typeof option?.[lang] === 'string'))) throw new Error('Lesson checkpoint invalid');
    }
  }
  return learningEdition;
}

export function lessonCheckpoint(lessonId, answerIndex) {
  const check = edition().lessons[lessonId]?.checkpoint;
  if (!check || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= check.options.length) return null;
  return { correct: check.answer === answerIndex, explanation: check.explanation };
}

function publicLesson(lesson, language) {
  const guide = edition().lessons[lesson.id];
  if (!guide) throw new Error('Lesson missing from learning edition');
  const { answer, explanation, ...checkpoint } = guide.checkpoint;
  return { ...lesson, content: guide.concept[language], guide: {
    version: guide.version, minutes: guide.minutes, sources: guide.sources || [],
    ...Object.fromEntries(['concept', 'artifact', 'objectives', 'analysis', 'exercise', 'rubric'].map((field) => [field, guide[field][language]])),
    checkpoint: { question: checkpoint.question[language], options: checkpoint.options.map((option) => option[language]) },
  } };
}

const normalized = (value) => String(value).trim().replace(/\s+/g, ' ').toLocaleLowerCase();
function practiceQuizBank() {
  if (practiceBankCache) return practiceBankCache;
  const bank = JSON.parse(process.env.ACADEMY_PRACTICE_QUIZ_BANK || readFileSync(new URL('../practice-quiz-bank.private.json', import.meta.url), 'utf8'));
  const courses = libraryData('ar').quizzes;
  const exams = Object.fromEntries(['ar', 'en'].map((language) => [language,
    new Set(libraryData(language).quizzes.flatMap((quiz) => quiz.questions.map((question) => normalized(question.q))))]));
  if (!Array.isArray(bank) || bank.length !== courses.length) throw new Error('Private practice quiz bank invalid');
  const ids = new Set();
  const questions = new Set();
  for (const group of bank) {
    if (!Array.isArray(group) || group.length < 3) throw new Error('Private practice quiz bank invalid');
    for (const item of group) {
      if (!item || !/^[a-z0-9-]+$/.test(item.id) || ids.has(item.id) || !Number.isInteger(item.answer) ||
        !Array.isArray(item.options) || item.options.length < 3 || item.options.length > 5 || item.answer < 0 || item.answer >= item.options.length ||
        !['ar', 'en'].every((language) => typeof item.question?.[language] === 'string' && item.question[language].length > 12 &&
          item.options.every((option) => typeof option?.[language] === 'string' && option[language].length > 2) &&
          !exams[language].has(normalized(item.question[language])) && !questions.has(`${language}:${normalized(item.question[language])}`))) {
        throw new Error('Private practice quiz bank invalid or overlaps course exams');
      }
      ids.add(item.id);
      for (const language of ['ar', 'en']) questions.add(`${language}:${normalized(item.question[language])}`);
    }
  }
  practiceBankCache = bank;
  return bank;
}

export function libraryData(language = 'ar') {
  if (!['ar', 'en'].includes(language)) throw new Error('Invalid library language');
  if (!cached.has(language)) {
    const file = new URL(`../desktop-library.${language}.private.json`, import.meta.url);
    const source = JSON.parse(readFileSync(file, 'utf8'));
    const existing = new Set(source.roadmapPaths.map((path) => path[2]));
    source.roadmapPaths.push(...additionalPaths[language].filter((path) => !existing.has(path[2])));
    cached.set(language, source);
  }
  return cached.get(language);
}

export const programPathIds = () => libraryData('ar').roadmapPaths.map((path) => path[2]);

export function requiredLibraryPlan(kind, index) {
  if (!Number.isInteger(index) || index < 0 || !(kind in FREE)) return 'pro';
  // Keep the existing GRC path's Plus access when adding its dedicated course/quiz.
  if ((kind === 'course' && index === 19) || (kind === 'quiz' && index === 12)) return 'plus';
  const position = kind === 'course' ? index : index + 1;
  return position <= FREE[kind] ? 'free' : position <= PLUS[kind] ? 'plus' : 'pro';
}

export function mayAccessLibrary(kind, index, membership, foundationsPassed) {
  if (membership.admin) return true;
  const tier = requiredLibraryPlan(kind, index);
  return (ORDER[membership.effectivePlan || membership.plan] ?? -1) >= ORDER[tier] && (tier === 'free' || foundationsPassed);
}

export function publicLibraryFor(language, membership, foundationsPassed) {
  const source = libraryData(language);
  const keep = (kind, index) => mayAccessLibrary(kind, index, membership, foundationsPassed);
  const categories = source.categories.map((category) => ({
    ...category,
    locked: !keep('course', category.order),
    lessons: category.lessons.map((lesson) => keep('course', category.order) ? publicLesson(lesson, language) : {
      id: lesson.id, title: lesson.title, difficulty: lesson.difficulty, order: lesson.order,
    }),
  }));
  const tools = source.tools.map((tool, index) => keep('tool', index) ? tool : { name: tool.name, category: tool.category, locked: true });
  const quizzes = source.quizzes.map((quiz, index) => keep('quiz', index)
    ? { name: quiz.name, topics: quiz.topics, questions: practiceQuizBank()[index].map((item) => ({
      q: item.question[language], opts: item.options.map((option) => option[language]),
    })) }
    : { name: quiz.name, topics: quiz.topics, questions: [], locked: true });
  const challenges = source.challenges.map((item, index) => keep('challenge', index)
    ? { ...item, verify_ans: undefined }
    : { name: item.name, desc: item.desc, locked: true });
  const labs = source.labs.map((item, index) => keep('lab', index)
    ? { ...item, verify_ans: undefined }
    : { name: item.name, desc: item.desc, locked: true });
  const operations = source.operations.map((item, index) => keep('operation', index)
    ? item
    : { id: item.id, title: item.title, summary: item.summary, locked: true });
  return { source: source.source, categories, tools, quizzes, challenges, labs, operations, roadmapPaths: source.roadmapPaths, certifications: source.certifications };
}

export function libraryItem(kind, index) {
  const source = libraryData('ar');
  if (kind === 'lesson') {
    for (const category of source.categories) {
      const lesson = category.lessons.find((item) => item.id === index);
      if (lesson) return { category, lesson };
    }
    return null;
  }
  return source[{ lab: 'labs', challenge: 'challenges', operation: 'operations', tool: 'tools' }[kind]]?.[index] || null;
}

export function scoreLibraryPractice(kind, index, answers, language = 'ar') {
  if (kind === 'quiz') {
    const quiz = practiceQuizBank()[index];
    if (!quiz || !Array.isArray(answers) || answers.length !== quiz.length || answers.some((answer, i) => !Number.isInteger(answer) || answer < 0 || answer >= quiz[i].options.length)) return null;
    const lang = language === 'en' ? 'en' : 'ar';
    const correct = quiz.reduce((sum, question, i) => sum + Number(answers[i] === question.answer), 0);
    return { correct, count: quiz.length, review: quiz.map((question, i) => ({
      question: question.question[lang], answer: question.options[question.answer][lang],
      text: { ar: { question: question.question.ar, answer: question.options[question.answer].ar },
        en: { question: question.question.en, answer: question.options[question.answer].en } },
      missed: answers[i] !== question.answer,
    })) };
  }
  const item = libraryItem(kind, index);
  if (!item) return null;
  if (!['lab', 'challenge'].includes(kind) || !Number.isInteger(answers) || answers < 0 || answers >= item.verify_opts.length) return null;
  const local = libraryData(language === 'en' ? 'en' : 'ar')[kind === 'lab' ? 'labs' : 'challenges'][index];
  return { correct: Number(answers === item.verify_ans), count: 1, explanation: local.explanation || local.hint || '' };
}
