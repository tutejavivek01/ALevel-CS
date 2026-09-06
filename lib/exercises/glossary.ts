export type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
};

// Ported from reference/prototype.html's GLOSSARY array.
export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'abstraction',
    term: 'Abstraction',
    definition: 'Removing unnecessary detail so you can focus on what’s relevant to the problem.',
  },
  {
    id: 'decomposition',
    term: 'Decomposition',
    definition: 'Breaking a complex problem down into smaller, more manageable sub-problems.',
  },
  {
    id: 'representational-abstraction',
    term: 'Representational abstraction',
    definition:
      'Choosing a simplified representation for data that hides its physical implementation, e.g. thinking of a queue conceptually rather than by its memory layout.',
  },
  {
    id: 'abstraction-by-generalisation',
    term: 'Abstraction by generalisation',
    definition:
      'Spotting features shared by several objects or procedures and grouping them — e.g. several classes sharing a superclass.',
  },
  {
    id: 'information-hiding',
    term: 'Information hiding',
    definition:
      'Hiding the internal details of how a procedure or object works from the code that uses it.',
  },
  {
    id: 'procedural-abstraction',
    term: 'Procedural abstraction',
    definition:
      'Treating a sequence of instructions as one named subroutine, so the caller doesn’t need to know how it works inside.',
  },
  {
    id: 'functional-abstraction',
    term: 'Functional abstraction',
    definition: 'Using a function by its inputs and outputs alone, without needing to know its internal logic.',
  },
  {
    id: 'data-abstraction',
    term: 'Data abstraction',
    definition:
      'Separating how data is logically used from how it is physically stored — e.g. an abstract data type like a stack.',
  },
  {
    id: 'problem-abstraction-reduction',
    term: 'Problem abstraction / reduction',
    definition: 'Simplifying a problem by removing or ignoring detail that isn’t relevant to a solution.',
  },
  {
    id: 'finite-state-machine',
    term: 'Finite state machine (FSM)',
    definition:
      'A model with a finite number of states and labelled transitions between them, triggered by input, with one start state.',
  },
  {
    id: 'state-transition-diagram',
    term: 'State transition diagram',
    definition: 'A diagram showing an FSM’s states as circles and its transitions as labelled arrows.',
  },
  {
    id: 'state-transition-table',
    term: 'State transition table',
    definition:
      'A table listing, for each state and input, the resulting next state (and output, for a Mealy machine).',
  },
  {
    id: 'mealy-machine',
    term: 'Mealy machine',
    definition: 'A finite state machine that produces an output on each transition, not just in each state.',
  },
  {
    id: 'accepting-state',
    term: 'Accepting state',
    definition:
      'A state that, if the machine ends there after reading the whole input, means that input is accepted.',
  },
];
