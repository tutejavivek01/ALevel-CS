// A step is a flat set of named fields (trace-table columns, or an FSM's
// {state, output}), all represented as strings so they can be typed into
// a plain <input> and compared uniformly. design.md §6.4 / requirements.md
// §5.5: this is the shared interface both trace-table (task 16) and FSM
// (task 17-18) exercises implement, built once rather than per-type.
export type StepValues = Record<string, string>;

export interface SteppedExercise<Step extends StepValues = StepValues> {
  id: string;
  title: string;
  prompt: string;
  // Field keys, in display order. Kept separate from Step's own keys
  // typing so a component can iterate them without knowing Step's shape.
  fieldKeys: Array<keyof Step & string>;
  fieldLabels?: Partial<Record<keyof Step & string, string>>;
  // Computes the correct value for every field of every step. Takes no
  // arguments - each concrete exercise (a fixed trace-table snippet, or
  // an FSM + a specific input string) already has everything it needs
  // closed over when it's defined.
  computeExpectedSteps(): Step[];
  // Field-level, not whole-step: this is what lets the UI highlight one
  // wrong cell without marking the entire row wrong, matching the
  // prototype's existing per-input correct/wrong behaviour.
  isStepCorrect(given: string, expected: string): boolean;
  // Shown behind a "Show worked trace/answer" toggle, if provided.
  workedAnswer?: string;
}

export function exactMatch(given: string, expected: string): boolean {
  return given.trim() === expected.trim();
}
