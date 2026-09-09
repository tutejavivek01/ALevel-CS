'use client';

import { useEffect, useRef } from 'react';
import { PYTHON_EXEC_TIMEOUT_MS } from '@/lib/config';
import type {
  PyodideCheckRequest,
  PyodideCheckResponse,
  PyodideInitMessage,
  PyodideRunRequest,
  PyodideRunResponse,
} from './pyodide-protocol';

// Owns exactly one Worker instance for the lifetime of the component
// that calls this (design.md §6.7: "Pyodide is loaded once per tab and
// kept warm... not reloaded per submission"). The worker itself is
// created in an effect (imperative side effect on a ref, not state -
// doesn't trip react-hooks/set-state-in-effect) and torn down on
// unmount.
export function usePyodideWorker() {
  const workerRef = useRef<Worker | null>(null);
  // A SharedArrayBuffer, not a plain ArrayBuffer: the worker needs to
  // see writes made here without any postMessage round trip, since a
  // timeout has to interrupt a run that's already in progress
  // (design.md §6.7's interrupt-buffer mechanism, task 24). Requires
  // the COOP/COEP headers set in next.config.ts.
  const interruptArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    // A plain string URL to a static file in /public, not
    // `new URL('./x', import.meta.url)` - see public/pyodide-worker.js's
    // header comment for why it must stay outside the bundler entirely.
    const worker = new Worker('/pyodide-worker.js', { type: 'module' });
    workerRef.current = worker;

    const interruptBuffer = new SharedArrayBuffer(1);
    const interruptArray = new Uint8Array(interruptBuffer);
    interruptArrayRef.current = interruptArray;
    const initMessage: PyodideInitMessage = { type: 'init', interruptBuffer };
    worker.postMessage(initMessage);

    return () => {
      worker.terminate();
      workerRef.current = null;
      interruptArrayRef.current = null;
    };
  }, []);

  function run(code: string, input: string): Promise<PyodideRunResponse> {
    return new Promise((resolve, reject) => {
      const worker = workerRef.current;
      if (!worker) {
        reject(new Error('Pyodide worker is not ready yet'));
        return;
      }

      // SIGINT (2) - Pyodide's documented signal for raising a real
      // KeyboardInterrupt inside the running Python code (design.md
      // §6.7). The worker resets this to 0 itself at the start of every
      // run, so a timeout on one run can't bleed into the next.
      const timeoutId = setTimeout(() => {
        const interruptArray = interruptArrayRef.current;
        if (interruptArray) interruptArray[0] = 2;
      }, PYTHON_EXEC_TIMEOUT_MS);

      function handleMessage(event: MessageEvent<PyodideRunResponse | PyodideCheckResponse>) {
        if (event.data.type !== 'result') return;
        clearTimeout(timeoutId);
        worker!.removeEventListener('message', handleMessage);
        worker!.removeEventListener('error', handleError);
        resolve(event.data);
      }
      function handleError(event: ErrorEvent) {
        clearTimeout(timeoutId);
        worker!.removeEventListener('message', handleMessage);
        worker!.removeEventListener('error', handleError);
        reject(event.error ?? new Error(event.message));
      }

      worker.addEventListener('message', handleMessage);
      worker.addEventListener('error', handleError);
      const request: PyodideRunRequest = { type: 'run', code, input };
      worker.postMessage(request);
    });
  }

  // Best-practice/code-quality check (design.md §6.7/§6.8) - no timeout
  // needed here (unlike run()): the checker is pure, fast AST analysis,
  // never a student's own arbitrarily-long-running code.
  function check(code: string): Promise<{ findings: string[]; syntaxError: string | null }> {
    return new Promise((resolve, reject) => {
      const worker = workerRef.current;
      if (!worker) {
        reject(new Error('Pyodide worker is not ready yet'));
        return;
      }

      function handleMessage(event: MessageEvent<PyodideRunResponse | PyodideCheckResponse>) {
        if (event.data.type !== 'check-result') return;
        worker!.removeEventListener('message', handleMessage);
        worker!.removeEventListener('error', handleError);
        resolve({ findings: event.data.findings, syntaxError: event.data.syntaxError });
      }
      function handleError(event: ErrorEvent) {
        worker!.removeEventListener('message', handleMessage);
        worker!.removeEventListener('error', handleError);
        reject(event.error ?? new Error(event.message));
      }

      worker.addEventListener('message', handleMessage);
      worker.addEventListener('error', handleError);
      const request: PyodideCheckRequest = { type: 'check', code };
      worker.postMessage(request);
    });
  }

  return { run, check };
}
