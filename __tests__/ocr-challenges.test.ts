import { describe, expect, test } from 'vitest';
import { OCR_CHALLENGES } from '../lib/exercises/ocr-challenges';

// Structural-validity check (design.md §6.8/§8), the same referential-
// integrity spirit as isKnownSubtopicId - it can't catch a *wrong*
// hand-derived test case (only re-deriving one from the booklet by hand
// can), but it does catch mechanical mistakes before they reach a
// student.
describe('OCR_CHALLENGES', () => {
  test('has all 80 challenges from the booklet', () => {
    expect(OCR_CHALLENGES).toHaveLength(80);
  });

  test('every id is unique', () => {
    const ids = OCR_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every booklet number is unique and present exactly once, 1-80', () => {
    const numbers = OCR_CHALLENGES.map((c) => c.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 80 }, (_, i) => i + 1));
  });

  test('every id follows the ocr-<slug> convention', () => {
    for (const challenge of OCR_CHALLENGES) {
      expect(challenge.id).toMatch(/^ocr-[a-z0-9-]+$/);
    }
  });

  test('every challenge has a non-empty title and description', () => {
    for (const challenge of OCR_CHALLENGES) {
      expect(challenge.title.trim().length).toBeGreaterThan(0);
      expect(challenge.description.trim().length).toBeGreaterThan(0);
    }
  });

  test('every declared extension is non-empty', () => {
    for (const challenge of OCR_CHALLENGES) {
      for (const extension of challenge.extensions ?? []) {
        expect(extension.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('every declared test case has a non-empty expected output', () => {
    for (const challenge of OCR_CHALLENGES) {
      for (const testCase of challenge.testCases ?? []) {
        expect(testCase.expectedOutput.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
