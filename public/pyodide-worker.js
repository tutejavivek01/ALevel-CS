// Plain, unbundled static file - deliberately NOT compiled/bundled by
// Turbopack (see lib/python/use-pyodide-worker.ts, which loads this via
// a plain string URL, not `new URL('./x', import.meta.url)`).
//
// Turbopack's own worker bootstrap - injected into ANY worker entry it
// bundles, regardless of the worker's declared `type` - defines a
// global `importScripts` shim for its own chunk-loading purposes.
// Pyodide's runtime (pyodide.mjs) detects "classic worker" by calling
// `globalThis.importScripts("data:text/javascript,")` and checking
// whether it throws; Turbopack's shim doesn't throw, so Pyodide always
// concludes it's in an (unsupported) classic worker and refuses to
// load - reproduced identically with a module worker, a classic
// worker, a static `import`, and a webpackIgnore/turbopackIgnore
// dynamic `import()`, in both `next dev` and a production build. The
// only fix that actually works is keeping this worker's source
// completely outside the bundler, so no such shim is ever present.
//
// Source of truth for the runner logic - if this needs to change, this
// is the only copy (there is no compiled/generated counterpart).

// KeyboardInterrupt is caught separately from every other exception and
// reported as its own 'timeout' outcome (design.md §6.7/task 24) - the
// main thread raises it deliberately via the interrupt buffer when a
// run overruns PYTHON_EXEC_TIMEOUT_MS, so it means something different
// from a bug in the student's own code.
const RUNNER_SOURCE = `
def __run_submission(code, stdin_text):
    import io, contextlib, json, traceback, builtins

    lines = iter(stdin_text.splitlines())

    def __fake_input(prompt=''):
        try:
            return next(lines)
        except StopIteration:
            raise EOFError('EOF when reading a line')

    builtins.input = __fake_input
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(code, '<submission>', 'exec'), {'__name__': '__main__'})
        return json.dumps({'outcome': 'ok', 'stdout': buf.getvalue()})
    except KeyboardInterrupt:
        return json.dumps({'outcome': 'timeout', 'stdout': buf.getvalue()})
    except BaseException:
        return json.dumps({
            'outcome': 'error',
            'stdout': buf.getvalue(),
            'traceback': traceback.format_exc(),
        })
`;

// Best-practice / code-quality check (design.md §6.7/§6.8, requirements.md
// §8.10). Pure ast-based static analysis, not a real linter - this
// Pyodide build has no pyflakes/pylint/flake8/pycodestyle available
// (confirmed against pyodide-lock.json), and fetching one from PyPI at
// grading time would reintroduce the exact external runtime dependency
// self-hosting Pyodide's own assets was meant to avoid. Advisory only -
// it never runs the code and never affects pass/fail.
const CHECKER_SOURCE = `
def __check_best_practice(code):
    import ast, re, json

    try:
        tree = ast.parse(code)
    except SyntaxError:
        # A syntax error is already reported by __run_submission's own
        # traceback - nothing useful to add here.
        return json.dumps({'findings': []})

    findings = []

    has_function_or_class = any(
        isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef))
        for node in ast.walk(tree)
    )
    if not has_function_or_class:
        findings.append(
            'No functions or classes defined - consider breaking the '
            'program into smaller, reusable pieces.'
        )

    snake_case_re = re.compile(r'^[a-z_][a-z0-9_]*$')
    # Traditional loop-counter names only - a bare 'x'/'y' holding a real
    # value (not a coordinate/loop index) is exactly the non-descriptive
    # naming this rule is meant to catch, so it isn't exempted here.
    allowed_short_names = {'i', 'j', 'k', 'n'}
    already_flagged = set()

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            name = node.name
            if name not in already_flagged and not snake_case_re.match(name):
                already_flagged.add(name)
                findings.append(f"Function '{name}' should use snake_case naming.")
        elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
            name = node.id
            if name in already_flagged:
                continue
            if len(name) == 1 and name.lower() not in allowed_short_names:
                already_flagged.add(name)
                findings.append(f"Variable '{name}' has a non-descriptive single-letter name.")
            elif len(name) > 1 and not snake_case_re.match(name) and not name.isupper():
                already_flagged.add(name)
                findings.append(f"Variable '{name}' should use snake_case naming.")

    for line_number, line in enumerate(code.splitlines(), start=1):
        if len(line) > 100:
            findings.append(f'Line {line_number} is over 100 characters long.')

    return json.dumps({'findings': findings})
`;

// Loaded once per worker instance and kept warm across runs (design.md
// §6.7) - the multi-MB download/init cost is paid once per tab, not
// once per submission. The __run_submission/__check_best_practice
// PyProxies are grabbed once here too, rather than re-fetched via
// pyodide.globals.get() on every message, so repeated calls don't leak
// a fresh proxy each time.
let pyodidePromise = null;
let pyodideInstance = null;
let runSubmission = null;
let checkBestPractice = null;

// A Uint8Array view over the SharedArrayBuffer the main thread sends in
// the 'init' message. Written to only by the main thread (SIGINT on
// timeout); read/cleared here.
let interruptArray = null;

function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = import('/pyodide/pyodide.mjs').then(async ({ loadPyodide }) => {
      const pyodide = await loadPyodide({ indexURL: '/pyodide/' });
      pyodideInstance = pyodide;
      if (interruptArray) pyodide.setInterruptBuffer(interruptArray);
      pyodide.runPython(RUNNER_SOURCE);
      pyodide.runPython(CHECKER_SOURCE);
      runSubmission = pyodide.globals.get('__run_submission');
      checkBestPractice = pyodide.globals.get('__check_best_practice');
      return pyodide;
    });
  }
  return pyodidePromise;
}

self.onmessage = async (event) => {
  const data = event.data;

  if (data.type === 'init') {
    interruptArray = new Uint8Array(data.interruptBuffer);
    if (pyodideInstance) pyodideInstance.setInterruptBuffer(interruptArray);
    return;
  }

  if (data.type === 'check') {
    await getPyodide();
    const resultJson = checkBestPractice(data.code);
    const { findings } = JSON.parse(resultJson);
    self.postMessage({ type: 'check-result', findings });
    return;
  }

  const { code, input } = data;
  await getPyodide();
  // Clear any interrupt left over from a prior run's timeout - the byte
  // in shared memory doesn't reset itself once Python catches the
  // KeyboardInterrupt it caused, and a stale 2 would immediately
  // interrupt every run after the first timeout.
  if (interruptArray) interruptArray[0] = 0;
  const resultJson = runSubmission(code, input);
  const result = JSON.parse(resultJson);
  self.postMessage({ type: 'result', ...result });
};
