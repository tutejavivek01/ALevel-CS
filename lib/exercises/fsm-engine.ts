// Pure FSM/Mealy machine engine (design.md §6.4, requirements.md §5.2).
// Logic only - this is what makes FSM exercises genuinely checkable
// (task 18), replacing the prototype's reveal-only answer.
export type FsmState = {
  id: string;
  start?: boolean;
  accept?: boolean;
  // Layout position for the SVG diagram (task 18) - kept on the same
  // type as the logic rather than a parallel structure, so a state can
  // never be added to one and forgotten in the other.
  x: number;
  y: number;
};

// `input` is a token, not necessarily a single character - the turnstile
// example below transitions on whole words ("coin", "push"), while the
// binary-string example transitions on single characters. Either way,
// the caller splits its input into a string[] before tracing.
export type FsmEdge = {
  from: string;
  to: string;
  input: string;
  output?: string; // Mealy machines only; absent means no output on this edge.
  // Diagram-only layout hints (task 18). The edge's label is derived
  // from input/output at render time, not stored here, so there's only
  // one source of truth for what an edge actually does.
  self?: boolean;
  curveUp?: boolean;
  below?: boolean;
};

export type Fsm = {
  states: FsmState[];
  edges: FsmEdge[];
};

export type FsmTraceStep = {
  input: string;
  state: string;
  output: string; // '–' when the edge has no output, matching the prototype's notation.
};

export function traceFsm(fsm: Fsm, inputSequence: string[]): FsmTraceStep[] {
  const startState = fsm.states.find((s) => s.start);
  if (!startState) {
    throw new Error('FSM has no start state');
  }

  let current = startState.id;
  const steps: FsmTraceStep[] = [];

  for (const symbol of inputSequence) {
    const edge = fsm.edges.find((e) => e.from === current && e.input === symbol);
    if (!edge) {
      throw new Error(`No transition from state "${current}" on input "${symbol}"`);
    }
    current = edge.to;
    steps.push({ input: symbol, state: current, output: edge.output ?? '–' });
  }

  return steps;
}

export function isAccepting(fsm: Fsm, stateId: string): boolean {
  return fsm.states.find((s) => s.id === stateId)?.accept ?? false;
}
