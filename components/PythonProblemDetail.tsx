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
import { usePythonSubmissions, useSubmitPythonCode } from '@/lib/db/use-python-submissions';
import { PYTHON_EXEC_TIMEOUT_MS } from '@/lib/config';

type Props = {
  problemId: number;
  initialProblem: PythonProblem;
  initialTestCases: PythonTestCase[];
};

const OVERALL_RESULT_LABEL: Record<string, string> = {
  pass: 'All tests passed',
  fail: 'Some tests failed',
  timeout: 'Timed out',
  error: 'Error',
};

export function PythonProblemDetail({ problemId, initialProblem, initialTestCases }: Props) {
  const { data: problem } = usePythonProblem(problemId, initialProblem);
  const { data: testCases } = usePythonTestCases(problemId, initialTestCases);
  const { data: submissions } = usePythonSubmissions(problemId);
  const [code, setCode] = useState(initialProblem.starter_code ?? '');
  const submit = useSubmitPythonCode(problemId, testCases ?? []);

  if (!problem) return null;

  const result = submit.data;

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
        <button
          className="btn2"
          onClick={() => submit.mutate(code)}
          disabled={submit.isPending || (testCases ?? []).length === 0}
        >
          {submit.isPending ? 'Running…' : 'Run'}
        </button>
      </div>

      {result && (
        <div className={`python-output ${result.overallResult}`}>
          <div className="field-label">{OVERALL_RESULT_LABEL[result.overallResult]}</div>
          {result.perTestResults.length > 0 && (
            <ul className="python-result-list">
              {result.perTestResults.map((r, index) => (
                <li key={r.testCaseId} className={r.passed ? 'pass' : 'fail'}>
                  Test {index + 1}: {r.passed ? 'passed' : 'failed'}
                  {!r.passed && <pre className="mono">Got: {r.actualOutput}</pre>}
                </li>
              ))}
            </ul>
          )}
          {result.overallResult === 'error' && (
            <>
              <div className="field-label" style={{ marginTop: 8 }}>
                Traceback
              </div>
              <pre>{result.errorMessage}</pre>
            </>
          )}
          {result.overallResult === 'timeout' && (
            <p className="ex-feedback no" style={{ marginTop: 8 }}>
              Timed out after {PYTHON_EXEC_TIMEOUT_MS / 1000}s - check for an infinite loop.
            </p>
          )}
        </div>
      )}

      <h3 className="section-title" style={{ marginTop: 20 }}>
        Attempt history
      </h3>
      {(submissions ?? []).length === 0 && <p className="empty-note">No attempts yet.</p>}
      <div className="submission-list">
        {(submissions ?? []).map((submission) => (
          <div key={submission.id} className={`submission-row ${submission.overall_result}`}>
            <span className="result-badge" data-result={submission.overall_result}>
              {OVERALL_RESULT_LABEL[submission.overall_result]}
            </span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
              {new Date(submission.created_at).toLocaleString()}
            </span>
            <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
              {submission.python_submission_results.filter((r) => r.passed).length} /{' '}
              {submission.python_submission_results.length} test cases passed
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
