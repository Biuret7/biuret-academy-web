import { readFileSync } from 'node:fs';

const ORDER = { free: 0, plus: 1, pro: 2 };
const FREE = { course: 1, quiz: 1, lab: 1, challenge: 3, tool: 4, operation: 1 };
const PLUS = { course: 8, quiz: 8, lab: 4, challenge: 8, tool: 10, operation: 3 };
const cached = new Map();

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
    ? { ...quiz, questions: quiz.questions.map(({ ans, ...question }) => question) }
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
  return source[{ quiz: 'quizzes', lab: 'labs', challenge: 'challenges', operation: 'operations', tool: 'tools' }[kind]]?.[index] || null;
}

export function scoreLibraryPractice(kind, index, answers, language = 'ar') {
  const item = libraryItem(kind, index);
  if (!item) return null;
  const localized = language === 'en' ? libraryData('en')[{ quiz: 'quizzes', lab: 'labs', challenge: 'challenges' }[kind]]?.[index] : item;
  if (kind === 'quiz') {
    if (!Array.isArray(answers) || answers.length !== item.questions.length || answers.some((answer) => !Number.isInteger(answer))) return null;
    const correct = item.questions.reduce((sum, question, i) => sum + Number(answers[i] === question.ans), 0);
    const english = libraryData('en').quizzes[index];
    return { correct, count: item.questions.length, review: item.questions.map((question, i) => ({
      question: localized.questions[i].q, answer: localized.questions[i].opts[question.ans],
      text: { ar: { question: question.q, answer: question.opts[question.ans] },
        en: { question: english.questions[i].q, answer: english.questions[i].opts[question.ans] } },
      missed: answers[i] !== question.ans,
    })) };
  }
  if (!['lab', 'challenge'].includes(kind) || !Number.isInteger(answers)) return null;
  return { correct: Number(answers === item.verify_ans), count: 1 };
}
