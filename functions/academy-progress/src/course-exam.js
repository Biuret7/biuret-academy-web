import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { libraryData, mayAccessLibrary } from './library.js';

const VERSION = 'program-course-v1';
const DATABASE = '6aa56477002e28054068';
const ATTEMPTS = '6ab933b6001be5900662';
const QUIZ_INDEX = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8, 10: 9, 12: 10, 13: 11 };
let extraBank;

function extras() {
  if (!extraBank) {
    extraBank = JSON.parse(process.env.ACADEMY_COURSE_EXAM_BANK || readFileSync(new URL('../course-exam-bank.private.json', import.meta.url), 'utf8'));
    if ([11, 14, 15, 16, 17, 18].some((order) => !extraBank[order])) throw new Error('Private course exam bank incomplete');
    for (const order of Object.keys(extraBank)) {
      if (!/^([1-9]|1[0-8])$/.test(order)) throw new Error('Private course exam order invalid');
      const questions = extraBank[order];
      if (!Array.isArray(questions) || questions.length < 3 || questions.some((item) =>
        !/^[a-z0-9-]+$/.test(item.id) || !Number.isInteger(item.answer) || item.answer < 0 || item.answer >= item.options?.length ||
        !['ar', 'en'].every((lang) => typeof item.question?.[lang] === 'string' && item.question[lang].length > 10) ||
        !Array.isArray(item.options) || (item.options.length < 3 || item.options.length > 5) || item.options.some((option) =>
          !['ar', 'en'].every((lang) => typeof option?.[lang] === 'string' && option[lang])))) throw new Error('Private course exam bank invalid');
    }
  }
  return extraBank;
}

export function courseExamId(userId, order) {
  return `q_${createHash('sha256').update(`${userId}:${VERSION}:${order}`).digest('hex').slice(0, 32)}`;
}

function questions(order, language) {
  const index = QUIZ_INDEX[order];
  if (extras()[order]) return extras()[order]?.map((item) => ({ id: item.id, question: item.question[language], options: item.options.map((option) => option[language]), answer: item.answer })) || [];
  const original = libraryData('ar').quizzes[index];
  const localized = libraryData(language).quizzes[index];
  return original.questions.map((item, i) => ({ id: `q${i + 1}`, question: localized.questions[i].q,
    options: localized.questions[i].opts, answer: item.ans }));
}

export function courseExamService({ base, request, getRead, membership, foundationsPassed }) {
  const rowsBase = `${base}/tablesdb/${DATABASE}/tables/${ATTEMPTS}/rows`;
  function course(order, language = 'ar') {
    if (!Number.isInteger(order)) return null;
    return libraryData(language === 'en' ? 'en' : 'ar').categories.find((item) => item.order === order) || null;
  }
  async function passed(userId, order) {
    const result = await request(`${rowsBase}/${courseExamId(userId, order)}`);
    if (result.status === 404) return null;
    if (result.status !== 200) throw new Error('Course exam lookup failed');
    if (result.data.userId !== userId) throw new Error('Course exam ownership mismatch');
    const payload = JSON.parse(result.data.payload);
    if (payload.version !== VERSION || payload.courseOrder !== order || !payload.passed) throw new Error('Course exam record invalid');
    return { ...payload, completedAt: result.data.$createdAt };
  }
  async function state(userId, order, language = 'ar') {
    const item = course(order, language);
    if (!item) return { code: 404, data: { error: 'Course not found' } };
    const access = mayAccessLibrary('course', order, membership, foundationsPassed);
    const [read, completion] = await Promise.all([
      access && !membership.admin ? Promise.all(item.lessons.map((lesson) => getRead(userId, lesson.id))) : Promise.resolve([]),
      passed(userId, order),
    ]);
    const completedLessons = membership.admin ? item.lessons.length : read.filter(Boolean).length;
    const eligible = access && completedLessons === item.lessons.length;
    const bank = questions(order, language === 'en' ? 'en' : 'ar');
    const data = { courseOrder: order, courseId: item.id, title: item.title, access, eligible, completedLessons,
      requiredLessons: item.lessons.length, passed: Boolean(completion), score: completion?.score ?? null,
      totalQuestions: completion?.total || bank.length, passScore: Math.ceil((completion?.total || bank.length) * .8) };
    if (eligible && !completion) data.questions = bank.map(({ answer, ...question }) => question);
    return { code: 200, data };
  }
  async function submit(userId, order, answers) {
    const current = await state(userId, order);
    if (current.code !== 200) return current;
    if (!current.data.eligible) return { code: 403, data: { error: 'Complete and unlock all course lessons first' } };
    if (current.data.passed) return { code: 409, data: { error: 'Course exam already passed', ...current.data } };
    const bank = questions(order, 'ar');
    if (!answers || typeof answers !== 'object' || Array.isArray(answers) || Object.keys(answers).length !== bank.length ||
      bank.some((question) => !Object.hasOwn(answers, question.id) || !Number.isInteger(answers[question.id]) || answers[question.id] < 0 || answers[question.id] >= question.options.length)) {
      return { code: 400, data: { error: 'Answer every question once' } };
    }
    const score = bank.reduce((sum, question) => sum + Number(answers[question.id] === question.answer), 0);
    const passedExam = score >= current.data.passScore;
    if (passedExam) {
      const payload = JSON.stringify({ version: VERSION, courseOrder: order, score, total: bank.length, passed: true });
      const result = await request(rowsBase, { method: 'POST', body: JSON.stringify({ rowId: courseExamId(userId, order),
        data: { userId, payload }, permissions: [] }) });
      if (![201, 409].includes(result.status)) throw new Error('Course exam record failed');
    }
    return { code: 200, data: { score, total: bank.length, passScore: current.data.passScore, passed: passedExam } };
  }
  return { state, submit, passed };
}
