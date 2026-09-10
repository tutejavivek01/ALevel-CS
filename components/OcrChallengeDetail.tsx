'use client';

import { useState } from 'react';
import { Card } from './Card';
import { PythonEditor } from './PythonEditor';
import type { OcrChallenge } from '@/lib/exercises/ocr-challenges';
import {
  useOcrChallengeSubmissions,
  useSubmitOcrChallengeCode,
} from '@/lib/db/use-ocr-challenge-submissions';
import {
  useOcrChallengeReviews,
  useAddOcrChallengeReview,
  useOcrChallengeReviewState,
  useSubmitOcrChallengeForReview,
  useSetOcrChallengeDueDate,
} from '@/lib/db/use-ocr-challenge-reviews';
import {
  useOcrChallengeCodeVersions,
  useSaveOcrChallengeCodeVersion,
  type OcrChallengeCodeVersion,
} from '@/lib/db/use-ocr-challenge-code-versions';
import { useAddOcrChallengeVersionComment } from '@/lib/db/use-ocr-challenge-version-comments';
import { useCurrentProfile } from '@/lib/db/use-current-profile';
import { deriveReviewStatus } from '@/lib/exercises/python-review-status';
import { isOcrChallengeOverdue } from '@/lib/ocr-challenge-deadlines';
import { PYTHON_EXEC_TIMEOUT_MS } from '@/lib/config';

type Props = {
  challenge: OcrChallenge;
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

// Feedback on one specific saved version (design.md §6.10) - the same
// shape as ReviewForm above, scoped to a version instead of the whole
// challenge.
function VersionCommentForm({ onAdd }: { onAdd: (body: string) => void }) {
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
        placeholder="Comment on this version…"
        style={{ flex: 1 }}
      />
      <button type="submit" className="btn2 alt">
        Add comment
      </button>
    </form>
  );
}

function VersionRow({ challengeId, version }: { challengeId: string; version: OcrChallengeCodeVersion }) {
  const { profile } = useCurrentProfile();
  const addComment = useAddOcrChallengeVersionComment(challengeId, version.id);

  return (
    <div className="version-row">
      <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
        {new Date(version.created_at).toLocaleString()}
      </span>
      <pre className="mono">{version.code}</pre>
      {version.syntax_error && (
        <div className="version-syntax-error">
          <div className="field-label">Syntax error</div>
          <pre>{version.syntax_error}</pre>
        </div>
      )}
      {version.best_practice_findings.length > 0 && (
        <div className="version-best-practice-panel">
          <div className="field-label">Best-practice suggestions</div>
          <ul className="version-best-practice-list">
            {version.best_practice_findings.map((finding, index) => (
              <li key={index}>{finding}</li>
            ))}
          </ul>
        </div>
      )}
      {version.ocr_challenge_version_comments.length > 0 && (
        <div className="version-comments">
          {version.ocr_challenge_version_comments.map((comment) => (
            <p key={comment.id} style={{ fontSize: 12.5, margin: 0 }}>
              <span style={{ color: 'var(--ink-dim)' }}>{comment.body}</span>{' '}
              <span className="mono" style={{ color: 'var(--muted)', fontSize: 11 }}>
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </p>
          ))}
        </div>
      )}
      {profile?.role === 'supporter' && (
        <VersionCommentForm onAdd={(body) => addComment.mutate(body)} />
      )}
    </div>
  );
}

export function OcrChallengeDetail({ challenge }: Props) {
  const testCases = challenge.testCases ?? [];
  const { data: submissions } = useOcrChallengeSubmissions(challenge.id);
  const { data: versions } = useOcrChallengeCodeVersions(challenge.id);
  const { data: reviews } = useOcrChallengeReviews(challenge.id);
  const { data: reviewState } = useOcrChallengeReviewState(challenge.id);
  const { profile } = useCurrentProfile();
  const [code, setCode] = useState(challenge.starterCode ?? '');
  const submit = useSubmitOcrChallengeCode(challenge.id, testCases);
  const saveVersion = useSaveOcrChallengeCodeVersion(challenge.id);
  const submitForReview = useSubmitOcrChallengeForReview(challenge.id);
  const addReview = useAddOcrChallengeReview(challenge.id);
  const setDueDate = useSetOcrChallengeDueDate(challenge.id);

  const result = submit.data;
  const hasAttempts = (submissions ?? []).length > 0 || (versions ?? []).length > 0;
  const status = deriveReviewStatus({
    hasSubmissions: hasAttempts,
    submittedForReviewAt: reviewState?.submitted_for_review_at ?? null,
    latestReviewAt: (reviews ?? [])[0]?.created_at ?? null,
  });

  // Jointly editable by either role (design.md §6.11, requirements.md
  // §8.13) - a genuine departure from every other piece of OCR mutable
  // state, which is student-writes/supporter-reviews only.
  const dueDate = reviewState?.due_date ?? null;
  const isOverdue = status !== 'reviewed' && !!dueDate && isOcrChallengeOverdue(dueDate);

  return (
    <Card>
      <div className="topic-head">
        <div>
          <div className="ref">Py · #{challenge.number}</div>
          <h2>{challenge.title}</h2>
          {testCases.length === 0 && (
            <span className="unit-badge">Manual review only - no automated tests</span>
          )}
        </div>
        <span className="status-badge" data-status={status}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <span className="field-label">Due date</span>
        <input
          type="date"
          value={dueDate ?? ''}
          onChange={(e) => setDueDate.mutate(e.target.value || null)}
        />
        {isOverdue && (
          <span className="due overdue" style={{ fontWeight: 600 }}>
            Overdue
          </span>
        )}
      </div>

      <p className="blurb" style={{ whiteSpace: 'pre-wrap' }}>
        {challenge.description}
      </p>

      {/* No challenge currently sets imageUrl (see ocr-challenges.ts's
          header comment on "Checkmate checker") - rendering for it isn't
          built here yet, to avoid carrying unused, unexercised UI. */}

      {challenge.extensions && challenge.extensions.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginTop: 20 }}>
            Extensions (optional)
          </h3>
          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {challenge.extensions.map((extension, index) => (
              <li key={index} style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
                {extension}
              </li>
            ))}
          </ul>
        </>
      )}

      {testCases.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginTop: 20 }}>
            Test cases
          </h3>
          <div className="test-case-list">
            {testCases.map((testCase, index) => (
              <div className="test-case-view" key={index}>
                <div className="field-label">Test {index + 1}</div>
                {testCase.input && <pre className="mono">Input: {testCase.input}</pre>}
                <pre className="mono">Expected: {testCase.expectedOutput}</pre>
              </div>
            ))}
          </div>
        </>
      )}

      <h3 className="section-title" style={{ marginTop: 20 }}>
        Your code
      </h3>
      <PythonEditor value={code} onChange={setCode} />

      <div className="ex-actions">
        {testCases.length > 0 && (
          <button className="btn2" onClick={() => submit.mutate(code)} disabled={submit.isPending}>
            {submit.isPending ? 'Running…' : 'Run'}
          </button>
        )}
        <button
          className="btn2 alt"
          onClick={() => saveVersion.mutate(code)}
          disabled={saveVersion.isPending}
        >
          {saveVersion.isPending ? 'Saving…' : 'Save'}
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
              {submission.ocr_challenge_submission_results.filter((r) => r.passed).length} /{' '}
              {submission.ocr_challenge_submission_results.length} test cases passed
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

      <h3 className="section-title" style={{ marginTop: 20 }}>
        Saved versions
      </h3>
      {(versions ?? []).length === 0 && <p className="empty-note">No saved versions yet.</p>}
      <div className="version-list">
        {(versions ?? []).map((version) => (
          <VersionRow key={version.id} challengeId={challenge.id} version={version} />
        ))}
      </div>

      {profile?.role === 'student' && (
        <div className="ex-actions">
          <button
            className="btn2 alt"
            onClick={() => submitForReview.mutate()}
            disabled={submitForReview.isPending || !hasAttempts}
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
