// The programming-challenge "confident" mastery-gate route (design.md
// §6.13, requirements.md §12.3): 2 challenges per code-evaluable topic,
// both must pass. Identical gradable shape to OcrChallenge, so
// gradeSubmission() and the existing Pyodide pipeline run unchanged - see
// lib/python/grade-submission.ts. Every test case below was independently
// derived and verified by running a real Python reference solution
// through a real interpreter, the same rigor as
// lib/exercises/ocr-challenges.ts's test cases (conventions.md's
// content-accuracy workflow).

export type MasteryChallenge = {
  id: string;
  title: string;
  description: string;
  testCases: { input: string; expectedOutput: string }[];
};

// Topics whose "confident" mastery gate is 2 programming challenges
// (everything else is a quiz - see MASTERY_QUIZ_TOPICS in
// mastery-quiz.ts). requirements.md §10 leaves computation/
// data-representation/databases as an open question; until resolved they
// stay on the quiz list.
export const MASTERY_CHALLENGE_TOPICS = [
  'programming',
  'data-structures',
  'algorithms',
  'functional',
] as const;

export const MASTERY_CHALLENGES: Record<string, MasteryChallenge[]> = {
  programming: [
    {
      id: 'programming-c1',
      title: 'Sum of a list',
      description:
        'Read a single line containing space-separated integers from standard input. Print their sum as an integer, with no other output.',
      testCases: [
        { input: '1 2 3 4 5\n', expectedOutput: '15\n' },
        { input: '10 -2 3\n', expectedOutput: '11\n' },
      ],
    },
    {
      id: 'programming-c2',
      title: 'Safe division',
      description:
        'Read two integers, one per line: a numerator then a denominator. If the denominator is zero, print exactly `Error: division by zero`. Otherwise print the integer (floor) division of the two numbers.',
      testCases: [
        { input: '10\n2\n', expectedOutput: '5\n' },
        { input: '7\n0\n', expectedOutput: 'Error: division by zero\n' },
      ],
    },
  ],

  'data-structures': [
    {
      id: 'data-structures-c1',
      title: 'Bracket checker',
      description:
        'Read a line containing only the bracket characters ( ) [ ] { }. Using a stack, print `Balanced` if every bracket is correctly opened and closed in the right order and nesting, or `Not balanced` otherwise.',
      testCases: [
        { input: '([]{})\n', expectedOutput: 'Balanced\n' },
        { input: '([)]\n', expectedOutput: 'Not balanced\n' },
      ],
    },
    {
      id: 'data-structures-c2',
      title: 'Queue simulation',
      description:
        'Read a line of space-separated integers to enqueue, in order, into a queue. Read a second line containing a single integer n. Dequeue n items and print them space-separated on one line, in the order removed. Then print whatever remains in the queue, space-separated, on a second line (an empty line if nothing remains).',
      testCases: [
        { input: '1 2 3 4 5\n2\n', expectedOutput: '1 2\n3 4 5\n' },
        { input: '10 20\n2\n', expectedOutput: '10 20\n\n' },
      ],
    },
  ],

  algorithms: [
    {
      id: 'algorithms-c1',
      title: 'Binary search',
      description:
        'Read a line of space-separated integers, already sorted ascending, then a second line containing a single target integer. Print the 0-based index of the target in the list, or -1 if it is not present.',
      testCases: [
        { input: '1 3 5 7 9 11\n7\n', expectedOutput: '3\n' },
        { input: '2 4 6\n5\n', expectedOutput: '-1\n' },
      ],
    },
    {
      id: 'algorithms-c2',
      title: 'Bubble sort',
      description:
        'Read a line of space-separated integers. Print them sorted into ascending order, space-separated, on one line.',
      testCases: [
        { input: '5 3 8 1 2\n', expectedOutput: '1 2 3 5 8\n' },
        { input: '9 9 1\n', expectedOutput: '1 9 9\n' },
      ],
    },
  ],

  functional: [
    {
      id: 'functional-c1',
      title: 'Sum of squared evens',
      description:
        'Read a line of space-separated integers. Using map, filter, and reduce (or equivalent functional-style operations), compute and print the sum of the squares of only the even numbers in the list.',
      testCases: [
        { input: '1 2 3 4 5 6\n', expectedOutput: '56\n' },
        { input: '1 3 5\n', expectedOutput: '0\n' },
      ],
    },
    {
      id: 'functional-c2',
      title: 'Function composition',
      description:
        'Read a single integer n. Define f(n) = n * 2 and g(n) = n + 1. Print the result of applying f first, then g, to the input (i.e. g(f(n))).',
      testCases: [
        { input: '5\n', expectedOutput: '11\n' },
        { input: '0\n', expectedOutput: '1\n' },
      ],
    },
  ],
};
