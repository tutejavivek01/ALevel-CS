import { describe, expect, test } from 'vitest';
import { TOPICS } from '../lib/spec/topics';
import {
  EXAM_CHAPTERS,
  getExamChaptersForTopic,
  getExamQuestionById,
} from '../lib/exercises/exam-question-bank';

// specs/exam-question-bank/design.md §1, requirements.md §1 - the seed
// JSON (reference/aqa_cs_question_bank.json) is the source of truth;
// these totals guard against a future re-ingestion silently dropping
// content, exactly as the source file's own header states them.
describe('exam question bank (EXAM_CHAPTERS)', () => {
  test('computed totals match the source file exactly (177 questions, 789 marks)', () => {
    let totalQuestions = 0;
    let totalMarks = 0;
    let needsReviewCount = 0;
    for (const chapter of EXAM_CHAPTERS) {
      totalQuestions += chapter.questions.length;
      for (const q of chapter.questions) {
        totalMarks += q.marks;
        if (q.needsReview) needsReviewCount++;
      }
    }
    expect(totalQuestions).toBe(177);
    expect(totalMarks).toBe(789);
    expect(needsReviewCount).toBe(73);
  });

  test('every question has a unique, non-empty id', () => {
    const ids = EXAM_CHAPTERS.flatMap((c) => c.questions.map((q) => q.id));
    expect(ids.every((id) => id.trim().length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every chapter's specArea resolves to a real topic ref", () => {
    const realRefs = new Set(TOPICS.map((t) => t.ref));
    for (const chapter of EXAM_CHAPTERS) {
      expect(
        realRefs.has(chapter.specArea),
        `${chapter.chapter}: ${chapter.specArea}`
      ).toBe(true);
    }
  });

  test('every topic has at least one question', () => {
    for (const topic of TOPICS) {
      const chapters = getExamChaptersForTopic(topic.ref);
      const count = chapters.reduce((sum, c) => sum + c.questions.length, 0);
      expect(count, topic.ref).toBeGreaterThan(0);
    }
  });

  test('getExamQuestionById resolves a known id from each source shape', () => {
    expect(getExamQuestionById('ch1-q1')).toBeDefined();
    expect(getExamQuestionById('appA-q1')).toBeDefined(); // flat appendix
    expect(getExamQuestionById('not-a-real-id')).toBeUndefined();
  });

  test('a question missing a part-level mark is represented as undefined, not 0', () => {
    // At least one part somewhere in the bank has no readable marks -
    // confirm the normaliser preserves "unknown" rather than coercing it
    // to a false "worth nothing" zero (requirements.md §2.6).
    const partsWithNoMarks = EXAM_CHAPTERS.flatMap((c) => c.questions)
      .flatMap((q) => q.parts ?? [])
      .filter((p) => p.marks === undefined);
    expect(partsWithNoMarks.length).toBeGreaterThan(0);
  });
});
