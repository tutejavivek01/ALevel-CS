import { describe, expect, test } from 'vitest';
import {
  isEligibleToResurface,
  markMastered,
  markNotMastered,
  pickNextTerm,
  type GlossaryProgressMap,
} from '../lib/exercises/glossary-drill';
import type { GlossaryTerm } from '../lib/exercises/glossary';

const TERMS: GlossaryTerm[] = [
  { id: 'a', term: 'A', definition: 'a def' },
  { id: 'b', term: 'B', definition: 'b def' },
  { id: 'c', term: 'C', definition: 'c def' },
];

describe('markMastered / markNotMastered', () => {
  test('markMastered sets nextEligibleAt exactly 3 days later', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const result = markMastered(now);
    expect(result.mastered).toBe(true);
    expect(result.nextEligibleAt).toBe('2026-01-04T00:00:00.000Z');
  });

  test('markNotMastered clears mastery and any cooldown', () => {
    expect(markNotMastered()).toEqual({ mastered: false, nextEligibleAt: null });
  });
});

describe('isEligibleToResurface', () => {
  const now = new Date('2026-01-10T00:00:00.000Z');

  test('not mastered is never eligible', () => {
    expect(isEligibleToResurface({ mastered: false, nextEligibleAt: null }, now)).toBe(false);
  });

  test('mastered but still within the cooldown is not eligible', () => {
    expect(
      isEligibleToResurface({ mastered: true, nextEligibleAt: '2026-01-11T00:00:00.000Z' }, now)
    ).toBe(false);
  });

  test('mastered and past the cooldown is eligible', () => {
    expect(
      isEligibleToResurface({ mastered: true, nextEligibleAt: '2026-01-09T00:00:00.000Z' }, now)
    ).toBe(true);
  });

  test('exactly at the cooldown boundary is eligible', () => {
    expect(
      isEligibleToResurface({ mastered: true, nextEligibleAt: now.toISOString() }, now)
    ).toBe(true);
  });
});

describe('pickNextTerm', () => {
  const now = new Date('2026-01-10T00:00:00.000Z');

  test('with nothing mastered, always draws from the full set', () => {
    const progress: GlossaryProgressMap = {};
    // random() = 0 always picks index 0 of whichever pool is chosen.
    const term = pickNextTerm(TERMS, progress, now, () => 0);
    expect(term.id).toBe('a');
  });

  test('a mastered term still within its cooldown is excluded entirely', () => {
    const progress: GlossaryProgressMap = {
      a: { mastered: true, nextEligibleAt: '2026-01-20T00:00:00.000Z' }, // not yet eligible
    };
    // Even with a random() that would always choose the "eligible" pool
    // if given the chance, "a" must never be drawn since it isn't
    // eligible yet - only b/c are in play.
    for (let i = 0; i < 20; i++) {
      const term = pickNextTerm(TERMS, progress, now, () => 0);
      expect(term.id).not.toBe('a');
    }
  });

  test('an eligible mastered term is drawn roughly 1-in-5 times, not every time or never', () => {
    const progress: GlossaryProgressMap = {
      a: { mastered: true, nextEligibleAt: '2026-01-01T00:00:00.000Z' }, // eligible
    };
    // random() sequence: first call decides pool (eligible vs main),
    // second call picks within the pool. Feed a fixed low value so
    // "a" is chosen whenever the eligible pool is selected.
    let callCount = 0;
    const scriptedRandom = () => {
      callCount++;
      // Alternate: odd calls decide the pool, even calls pick within it.
      return callCount % 2 === 1 ? 0.1 : 0; // 0.1 < 0.2 threshold -> eligible pool
    };
    const term = pickNextTerm(TERMS, progress, now, scriptedRandom);
    expect(term.id).toBe('a');
  });

  test('below the resurface probability threshold draws from the main rotation instead', () => {
    const progress: GlossaryProgressMap = {
      a: { mastered: true, nextEligibleAt: '2026-01-01T00:00:00.000Z' },
    };
    let callCount = 0;
    const scriptedRandom = () => {
      callCount++;
      return callCount % 2 === 1 ? 0.9 : 0; // 0.9 >= 0.2 threshold -> main rotation
    };
    const term = pickNextTerm(TERMS, progress, now, scriptedRandom);
    // Main rotation excludes "a" (it's mastered), so index 0 of [b, c] is "b".
    expect(term.id).toBe('b');
  });

  test('over many draws with one eligible mastered term, its draw rate is roughly 1-in-5', () => {
    const progress: GlossaryProgressMap = {
      a: { mastered: true, nextEligibleAt: '2026-01-01T00:00:00.000Z' },
    };
    let seed = 42;
    function seededRandom() {
      // Deterministic LCG - reproducible across runs, no mocked Date needed.
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    }

    let aCount = 0;
    const draws = 2000;
    for (let i = 0; i < draws; i++) {
      if (pickNextTerm(TERMS, progress, now, seededRandom).id === 'a') aCount++;
    }
    const rate = aCount / draws;
    // Not exactly 0.2 (mixed with the within-pool pick too), but should
    // land in a sane band around it - proves "roughly 1-in-5", not 0%
    // or 100%.
    expect(rate).toBeGreaterThan(0.1);
    expect(rate).toBeLessThan(0.3);
  });

  test('once every term is mastered but none are eligible yet, still returns a term', () => {
    const progress: GlossaryProgressMap = {
      a: { mastered: true, nextEligibleAt: '2026-02-01T00:00:00.000Z' },
      b: { mastered: true, nextEligibleAt: '2026-02-01T00:00:00.000Z' },
      c: { mastered: true, nextEligibleAt: '2026-02-01T00:00:00.000Z' },
    };
    const term = pickNextTerm(TERMS, progress, now, () => 0);
    expect(TERMS.map((t) => t.id)).toContain(term.id);
  });
});
