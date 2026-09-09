// Message shapes exchanged between the main thread and the Pyodide
// worker (design.md §6.7's sequence diagram). Kept in a shared module so
// both sides import the same types instead of duplicating them.
//
// public/pyodide-worker.js is a plain, unbundled static file (see its
// header comment) so it can't import these types directly - it must
// stay structurally compatible with them by hand.
export type PyodideInitMessage = {
  type: 'init';
  interruptBuffer: SharedArrayBuffer;
};

export type PyodideRunRequest = {
  type: 'run';
  code: string;
  input: string;
};

// Best-practice/code-quality check (design.md §6.7/§6.8, requirements.md
// §8.10) - a single round trip per submission, not per test case, since
// it inspects the submitted source itself rather than runtime behavior.
export type PyodideCheckRequest = {
  type: 'check';
  code: string;
};

export type PyodideWorkerRequest =
  | PyodideInitMessage
  | PyodideRunRequest
  | PyodideCheckRequest;

export type PyodideRunResponse =
  | { type: 'result'; outcome: 'ok'; stdout: string }
  | { type: 'result'; outcome: 'error'; stdout: string; traceback: string }
  | { type: 'result'; outcome: 'timeout'; stdout: string };

// syntaxError added for saved code versions (design.md §6.10,
// requirements.md §8.12) - null whenever code.parse() succeeds; a
// version has no test case to run against, so this is its only signal
// that the code doesn't even parse. Run's own callers (grade-submission
// .ts) ignore it, since a real execution attempt already produces a
// proper traceback for that case.
export type PyodideCheckResponse = {
  type: 'check-result';
  findings: string[];
  syntaxError: string | null;
};
