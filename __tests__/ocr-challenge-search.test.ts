import { describe, expect, test } from 'vitest';
import { filterOcrChallenges } from '../lib/exercises/ocr-challenge-search';
import { OCR_CHALLENGES } from '../lib/exercises/ocr-challenges';

// Mirrors __tests__/ocr-challenge-deadlines.test.ts - the /python list's
// find-as-you-type filter (requirements.md §8.14) is a pure function, so
// its match rules are covered here rather than through the rendered list.
describe('filterOcrChallenges', () => {
  test('an empty query returns every challenge, order unchanged', () => {
    const result = filterOcrChallenges(OCR_CHALLENGES, '');
    expect(result).toHaveLength(OCR_CHALLENGES.length);
    expect(result[0]).toBe(OCR_CHALLENGES[0]);
    expect(result[result.length - 1]).toBe(
      OCR_CHALLENGES[OCR_CHALLENGES.length - 1]
    );
  });

  test('a whitespace-only query returns every challenge', () => {
    expect(filterOcrChallenges(OCR_CHALLENGES, '   ')).toHaveLength(
      OCR_CHALLENGES.length
    );
  });

  test('matches a title substring, case-insensitively', () => {
    for (const query of ['sudoku', 'SUDOKU', 'doku']) {
      const result = filterOcrChallenges(OCR_CHALLENGES, query);
      expect(result.map((c) => c.id)).toContain('ocr-sudoku');
    }
  });

  test('matches the booklet number as a substring', () => {
    const exact = filterOcrChallenges(OCR_CHALLENGES, '44');
    expect(exact.map((c) => c.id)).toContain('ocr-sudoku');

    // "4" is a substring of 4, 14, 24, 34, 40-49, 54, 64, 74 - so it
    // matches many, not one.
    expect(filterOcrChallenges(OCR_CHALLENGES, '4').length).toBeGreaterThan(1);
  });

  test('matches on description text alone', () => {
    // "recursion" appears in several challenge descriptions ("Solve this
    // using both loops and recursion") but in no challenge title.
    const result = filterOcrChallenges(OCR_CHALLENGES, 'recursion');
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((c) => !c.title.toLowerCase().includes('recursion'))
    ).toBe(true);
  });

  test('returns an empty array when nothing matches', () => {
    expect(filterOcrChallenges(OCR_CHALLENGES, 'zznomatch')).toEqual([]);
  });

  test('preserves booklet order in the filtered result', () => {
    const result = filterOcrChallenges(OCR_CHALLENGES, 'the');
    const numbers = result.map((c) => c.number);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });
});
