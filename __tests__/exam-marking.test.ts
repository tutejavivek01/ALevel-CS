import { describe, expect, test, afterEach } from 'vitest';
import { markExamAnswer } from '../lib/exam-marking/marker';

// specs/exam-question-bank/design.md §3/§6 - the stub marker is what lets
// this run without a real ANTHROPIC_API_KEY or network access; it's also
// exactly what the Playwright suite relies on via EXAM_MARKING_STUB=true
// in .env.local. This test covers the stub's own contract, and that the
// module fails honestly (not silently) with no key and no stub enabled.
describe('markExamAnswer', () => {
  const originalStub = process.env.EXAM_MARKING_STUB;
  const originalKey = process.env.ANTHROPIC_API_KEY;

  afterEach(() => {
    process.env.EXAM_MARKING_STUB = originalStub;
    process.env.ANTHROPIC_API_KEY = originalKey;
  });

  test('the stub marker awards full marks for a non-empty answer', async () => {
    process.env.EXAM_MARKING_STUB = 'true';
    const outcome = await markExamAnswer({
      chapterTitle: 'Programming basics',
      specArea: '4.1',
      partText: 'Explain what a variable is.',
      marks: 3,
      siblingParts: [],
      answer: 'A variable is a named location in memory that can change.',
      needsReview: false,
    });
    expect(outcome.status).toBe('marked');
    if (outcome.status === 'marked') {
      expect(outcome.result.awarded).toBe(3);
      expect(outcome.result.max).toBe(3);
      expect(outcome.result.unmarkable).toBe(false);
    }
  });

  test('the stub marker awards 0 for a whitespace-only answer', async () => {
    process.env.EXAM_MARKING_STUB = 'true';
    const outcome = await markExamAnswer({
      chapterTitle: 'Programming basics',
      specArea: '4.1',
      partText: 'Explain what a variable is.',
      marks: 3,
      siblingParts: [],
      answer: '   ',
      needsReview: false,
    });
    expect(outcome.status).toBe('marked');
    if (outcome.status === 'marked') {
      expect(outcome.result.awarded).toBe(0);
    }
  });

  test('fails honestly (not silently) with no API key and no stub enabled', async () => {
    delete process.env.EXAM_MARKING_STUB;
    delete process.env.ANTHROPIC_API_KEY;
    const outcome = await markExamAnswer({
      chapterTitle: 'Programming basics',
      specArea: '4.1',
      partText: 'Explain what a variable is.',
      marks: 3,
      siblingParts: [],
      answer: 'A variable is a named location in memory.',
      needsReview: false,
    });
    expect(outcome.status).toBe('failed');
  });
});
