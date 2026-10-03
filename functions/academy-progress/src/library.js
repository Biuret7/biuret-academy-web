import { readFileSync } from 'node:fs';

const ORDER = { free: 0, plus: 1, pro: 2 };
const FREE = { course: 1, quiz: 1, lab: 1, challenge: 3, tool: 4, operation: 1 };
const PLUS = { course: 8, quiz: 8, lab: 4, challenge: 8, tool: 10, operation: 3 };
const cached = new Map();
let practiceBankCache;

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
        !Array.isArray(item.options) || item.options.length !== 3 || item.answer < 0 || item.answer >= item.options.length ||
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
    cached.set(language, JSON.parse(readFileSync(file, 'utf8')));
  }
  return cached.get(language);
}

export function requiredLibraryPlan(kind, index) {
  if (!Number.isInteger(index) || index < 0 || !(kind in FREE)) return 'pro';
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
    lessons: category.lessons.map((lesson) => keep('course', category.order) ? lesson : {
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
    if (!quiz || !Array.isArray(answers) || answers.length !== quiz.length || answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 2)) return null;
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
  if (!['lab', 'challenge'].includes(kind) || !Number.isInteger(answers)) return null;
  return { correct: Number(answers === item.verify_ans), count: 1 };
}
