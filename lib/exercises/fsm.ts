import { exactMatch, type SteppedExercise } from './types';
import { traceFsm, type Fsm, type FsmTraceStep } from './fsm-engine';

// Ported from reference/prototype.html's FSM_EXAMPLES. The visual state
// diagram (task 18) reads `fsm` directly; the exercise itself only needs
// the transition table to compute/check the trace.
export type FsmExerciseData = SteppedExercise<FsmTraceStep> & {
  fsm: Fsm;
};

const endsIn01Fsm: Fsm = {
  states: [
    { id: 'A', start: true, x: 70, y: 90 },
    { id: 'B', x: 210, y: 90 },
    { id: 'C', accept: true, x: 350, y: 90 },
  ],
  edges: [
    { from: 'A', to: 'A', input: '1', self: true },
    { from: 'A', to: 'B', input: '0' },
    { from: 'B', to: 'B', input: '0', self: true },
    { from: 'B', to: 'C', input: '1' },
    { from: 'C', to: 'A', input: '1', curveUp: true },
    { from: 'C', to: 'B', input: '0', below: true },
  ],
};

export const endsIn01: FsmExerciseData = {
  id: 'fsm-ends-in-01',
  title: "FSM without output — detects a string ending in '01'",
  prompt:
    "States A (start), B, C (accepting). A doesn't end in 0 or 01; B means the last symbol seen was 0; C (accepting) means the last two symbols were 01. Trace the input 1011 - which state does it end in, and is 1011 accepted?",
  fsm: endsIn01Fsm,
  fieldKeys: ['input', 'state'],
  fieldLabels: { input: 'Input symbol', state: 'State after' },
  givenKeys: ['input'],
  computeExpectedSteps: () => traceFsm(endsIn01Fsm, ['1', '0', '1', '1']),
  isStepCorrect: exactMatch,
  workedAnswer:
    '1 → A, 0 → B, 1 → C, 1 → A. It ends in state A, which is not accepting — correct, since "1011" ends in "11", not "01".',
};

const turnstileFsm: Fsm = {
  states: [
    { id: 'Locked', start: true, x: 110, y: 90 },
    { id: 'Unlocked', x: 320, y: 90 },
  ],
  edges: [
    { from: 'Locked', to: 'Unlocked', input: 'coin', output: 'unlock' },
    { from: 'Unlocked', to: 'Locked', input: 'push', output: 'lock', below: true },
    { from: 'Locked', to: 'Locked', input: 'push', output: '–', self: true },
    { from: 'Unlocked', to: 'Unlocked', input: 'coin', output: '–', self: true },
  ],
};

export const turnstile: FsmExerciseData = {
  id: 'fsm-turnstile-mealy',
  title: 'Mealy machine (with output) — a turnstile',
  prompt:
    'States Locked (start) and Unlocked. For the input sequence coin, push, push, coin, push - give the output and resulting state after each input.',
  fsm: turnstileFsm,
  fieldKeys: ['input', 'state', 'output'],
  fieldLabels: { input: 'Input', state: 'State after', output: 'Output' },
  givenKeys: ['input'],
  computeExpectedSteps: () =>
    traceFsm(turnstileFsm, ['coin', 'push', 'push', 'coin', 'push']),
  isStepCorrect: exactMatch,
  workedAnswer: 'unlock, lock, –, unlock, lock. Final state: Locked.',
};

export const FSM_EXERCISES: FsmExerciseData[] = [endsIn01, turnstile];
