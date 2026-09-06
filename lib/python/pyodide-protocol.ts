// Message shapes exchanged between the main thread and the Pyodide
// worker (design.md §6.7's sequence diagram). Kept in a shared module so
// both sides import the same types instead of duplicating them.
export type PyodideRunRequest = {
  type: 'run';
  code: string;
  input: string;
};

export type PyodideRunResponse =
  | { type: 'result'; outcome: 'ok'; stdout: string }
  | { type: 'result'; outcome: 'error'; stdout: string; traceback: string };
