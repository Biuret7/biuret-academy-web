import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { libraryData, publicLibraryFor, scoreLibraryPractice } from '../functions/academy-progress/src/library.js';

const bankFile = new URL('../functions/academy-progress/practice-quiz-bank.private.json', import.meta.url);

test('practice quizzes use their own server bank, distinct from every course exam', { skip: !existsSync(bankFile) }, () => {
  const bank = JSON.parse(readFileSync(bankFile, 'utf8'));
  const admin = { plan: 'free', effectivePlan: 'free', admin: true };
  assert.equal(bank.length, 12);
  for (const language of ['ar', 'en']) {
    const practice = publicLibraryFor(language, admin, true).quizzes;
    const examQuestions = new Set(libraryData(language).quizzes.flatMap((quiz) => quiz.questions.map((question) => question.q.trim().replace(/\s+/g, ' ').toLocaleLowerCase())));
    assert.equal(practice.length, 12);
    for (const [index, quiz] of practice.entries()) {
      assert.equal(quiz.questions.length, bank[index].length, `quiz ${index}`);
      assert.ok(quiz.questions.length >= 3);
      for (const question of quiz.questions) {
        assert.ok(question.opts.length >= 3 && question.opts.length <= 5);
        assert.equal(Object.hasOwn(question, 'ans'), false);
        assert.equal(examQuestions.has(question.q.trim().replace(/\s+/g, ' ').toLocaleLowerCase()), false,
          `practice quiz ${index} repeats a course exam question`);
      }
      const answers = bank[index].map((question) => question.answer);
      const scored = scoreLibraryPractice('quiz', index, answers, language);
      assert.deepEqual([scored.correct, scored.count], [answers.length, answers.length]);
      assert.ok(scored.review.every((question) => !question.missed && question.text.ar.question && question.text.en.question));
    }
  }
  const free = publicLibraryFor('en', { plan: 'free', effectivePlan: 'free', admin: false }, false);
  assert.ok(free.quizzes[0].questions.length >= 3);
  assert.equal(free.quizzes[1].locked, true);
  assert.equal(free.quizzes[1].questions.length, 0);
  assert.equal(scoreLibraryPractice('quiz', 0, [0]), null);
  assert.equal(scoreLibraryPractice('quiz', 0, [5, 0, 0]), null);
});

test('public quiz responses are built from practice bank, not the course exam bank', () => {
  const source = readFileSync(new URL('../functions/academy-progress/src/library.js', import.meta.url), 'utf8');
  assert.match(source, /practiceQuizBank\(\)\[index\]/);
  assert.doesNotMatch(source, /quiz\.questions\.map\(\(\{ ans/);
});
