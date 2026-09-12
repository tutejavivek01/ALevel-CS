'use client';

import { useMasteryAttempts } from '@/lib/db/use-mastery-attempts';

const ROUTE_LABEL: Record<string, string> = {
  quiz: 'Quiz',
  challenge: 'Programming challenge',
};

// Every past mastery-gate attempt for a topic, newest first, visible to
// both accounts (design.md §6.13, requirements.md §12.4/§12.6) - the
// supporter can read this but never attempts the gate herself. A failed
// attempt appears exactly like a passing one; nothing is hidden.
export function MasteryGateHistory({ topicId }: { topicId: string }) {
  const { data: attempts, isLoading } = useMasteryAttempts(topicId);

  if (isLoading) return <p className="empty-note">Loading…</p>;
  if (!attempts || attempts.length === 0) {
    return <p className="empty-note">No attempts yet.</p>;
  }

  return (
    <div className="mastery-history">
      {attempts.map((attempt) => (
        <div
          key={attempt.id}
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
      ))}
    </div>
  );
}
