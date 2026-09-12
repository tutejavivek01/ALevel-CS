import type { ExamQuestionAttempt } from '@/lib/db/use-exam-question-attempts';

// One marking outcome, rendered per requirements.md §4.5's distinct
// pending/marked/unmarkable/failed states - a failed row gets a retry
// affordance rather than looking like a silent success or a 0-mark
// answer (design.md §5).
export function ExamAnswerResult({
  attempt,
  onRetry,
  retrying,
}: {
  attempt: ExamQuestionAttempt;
  onRetry: () => void;
  retrying: boolean;
}) {
  if (attempt.marking_status === 'pending') {
    return <p className="empty-note">Marking…</p>;
  }

  if (attempt.marking_status === 'failed') {
    return (
      <p className="ex-feedback no">
        Couldn&apos;t mark this answer —{' '}
        <button className="btn2 alt" onClick={onRetry} disabled={retrying}>
          {retrying ? 'Retrying…' : 'retry'}
        </button>
      </p>
    );
  }

  if (attempt.marking_status === 'unmarkable') {
    return (
      <div className="exam-result unmarkable">
        <div className="field-label">Unmarkable</div>
        <p style={{ fontSize: 12.5 }}>
          This part depends on a figure that isn&apos;t reproduced in the text,
          so it can&apos;t be marked from the answer alone.
        </p>
      </div>
    );
  }

  return (
    <div className="exam-result">
      <div className="exam-result-score">
        {attempt.awarded}/{attempt.max} marks
      </div>
      {attempt.credited && attempt.credited.length > 0 && (
        <div>
          <div className="field-label">Credited</div>
          <ul>
            {attempt.credited.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      {attempt.missed && attempt.missed.length > 0 && (
        <div>
          <div className="field-label">Missed</div>
          <ul>
            {attempt.missed.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
      {attempt.model_answer && (
        <div>
          <div className="field-label">Model answer</div>
          <p style={{ fontSize: 12.5, color: 'var(--ink-dim)' }}>
            {attempt.model_answer}
          </p>
        </div>
      )}
    </div>
  );
}
