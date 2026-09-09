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
import {
  usePythonReviews,
  useAddPythonReview,
  useSubmitForReview,
} from '@/lib/db/use-python-reviews';
import { useCurrentProfile } from '@/lib/db/use-current-profile';
import { deriveReviewStatus } from '@/lib/exercises/python-review-status';
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

const STATUS_LABEL: Record<string, string> = {
  'not-started': 'Not started',
  attempted: 'Attempted',
  'submitted-for-review': 'Submitted for review',
  reviewed: 'Reviewed',
};

function ReviewForm({ onAdd }: { onAdd: (body: string) => void }) {
  const [draft, setDraft] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = draft.trim();
        if (trimmed) {
          onAdd(trimmed);
          setDraft('');
        }
      }}
      style={{ display: 'flex', gap: 8, marginTop: 8 }}
    >
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Leave feedback…"
        style={{ flex: 1 }}
      />
      <button type="submit" className="btn2 alt">
        Add review
      </button>
    </form>
  );
}

export function PythonProblemDetail({ problemId, initialProblem, initialTestCases }: Props) {
  const { data: problem } = usePythonProblem(problemId, initialProblem);
  const { data: testCases } = usePythonTestCases(problemId, initialTestCases);
  const { data: submissions } = usePythonSubmissions(problemId);
  const { data: reviews } = usePythonReviews(problemId);
  const { profile } = useCurrentProfile();
  const [code, setCode] = useState(initialProblem.starter_code ?? '');
  const submit = useSubmitPythonCode(problemId, testCases ?? []);
  const submitForReview = useSubmitForReview(problemId);
  const addReview = useAddPythonReview(problemId);

  if (!problem) return null;

  const result = submit.data;
  const status = deriveReviewStatus({
    hasSubmissions: (submissions ?? []).length > 0,
    submittedForReviewAt: problem.submitted_for_review_at,
    latestReviewAt: (reviews ?? [])[0]?.created_at ?? null,
  });

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
        <span className="status-badge" data-status={status}>
          {STATUS_LABEL[status]}
        </span>
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
                <li key={r.position} className={r.passed ? 'pass' : 'fail'}>
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

      {result && result.bestPracticeFindings.length > 0 && (
        <div className="best-practice-panel">
          <div className="field-label">Best-practice suggestions</div>
          <ul className="best-practice-list">
            {result.bestPracticeFindings.map((finding, index) => (
              <li key={index}>{finding}</li>
            ))}
          </ul>
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
            {submission.best_practice_findings.length > 0 && (
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {submission.best_practice_findings.length} best-practice suggestion
                {submission.best_practice_findings.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
        ))}
      </div>

      {profile?.role === 'student' && (
        <div className="ex-actions">
          <button
            className="btn2 alt"
            onClick={() => submitForReview.mutate()}
            disabled={submitForReview.isPending || (submissions ?? []).length === 0}
          >
            Submit for review
          </button>
        </div>
      )}

      <h3 className="section-title" style={{ marginTop: 20 }}>
        Reviews
      </h3>
      {(reviews ?? []).length === 0 && <p className="empty-note">No reviews yet.</p>}
      {(reviews ?? []).map((review) => (
        <p key={review.id} style={{ fontSize: 12.5, margin: '4px 0' }}>
          <span style={{ color: 'var(--ink-dim)' }}>{review.body}</span>{' '}
          <span className="mono" style={{ color: 'var(--muted)', fontSize: 11 }}>
            {new Date(review.created_at).toLocaleString()}
          </span>
        </p>
      ))}
      {profile?.role === 'supporter' && (
        <ReviewForm onAdd={(body) => addReview.mutate({ body })} />
      )}
    </Card>
  );
}
