'use client';

import { useMasteryAttempts } from '@/lib/db/use-mastery-attempts';
import { useExamQuestionAttempts } from '@/lib/db/use-exam-question-attempts';

const ROUTE_LABEL: Record<string, string> = {
  quiz: 'Quiz',
  challenge: 'Programming challenge',
};

const EXAM_STATUS_LABEL: Record<string, string> = {
  pending: 'Marking…',
  marked: 'Marked',
  unmarkable: 'Unmarkable',
  failed: 'Marking failed',
};

type HistoryRow =
  | { kind: 'gate'; createdAt: string; render: React.ReactNode }
  | { kind: 'exam'; createdAt: string; render: React.ReactNode };

// Every past mastery-gate attempt for a topic - quiz, programming
// challenge, AND exam-question - merged into one timeline, newest first,
// visible to both accounts (design.md §6.13, specs/exam-question-bank/
// requirements.md §5.3: "one place to see every kind of attempt, not a
// parallel view"). The supporter can read this but never attempts the
// gate herself. A failed/not-passed attempt appears exactly like a
// successful one; nothing is hidden.
export function MasteryGateHistory({
  topicId,
  topicRef,
}: {
  topicId: string;
  topicRef: string;
}) {
  const { data: attempts, isLoading: gateLoading } =
    useMasteryAttempts(topicId);
  const { data: examAttempts, isLoading: examLoading } =
    useExamQuestionAttempts(topicRef);

  if (gateLoading || examLoading) return <p className="empty-note">Loading…</p>;

  const rows: HistoryRow[] = [
    ...(attempts ?? []).map((attempt): HistoryRow => ({
      kind: 'gate',
      createdAt: attempt.created_at,
      render: (
        <div
          key={`gate-${attempt.id}`}
          className={`mastery-attempt-row ${attempt.passed ? 'pass' : 'fail'}`}
        >
          <div className="mastery-attempt-head">
            <span
              className="result-badge"
              data-result={attempt.passed ? 'pass' : 'fail'}
            >
              {attempt.passed ? 'Passed' : 'Not passed'}
            </span>
            <span style={{ fontSize: 12.5 }}>{ROUTE_LABEL[attempt.route]}</span>
            <span
              className="mono"
              style={{ fontSize: 11, color: 'var(--muted)' }}
            >
              {new Date(attempt.created_at).toLocaleString()}
            </span>
            <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
              {attempt.score}/{attempt.max_score}
            </span>
          </div>
          <ul className="mastery-attempt-items">
            {attempt.mastery_attempt_items
              .sort((a, b) => a.position - b.position)
              .map((item) => (
                <li key={item.id} className={item.correct ? 'pass' : 'fail'}>
                  <span className="mono" style={{ fontSize: 11 }}>
                    {item.item_ref}
                  </span>{' '}
                  {item.correct ? 'correct' : 'incorrect'} —{' '}
                  <span style={{ color: 'var(--ink-dim)' }}>{item.answer}</span>
                </li>
              ))}
          </ul>
        </div>
      ),
    })),
    ...(examAttempts ?? []).map((attempt): HistoryRow => ({
      kind: 'exam',
      createdAt: attempt.created_at,
      render: (
        <div
          key={`exam-${attempt.id}`}
          className={`mastery-attempt-row ${attempt.marking_status === 'marked' ? 'pass' : 'fail'}`}
        >
          <div className="mastery-attempt-head">
            <span
              className="result-badge"
              data-result={
                attempt.marking_status === 'marked' ? 'pass' : 'fail'
              }
            >
              {EXAM_STATUS_LABEL[attempt.marking_status]}
            </span>
            <span style={{ fontSize: 12.5 }}>Exam question</span>
            <span
              className="mono"
              style={{ fontSize: 11, color: 'var(--muted)' }}
            >
              {new Date(attempt.created_at).toLocaleString()}
            </span>
            {attempt.marking_status === 'marked' && (
              <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
                {attempt.awarded}/{attempt.max}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-dim)', margin: 0 }}>
            <span className="mono">
              {attempt.question_id}
              {attempt.part && `(${attempt.part})`}
            </span>{' '}
            — {attempt.answer}
          </p>
        </div>
      ),
    })),
  ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (rows.length === 0) {
    return <p className="empty-note">No attempts yet.</p>;
  }

  return <div className="mastery-history">{rows.map((row) => row.render)}</div>;
}
