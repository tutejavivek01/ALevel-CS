'use client';

import { useEffect, useRef } from 'react';
import type { PyodideRunRequest, PyodideRunResponse } from './pyodide-protocol';

// Owns exactly one Worker instance for the lifetime of the component
// that calls this (design.md §6.7: "Pyodide is loaded once per tab and
// kept warm... not reloaded per submission"). The worker itself is
// created in an effect (imperative side effect on a ref, not state -
// doesn't trip react-hooks/set-state-in-effect) and torn down on
// unmount.
export function usePyodideWorker() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // A plain string URL to a static file in /public, not
    // `new URL('./x', import.meta.url)` - see public/pyodide-worker.js's
    // header comment for why it must stay outside the bundler entirely.
    const worker = new Worker('/pyodide-worker.js', { type: 'module' });
    workerRef.current = worker;
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  function run(code: string, input: string): Promise<PyodideRunResponse> {
    return new Promise((resolve, reject) => {
      const worker = workerRef.current;
      if (!worker) {
        reject(new Error('Pyodide worker is not ready yet'));
        return;
      }

      function handleMessage(event: MessageEvent<PyodideRunResponse>) {
        worker!.removeEventListener('message', handleMessage);
        worker!.removeEventListener('error', handleError);
        resolve(event.data);
      }
      function handleError(event: ErrorEvent) {
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

  return { run };
}
