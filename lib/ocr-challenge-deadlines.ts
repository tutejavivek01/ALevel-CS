import { OCR_CHALLENGES, type OcrChallenge } from './exercises/ocr-challenges';
import type { PythonReviewStatus } from './exercises/python-review-status';
import { daysBetween } from './date-utils';
import { NEA_UPCOMING_WINDOW_DAYS } from './config';

export type OcrChallengeDeadline = {
  challenge: OcrChallenge;
  status: 'upcoming' | 'overdue';
  dueDate: string;
};

// Shared by the list/detail pages' own overdue flag (design.md §6.11) and
// getOcrChallengeDeadlines below, so the "parse a YYYY-MM-DD date column
// as local midnight" logic exists exactly once.
export function isOcrChallengeOverdue(dueDate: string, today: Date = new Date()): boolean {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [year, month, day] = dueDate.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  return daysBetween(todayMidnight, due) < 0;
}

// requirements.md §8.13 / design.md §6.11: reuses NEA_UPCOMING_WINDOW_DAYS
// rather than a dedicated OCR constant (resolving requirements.md §10's
// open question in favor of not inventing a second window) - a challenge
// past its due date and not yet reviewed is overdue, one within the
// window is upcoming. Fresh module, not a repurposed lib/python
// -deadlines.ts (deleted in task 38 along with the retired ad hoc
// problem source it was written for) - due_date now lives on
// ocr_challenge_review_state, keyed by a code-defined challenge id
// rather than a python_problems row.
export function getOcrChallengeDeadlines(
  dueDates: Record<string, string | null | undefined>,
  reviewStatuses: Record<string, PythonReviewStatus>,
  today: Date = new Date()
): OcrChallengeDeadline[] {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const deadlines: OcrChallengeDeadline[] = [];

  for (const challenge of OCR_CHALLENGES) {
    const status = reviewStatuses[challenge.id] ?? 'not-started';
    const dueDate = dueDates[challenge.id];
    if (status === 'reviewed' || !dueDate) continue;

    if (isOcrChallengeOverdue(dueDate, today)) {
      deadlines.push({ challenge, status: 'overdue', dueDate });
    } else {
      const [year, month, day] = dueDate.split('-').map(Number);
      const due = new Date(year, month - 1, day);
      if (daysBetween(todayMidnight, due) <= NEA_UPCOMING_WINDOW_DAYS) {
        deadlines.push({ challenge, status: 'upcoming', dueDate });
      }
    }
  }

  return deadlines;
}
