import { describe, expect, test } from 'vitest';
import {
  getOcrChallengeDeadlines,
  isOcrChallengeOverdue,
} from '../lib/ocr-challenge-deadlines';

// Mirrors __tests__/nea-progress.test.ts's getNeaDeadlines suite - the
// OCR challenge deadline logic (design.md §6.11, requirements.md §8.13)
// replaced the deleted lib/python-deadlines.ts and needs the same
// fixed-clock coverage its NEA counterpart has.
describe('isOcrChallengeOverdue', () => {
  const today = new Date(2026, 0, 15); // 15 Jan 2026

  test('a past date is overdue', () => {
    expect(isOcrChallengeOverdue('2026-01-14', today)).toBe(true);
  });

  test('today is not overdue', () => {
    expect(isOcrChallengeOverdue('2026-01-15', today)).toBe(false);
  });

  test('a future date is not overdue', () => {
    expect(isOcrChallengeOverdue('2026-01-16', today)).toBe(false);
  });
});

describe('getOcrChallengeDeadlines', () => {
  const today = new Date(2026, 0, 15); // 15 Jan 2026

  test('no due dates means no deadlines', () => {
    expect(getOcrChallengeDeadlines({}, {}, today)).toEqual([]);
  });

  test('a past due date on an un-reviewed challenge is overdue', () => {
    const deadlines = getOcrChallengeDeadlines(
      { 'ocr-factorial-finder': '2026-01-10' },
      { 'ocr-factorial-finder': 'attempted' },
      today
    );
    expect(deadlines).toHaveLength(1);
    expect(deadlines[0].status).toBe('overdue');
    expect(deadlines[0].challenge.id).toBe('ocr-factorial-finder');
  });

  test('a due date within the window is upcoming', () => {
    const deadlines = getOcrChallengeDeadlines(
      { 'ocr-speed-tracker': '2026-01-25' }, // 10 days out
      {},
      today
    );
    expect(deadlines).toHaveLength(1);
    expect(deadlines[0].status).toBe('upcoming');
  });

  test('a due date beyond the window is not surfaced', () => {
    expect(
      getOcrChallengeDeadlines({ 'ocr-thief': '2026-03-01' }, {}, today)
    ).toEqual([]);
  });

  test('a reviewed challenge is never surfaced, even if overdue', () => {
    expect(
      getOcrChallengeDeadlines(
        { 'ocr-factorial-finder': '2026-01-01' },
        { 'ocr-factorial-finder': 'reviewed' },
        today
      )
    ).toEqual([]);
  });

  test('a null due date is ignored', () => {
    expect(
      getOcrChallengeDeadlines({ 'ocr-factorial-finder': null }, {}, today)
    ).toEqual([]);
  });
});
