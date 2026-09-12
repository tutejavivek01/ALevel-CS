import { describe, expect, test } from 'vitest';
import { TOPICS } from '../lib/spec/topics';
import {
  MASTERY_QUIZ_TOPICS,
  MASTERY_QUIZZES,
} from '../lib/exercises/mastery-quiz';
import {
  MASTERY_CHALLENGE_TOPICS,
  MASTERY_CHALLENGES,
} from '../lib/exercises/mastery-challenges';

// design.md §6.13 / requirements.md §12 - structural integrity for the
// mastery-gate content, mirroring __tests__/ocr-challenges.test.ts and
// __tests__/spec-integrity.test.ts's approach.
describe('mastery gate route lists', () => {
  test('every topic is covered by exactly one route (quiz or challenge)', () => {
    const allTopicIds = TOPICS.map((t) => t.id);
    const routed = [...MASTERY_QUIZ_TOPICS, ...MASTERY_CHALLENGE_TOPICS];
    expect(new Set(routed).size).toBe(routed.length); // no topic in both lists
    expect(new Set(routed)).toEqual(new Set(allTopicIds)); // every topic covered
  });
});

describe('mastery quiz content (MASTERY_QUIZZES)', () => {
  test('every quiz-route topic has exactly 10 questions', () => {
    for (const topicId of MASTERY_QUIZ_TOPICS) {
      expect(MASTERY_QUIZZES[topicId], topicId).toBeDefined();
      expect(MASTERY_QUIZZES[topicId].length, topicId).toBe(10);
    }
  });

  test('every question has a unique id, a non-empty prompt, and at least one accepted answer', () => {
    const allIds: string[] = [];
    for (const topicId of MASTERY_QUIZ_TOPICS) {
      for (const question of MASTERY_QUIZZES[topicId]) {
        allIds.push(question.id);
        expect(question.prompt.trim().length, question.id).toBeGreaterThan(0);
        expect(question.accept.length, question.id).toBeGreaterThan(0);
        for (const accepted of question.accept) {
          expect(accepted.trim().length, question.id).toBeGreaterThan(0);
        }
      }
    }
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  test("every multiple-choice question's accepted answer is one of its own options", () => {
    for (const topicId of MASTERY_QUIZ_TOPICS) {
      for (const question of MASTERY_QUIZZES[topicId]) {
        if (!question.options) continue;
        for (const accepted of question.accept) {
          expect(question.options, question.id).toContain(accepted);
        }
      }
    }
  });
});

describe('mastery programming-challenge content (MASTERY_CHALLENGES)', () => {
  test('every challenge-route topic has exactly 2 challenges', () => {
    for (const topicId of MASTERY_CHALLENGE_TOPICS) {
      expect(MASTERY_CHALLENGES[topicId], topicId).toBeDefined();
      expect(MASTERY_CHALLENGES[topicId].length, topicId).toBe(2);
    }
  });

  test('every challenge has a unique id and at least one real test case', () => {
    const allIds: string[] = [];
    for (const topicId of MASTERY_CHALLENGE_TOPICS) {
      for (const challenge of MASTERY_CHALLENGES[topicId]) {
        allIds.push(challenge.id);
        expect(challenge.title.trim().length, challenge.id).toBeGreaterThan(0);
        expect(
          challenge.description.trim().length,
          challenge.id
        ).toBeGreaterThan(0);
        expect(challenge.testCases.length, challenge.id).toBeGreaterThan(0);
        for (const testCase of challenge.testCases) {
          expect(testCase.expectedOutput.length, challenge.id).toBeGreaterThan(
            0
          );
        }
      }
    }
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});
