import { describe, expect, test } from 'vitest';
import {
  nestedForLoops,
  sumWhileLoop,
  swapTwoValues,
  TRACE_TABLE_EXERCISES,
} from '../lib/exercises/trace-tables';

describe('sumWhileLoop', () => {
  test('produces the expected 5-iteration trace', () => {
    expect(sumWhileLoop.computeExpectedSteps()).toEqual([
      { iteration: '1', countStart: '1', totalAfter: '1', countAfter: '2' },
      { iteration: '2', countStart: '2', totalAfter: '3', countAfter: '3' },
      { iteration: '3', countStart: '3', totalAfter: '6', countAfter: '4' },
      { iteration: '4', countStart: '4', totalAfter: '10', countAfter: '5' },
      { iteration: '5', countStart: '5', totalAfter: '15', countAfter: '6' },
    ]);
  });

  test('given columns are excluded from the checked field keys', () => {
    expect(sumWhileLoop.givenKeys).toEqual(['iteration', 'countStart']);
  });
});

describe('swapTwoValues', () => {
  test('produces the single swapped-values step', () => {
    expect(swapTwoValues.computeExpectedSteps()).toEqual([
      { a: '3', b: '8', temp: '8' },
    ]);
  });
});

describe('nestedForLoops', () => {
  test('produces all 6 inner-loop passes in order', () => {
    expect(nestedForLoops.computeExpectedSteps()).toEqual([
      { i: '1', j: '1', output: '1' },
      { i: '1', j: '2', output: '2' },
      { i: '2', j: '1', output: '2' },
      { i: '2', j: '2', output: '4' },
      { i: '3', j: '1', output: '3' },
      { i: '3', j: '2', output: '6' },
    ]);
  });
});

describe('TRACE_TABLE_EXERCISES', () => {
  test('has all 3 ported examples with unique ids', () => {
    expect(TRACE_TABLE_EXERCISES).toHaveLength(3);
    const ids = TRACE_TABLE_EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(3);
  });
});
