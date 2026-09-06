import { exactMatch, type SteppedExercise, type StepValues } from './types';

// Ported from reference/prototype.html's TRACE_EXAMPLES (requirements.md
// §5.1: preserve the existing checking mechanism as-is). Each exercise
// also carries its pseudocode as [plain, keyword] line pairs, rendered by
// components/TraceTableExercise.tsx above the generic SteppedTraceForm.
export type TraceTableExercise<Step extends StepValues> = SteppedExercise<Step> & {
  code: Array<[string, string]>;
};

type SumWhileLoopStep = {
  iteration: string;
  countStart: string;
  totalAfter: string;
  countAfter: string;
};

export const sumWhileLoop: TraceTableExercise<SumWhileLoopStep> = {
  id: 'trace-sum-while-loop',
  title: 'Summing with a WHILE loop',
  prompt: 'Trace this loop by hand, filling in total and count after each pass.',
  code: [
    ['total ', '← 0'],
    ['count ', '← 1'],
    ['WHILE count <= 5', ''],
    ['    total ', '← total + count'],
    ['    count ', '← count + 1'],
    ['ENDWHILE', ''],
    ['OUTPUT total', ''],
  ],
  fieldKeys: ['iteration', 'countStart', 'totalAfter', 'countAfter'],
  fieldLabels: {
    iteration: 'Iteration',
    countStart: 'count (start)',
    totalAfter: 'total (after +)',
    countAfter: 'count (after ++)',
  },
  givenKeys: ['iteration', 'countStart'],
  computeExpectedSteps: () => [
    { iteration: '1', countStart: '1', totalAfter: '1', countAfter: '2' },
    { iteration: '2', countStart: '2', totalAfter: '3', countAfter: '3' },
    { iteration: '3', countStart: '3', totalAfter: '6', countAfter: '4' },
    { iteration: '4', countStart: '4', totalAfter: '10', countAfter: '5' },
    { iteration: '5', countStart: '5', totalAfter: '15', countAfter: '6' },
  ],
  isStepCorrect: exactMatch,
  workedAnswer: 'OUTPUT total → 15',
};

type SwapStep = { a: string; b: string; temp: string };

export const swapTwoValues: TraceTableExercise<SwapStep> = {
  id: 'trace-swap-two-values',
  title: 'Swapping two values',
  prompt: 'a starts at 8 and b starts at 3. Trace the swap and give the final values.',
  code: [
    ['a ', '← 8'],
    ['b ', '← 3'],
    ['IF a > b THEN', ''],
    ['    temp ', '← a'],
    ['    a ', '← b'],
    ['    b ', '← temp'],
    ['ENDIF', ''],
    ['OUTPUT a, b', ''],
  ],
  fieldKeys: ['a', 'b', 'temp'],
  // A single step: unlike the looping examples, there's nothing to show
  // as "given" context beyond the starting values already visible in the
  // code above, so every field here is a checked answer.
  computeExpectedSteps: () => [{ a: '3', b: '8', temp: '8' }],
  isStepCorrect: exactMatch,
  workedAnswer: 'OUTPUT a, b → 3, 8',
};

type NestedForStep = { i: string; j: string; output: string };

export const nestedForLoops: TraceTableExercise<NestedForStep> = {
  id: 'trace-nested-for-loops',
  title: 'Nested FOR loops',
  prompt: 'For each pass through the inner loop, give the value OUTPUT.',
  code: [
    ['FOR i ', '← 1 TO 3'],
    ['    FOR j ', '← 1 TO 2'],
    ['        OUTPUT i * j', ''],
    ['    NEXT j', ''],
    ['NEXT i', ''],
  ],
  fieldKeys: ['i', 'j', 'output'],
  fieldLabels: { output: 'output (i × j)' },
  givenKeys: ['i', 'j'],
  computeExpectedSteps: () => [
    { i: '1', j: '1', output: '1' },
    { i: '1', j: '2', output: '2' },
    { i: '2', j: '1', output: '2' },
    { i: '2', j: '2', output: '4' },
    { i: '3', j: '1', output: '3' },
    { i: '3', j: '2', output: '6' },
  ],
  isStepCorrect: exactMatch,
  workedAnswer: 'Six OUTPUT statements run in total.',
};

export const TRACE_TABLE_EXERCISES: TraceTableExercise<StepValues>[] = [
  sumWhileLoop,
  swapTwoValues,
  nestedForLoops,
];
