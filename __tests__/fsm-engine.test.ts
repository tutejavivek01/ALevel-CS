import { describe, expect, test } from 'vitest';
import { isAccepting, traceFsm, type Fsm } from '../lib/exercises/fsm-engine';
import { endsIn01, turnstile, FSM_EXERCISES } from '../lib/exercises/fsm';

describe('traceFsm: ends-in-01 detector (no output)', () => {
  test('traces "1011" through A -> A -> B -> C -> A, hand-verified', () => {
    const steps = traceFsm(endsIn01.fsm, ['1', '0', '1', '1']);
    expect(steps).toEqual([
      { input: '1', state: 'A', output: '–' },
      { input: '0', state: 'B', output: '–' },
      { input: '1', state: 'C', output: '–' },
      { input: '1', state: 'A', output: '–' },
    ]);
  });

  test('final state A is not accepting - "1011" is correctly rejected', () => {
    const steps = traceFsm(endsIn01.fsm, ['1', '0', '1', '1']);
    const finalState = steps.at(-1)!.state;
    expect(isAccepting(endsIn01.fsm, finalState)).toBe(false);
  });

  test('a string that actually ends in "01" is accepted', () => {
    const steps = traceFsm(endsIn01.fsm, ['1', '1', '0', '1']);
    const finalState = steps.at(-1)!.state;
    expect(finalState).toBe('C');
    expect(isAccepting(endsIn01.fsm, finalState)).toBe(true);
  });
});

describe('traceFsm: turnstile (Mealy, with output)', () => {
  test('traces coin,push,push,coin,push and matches the hand-verified output sequence', () => {
    const steps = traceFsm(turnstile.fsm, ['coin', 'push', 'push', 'coin', 'push']);
    expect(steps).toEqual([
      { input: 'coin', state: 'Unlocked', output: 'unlock' },
      { input: 'push', state: 'Locked', output: 'lock' },
      { input: 'push', state: 'Locked', output: '–' },
      { input: 'coin', state: 'Unlocked', output: 'unlock' },
      { input: 'push', state: 'Locked', output: 'lock' },
    ]);
  });

  test('ends in Locked', () => {
    const steps = traceFsm(turnstile.fsm, ['coin', 'push', 'push', 'coin', 'push']);
    expect(steps.at(-1)!.state).toBe('Locked');
  });
});

describe('traceFsm: error handling', () => {
  test('throws if the FSM has no start state', () => {
    const brokenFsm: Fsm = { states: [{ id: 'X' }], edges: [] };
    expect(() => traceFsm(brokenFsm, ['1'])).toThrow('no start state');
  });

  test('throws on an input symbol with no matching transition', () => {
    expect(() => traceFsm(endsIn01.fsm, ['2'])).toThrow(/No transition/);
  });
});

describe('FSM_EXERCISES', () => {
  test('has both ported examples with unique ids', () => {
    expect(FSM_EXERCISES).toHaveLength(2);
    const ids = FSM_EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(2);
  });
});
