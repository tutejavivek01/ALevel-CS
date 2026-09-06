'use client';

import Link from 'next/link';
import { Card } from './Card';
import { useNeaState } from '@/lib/db/use-nea-state';
import { getNeaDeadlines } from '@/lib/nea-progress';
import { usePythonProblems } from '@/lib/db/use-python-problems';
import { usePythonReviewStatuses } from '@/lib/db/use-python-review-statuses';
import { getPythonDeadlines } from '@/lib/python-deadlines';

// One combined deadlines banner, not two separate ones (task 27:
// "extend the dashboard banner from task 14" - not add a second) - a
// Python problem past its due date belongs in the same overdue list as
// an overdue NEA section, per requirements.md §8.1's due-date parity.
export function DeadlineBanner() {
  const { data: neaStateMap } = useNeaState();
  const neaDeadlines = getNeaDeadlines(neaStateMap ?? {});

  const { data: pythonProblems } = usePythonProblems();
  const { data: pythonReviewStatuses } = usePythonReviewStatuses();
  const pythonDeadlines = getPythonDeadlines(pythonProblems ?? [], pythonReviewStatuses ?? {});

  if (neaDeadlines.length === 0 && pythonDeadlines.length === 0) return null;

  return (
    <Card>
      <h3 className="section-title">Deadlines</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {neaDeadlines.map((deadline) => (
          <Link
            key={`nea-${deadline.section.id}`}
            href="/nea"
            style={{
              fontSize: 13,
              color: deadline.status === 'overdue' ? 'var(--warn)' : 'var(--ink)',
              textDecoration: 'none',
            }}
          >
            <strong>{deadline.status === 'overdue' ? 'Overdue' : 'Upcoming'}:</strong>{' '}
            {deadline.section.name} &middot; <span className="mono">{deadline.targetDate}</span>
          </Link>
        ))}
        {pythonDeadlines.map((deadline) => (
          <Link
            key={`python-${deadline.problem.id}`}
            href={`/python/${deadline.problem.id}`}
            style={{
              fontSize: 13,
              color: deadline.status === 'overdue' ? 'var(--warn)' : 'var(--ink)',
              textDecoration: 'none',
            }}
          >
            <strong>{deadline.status === 'overdue' ? 'Overdue' : 'Upcoming'}:</strong>{' '}
            {deadline.problem.title} &middot; <span className="mono">{deadline.dueDate}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
