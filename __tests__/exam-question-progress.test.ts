import { describe, expect, test } from 'vitest';
import {
  computeExamGateStatus,
  computeTopicExamProgress,
} from '../lib/exercises/exam-question-progress';
import type { ExamChapter } from '../lib/exercises/exam-question-bank';
import type { ExamQuestionAttempt } from '../lib/db/use-exam-question-attempts';

// specs/exam-question-bank/design.md §4, requirements.md §5.2 - the
// 50%/70% threshold is the load-bearing logic for the third mastery-gate
// route, so its boundary conditions get direct, fixed-fixture coverage
// (conventions.md: "Vitest for anything with a right answer").

function fixtureChapter(
  questions: { id: string; marks: number }[]
): ExamChapter {
  return {
    chapter: 1,
    title: 'Fixture chapter',
    specArea: '4.1',
    specAreaTitle: 'Fixtures',
    level: 'AS / A Level (Year 12)',
    questions: questions.map((q) => ({
      id: q.id,
      number: 1,
      pdfPage: 1,
      sourceExam: null,
      text: 'fixture question',
      marks: q.marks,
      marksPartial: false,
      marksUnreadable: false,
      hasFigure: false,
      needsReview: false,
    })),
  };
}

function markedAttempt(
  questionId: string,
  awarded: number,
  max: number
): ExamQuestionAttempt {
  return {
    id: Math.random(),
    question_id: questionId,
    part: '',
    topic_id: '4.1',
    student_id: 'student-1',
    answer: 'an answer',
    marking_status: 'marked',
    awarded,
    max,
    credited: [],
    missed: [],
    model_answer: '',
    misconceptions: [],
    confidence: 1,
    failure_reason: null,
    created_at: new Date().toISOString(),
    marked_at: new Date().toISOString(),
  };
}

describe('computeExamGateStatus', () => {
  test('no attempts at all - not passed, both percentages 0', () => {
    const chapters = [
      fixtureChapter([
        { id: 'q1', marks: 10 },
        { id: 'q2', marks: 10 },
      ]),
    ];
    const result = computeExamGateStatus(chapters, {});
    expect(result.passed).toBe(false);
    expect(result.coveragePct).toBe(0);
    expect(result.qualityPct).toBe(0);
  });

  test('coverage met, quality not met (attempted half the marks, scored poorly)', () => {
    const chapters = [
      fixtureChapter([
        { id: 'q1', marks: 10 },
        { id: 'q2', marks: 10 },
      ]),
    ];
    const attempts = { 'q1:': markedAttempt('q1', 3, 10) }; // 50% coverage, 30% quality
    const result = computeExamGateStatus(chapters, attempts);
    expect(result.coveragePct).toBe(0.5);
    expect(result.qualityPct).toBe(0.3);
    expect(result.passed).toBe(false);
  });

  test('quality met, coverage not met (scored well on a small fraction)', () => {
    const chapters = [
      fixtureChapter([
        { id: 'q1', marks: 10 },
        { id: 'q2', marks: 90 },
      ]),
    ];
    const attempts = { 'q1:': markedAttempt('q1', 10, 10) }; // 10% coverage, 100% quality
    const result = computeExamGateStatus(chapters, attempts);
    expect(result.coveragePct).toBe(0.1);
    expect(result.qualityPct).toBe(1);
    expect(result.passed).toBe(false);
  });

  test('both thresholds met exactly at the boundary (50%/70%) - passes', () => {
    const chapters = [
      fixtureChapter([
        { id: 'q1', marks: 10 },
        { id: 'q2', marks: 10 },
      ]),
    ];
    const attempts = { 'q1:': markedAttempt('q1', 7, 10) }; // 50% coverage, exactly 70% quality
    const result = computeExamGateStatus(chapters, attempts);
    expect(result.coveragePct).toBe(0.5);
    expect(result.qualityPct).toBe(0.7);
    expect(result.passed).toBe(true);
  });

  test('both thresholds comfortably exceeded - passes', () => {
    const chapters = [
      fixtureChapter([
        { id: 'q1', marks: 10 },
        { id: 'q2', marks: 10 },
      ]),
    ];
    const attempts = {
      'q1:': markedAttempt('q1', 9, 10),
      'q2:': markedAttempt('q2', 9, 10),
    };
    const result = computeExamGateStatus(chapters, attempts);
    expect(result.passed).toBe(true);
  });

  test('unmarkable and failed attempts count toward neither coverage nor quality', () => {
    const chapters = [
      fixtureChapter([
        { id: 'q1', marks: 10 },
        { id: 'q2', marks: 10 },
      ]),
    ];
    const attempts: Record<string, ExamQuestionAttempt> = {
      'q1:': {
        ...markedAttempt('q1', 10, 10),
        marking_status: 'unmarkable',
        awarded: null,
      },
      'q2:': {
        ...markedAttempt('q2', 10, 10),
        marking_status: 'failed',
        awarded: null,
      },
    };
    const result = computeExamGateStatus(chapters, attempts);
    expect(result.coveragePct).toBe(0);
    expect(result.qualityPct).toBe(0);
    expect(result.passed).toBe(false);
  });
});

describe('computeTopicExamProgress', () => {
  test('empty state', () => {
    const chapters = [fixtureChapter([{ id: 'q1', marks: 10 }])];
    const progress = computeTopicExamProgress(chapters, {});
    expect(progress.partsAttempted).toBe(0);
    expect(progress.totalParts).toBe(1);
    expect(progress.marksAvailable).toBe(10);
    expect(progress.marksAwarded).toBe(0);
    expect(progress.lastAttemptAt).toBeNull();
  });

  test('tallies marks awarded from marked attempts only, and surfaces misconceptions by frequency', () => {
    const chapters = [
      fixtureChapter([
        { id: 'q1', marks: 10 },
        { id: 'q2', marks: 5 },
      ]),
    ];
    const attempts: Record<string, ExamQuestionAttempt> = {
      'q1:': {
        ...markedAttempt('q1', 8, 10),
        misconceptions: ['confuses stack and queue'],
      },
      'q2:': {
        ...markedAttempt('q2', 5, 5),
        misconceptions: ['confuses stack and queue'],
      },
    };
    const progress = computeTopicExamProgress(chapters, attempts);
    expect(progress.partsAttempted).toBe(2);
    expect(progress.marksAwarded).toBe(13);
    expect(progress.topMisconceptions[0]).toEqual({
      text: 'confuses stack and queue',
      count: 2,
    });
  });
});
