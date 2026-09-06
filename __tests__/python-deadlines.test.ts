import { describe, expect, test } from 'vitest';
import { getPythonDeadlines } from '../lib/python-deadlines';
import type { PythonProblem } from '../lib/db/use-python-problems';

const today = new Date(2026, 0, 15); // 15 Jan 2026

function makeProblem(overrides: Partial<PythonProblem>): PythonProblem {
  return {
    id: 1,
    title: 'Test problem',
    description: '',
    starter_code: null,
    due_date: null,
    created_by: 'someone',
    created_at: '2026-01-01T00:00:00.000Z',
    submitted_for_review_at: null,
    ...overrides,
  };
}

describe('getPythonDeadlines', () => {
  test('no due dates means no deadlines', () => {
    expect(getPythonDeadlines([makeProblem({})], {}, today)).toEqual([]);
  });

  test('a past due date on a non-reviewed problem is overdue', () => {
    const problem = makeProblem({ id: 1, due_date: '2026-01-10' });
    const deadlines = getPythonDeadlines([problem], { 1: 'attempted' }, today);
    expect(deadlines).toHaveLength(1);
    expect(deadlines[0].status).toBe('overdue');
    expect(deadlines[0].problem.id).toBe(1);
  });

  test('a due date within the window is upcoming', () => {
    const problem = makeProblem({ id: 2, due_date: '2026-01-25' }); // 10 days out
    const deadlines = getPythonDeadlines([problem], { 2: 'not-started' }, today);
    expect(deadlines).toHaveLength(1);
    expect(deadlines[0].status).toBe('upcoming');
  });

  test('a due date beyond the window is not surfaced', () => {
    const problem = makeProblem({ id: 3, due_date: '2026-03-01' });
    expect(getPythonDeadlines([problem], { 3: 'not-started' }, today)).toEqual([]);
  });

  test('a reviewed problem is never surfaced, even if overdue', () => {
    const problem = makeProblem({ id: 4, due_date: '2026-01-01' });
    expect(getPythonDeadlines([problem], { 4: 'reviewed' }, today)).toEqual([]);
  });

  test('a missing status entry defaults to not-started, not reviewed', () => {
    const problem = makeProblem({ id: 5, due_date: '2026-01-01' });
    const deadlines = getPythonDeadlines([problem], {}, today);
    expect(deadlines).toHaveLength(1);
    expect(deadlines[0].status).toBe('overdue');
  });
});
