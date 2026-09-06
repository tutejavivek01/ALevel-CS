'use client';

import { useState } from 'react';
import { Card } from './Card';
import { PythonEditor } from './PythonEditor';
import {
  usePythonProblem,
  usePythonTestCases,
  type PythonTestCase,
} from '@/lib/db/use-python-problem';
import type { PythonProblem } from '@/lib/db/use-python-problems';
import { usePyodideWorker } from '@/lib/python/use-pyodide-worker';
import type { PyodideRunResponse } from '@/lib/python/pyodide-protocol';

type Props = {
  problemId: number;
  initialProblem: PythonProblem;
  initialTestCases: PythonTestCase[];
};

export function PythonProblemDetail({ problemId, initialProblem, initialTestCases }: Props) {
  const { data: problem } = usePythonProblem(problemId, initialProblem);
  const { data: testCases } = usePythonTestCases(problemId, initialTestCases);
  const [code, setCode] = useState(initialProblem.starter_code ?? '');
  const { run } = usePyodideWorker();
  const [output, setOutput] = useState<PyodideRunResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!problem) return null;

  // Runs against the first test case's input as a quick smoke check
  // while the student is editing (task 23) - grading against every
  // test case and persisting the result is task 25.
  async function handleRun() {
    setIsRunning(true);
    setOutput(null);
    try {
      const result = await run(code, (testCases ?? [])[0]?.input ?? '');
      setOutput(result);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Card>
      <div className="topic-head">
        <div>
          <div className="ref">Py</div>
          <h2>{problem.title}</h2>
          {problem.due_date && (
            <span className="unit-badge">
              Due {new Date(problem.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <p className="blurb">{problem.description}</p>

      <h3 className="section-title" style={{ marginTop: 20 }}>
        Test cases
      </h3>
      <div className="test-case-list">
        {(testCases ?? []).map((testCase, index) => (
          <div className="test-case-view" key={testCase.id}>
            <div className="field-label">Test {index + 1}</div>
            {testCase.input && <pre className="mono">Input: {testCase.input}</pre>}
            <pre className="mono">Expected: {testCase.expected_output}</pre>
          </div>
        ))}
      </div>

      <h3 className="section-title" style={{ marginTop: 20 }}>
        Your code
      </h3>
      <PythonEditor value={code} onChange={setCode} />

      <div className="ex-actions">
        <button className="btn2" onClick={handleRun} disabled={isRunning}>
          {isRunning ? 'Running…' : 'Run'}
        </button>
      </div>

      {output && (
        <div className={`python-output ${output.outcome}`}>
          <div className="field-label">Output</div>
          <pre>{output.stdout || '(no output)'}</pre>
          {output.outcome === 'error' && (
            <>
              <div className="field-label" style={{ marginTop: 8 }}>
                Traceback
              </div>
              <pre>{output.traceback}</pre>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
