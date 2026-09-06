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
    except BaseException:
        return json.dumps({
            'outcome': 'error',
            'stdout': buf.getvalue(),
            'traceback': traceback.format_exc(),
        })
`;

// Loaded once per worker instance and kept warm across runs (design.md
// §6.7) - the multi-MB download/init cost is paid once per tab, not
// once per submission. The __run_submission PyProxy is grabbed once
// here too, rather than re-fetched via pyodide.globals.get() on every
// message, so repeated runs don't leak a fresh proxy each time.
let runnerPromise = null;

function getRunner() {
  if (!runnerPromise) {
    runnerPromise = import('/pyodide/pyodide.mjs').then(async ({ loadPyodide }) => {
      const pyodide = await loadPyodide({ indexURL: '/pyodide/' });
      pyodide.runPython(RUNNER_SOURCE);
      return pyodide.globals.get('__run_submission');
    });
  }
  return runnerPromise;
}

self.onmessage = async (event) => {
  const { code, input } = event.data;
  const runSubmission = await getRunner();
  const resultJson = runSubmission(code, input);
  const result = JSON.parse(resultJson);
  self.postMessage({ type: 'result', ...result });
};
