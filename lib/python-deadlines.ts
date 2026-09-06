import type { PythonProblem } from './db/use-python-problems';
import type { PythonReviewStatus } from './exercises/python-review-status';
import { daysBetween } from './date-utils';
import { PYTHON_DUE_UPCOMING_WINDOW_DAYS } from './config';

export type PythonDeadline = {
  problem: PythonProblem;
  status: 'upcoming' | 'overdue';
  dueDate: string;
};

// requirements.md §8.1: Python problems get the same due-date banner
// treatment as NEA sections (lib/nea-progress.ts's getNeaDeadlines) -
// overdue once the due date has passed, upcoming within the window -
// except "done" here means the derived status is 'reviewed', not a
// stored 'complete' flag (there is no such column on python_problems).
export function getPythonDeadlines(
  problems: PythonProblem[],
  reviewStatuses: Record<number, PythonReviewStatus>,
  today: Date = new Date()
): PythonDeadline[] {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const deadlines: PythonDeadline[] = [];

  for (const problem of problems) {
    const status = reviewStatuses[problem.id] ?? 'not-started';
    if (status === 'reviewed' || !problem.due_date) continue;

    const [year, month, day] = problem.due_date.split('-').map(Number);
    const due = new Date(year, month - 1, day);
    const diffDays = daysBetween(todayMidnight, due);

    if (diffDays < 0) {
      deadlines.push({ problem, status: 'overdue', dueDate: problem.due_date });
    } else if (diffDays <= PYTHON_DUE_UPCOMING_WINDOW_DAYS) {
      deadlines.push({ problem, status: 'upcoming', dueDate: problem.due_date });
    }
  }

  return deadlines;
}
