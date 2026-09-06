import { describe, expect, test } from 'vitest';
import { getNeaDeadlines, neaMarksWorthComplete } from '../lib/nea-progress';
import { NEA_SECTIONS } from '../lib/spec/nea';
import type { NeaStateMap } from '../lib/db/use-nea-state';

describe('neaMarksWorthComplete', () => {
  test('empty state is 0', () => {
    expect(neaMarksWorthComplete({})).toBe(0);
  });

  test('only counts complete sections', () => {
    const state: NeaStateMap = {
      analysis: { status: 'complete', target_date: null }, // 9 marks
      design: { status: 'drafted', target_date: null }, // not counted
      testing: { status: 'complete', target_date: null }, // 8 marks
    };
    expect(neaMarksWorthComplete(state)).toBe(17);
  });

  test('all sections complete equals the full total', () => {
    const state: NeaStateMap = {};
    for (const section of NEA_SECTIONS) {
      state[section.id] = { status: 'complete', target_date: null };
    }
    const total = NEA_SECTIONS.reduce((sum, s) => sum + s.marks, 0);
    expect(neaMarksWorthComplete(state)).toBe(total);
  });
});

describe('getNeaDeadlines', () => {
  const today = new Date(2026, 0, 15); // 15 Jan 2026

  test('no target dates means no deadlines', () => {
    expect(getNeaDeadlines({}, today)).toEqual([]);
  });

  test('a past target date on an incomplete section is overdue', () => {
    const state: NeaStateMap = {
      analysis: { status: 'in-progress', target_date: '2026-01-10' },
    };
    const deadlines = getNeaDeadlines(state, today);
    expect(deadlines).toHaveLength(1);
    expect(deadlines[0].status).toBe('overdue');
    expect(deadlines[0].section.id).toBe('analysis');
  });

  test('a target date within the window is upcoming', () => {
    const state: NeaStateMap = {
      testing: { status: 'not-started', target_date: '2026-01-25' }, // 10 days out
    };
    const deadlines = getNeaDeadlines(state, today);
    expect(deadlines).toHaveLength(1);
    expect(deadlines[0].status).toBe('upcoming');
  });

  test('a target date beyond the window is not surfaced', () => {
    const state: NeaStateMap = {
      evaluation: { status: 'not-started', target_date: '2026-03-01' },
    };
    expect(getNeaDeadlines(state, today)).toEqual([]);
  });

  test('a complete section is never surfaced, even if overdue', () => {
    const state: NeaStateMap = {
      analysis: { status: 'complete', target_date: '2026-01-01' },
    };
    expect(getNeaDeadlines(state, today)).toEqual([]);
  });
});
