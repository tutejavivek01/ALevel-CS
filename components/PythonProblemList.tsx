'use client';

import Link from 'next/link';
import { Card } from './Card';
import { usePythonProblems } from '@/lib/db/use-python-problems';
import { useCurrentProfile } from '@/lib/db/use-current-profile';
import { usePythonReviewStatuses } from '@/lib/db/use-python-review-statuses';

const STATUS_LABEL: Record<string, string> = {
  'not-started': 'Not started',
  attempted: 'Attempted',
  'submitted-for-review': 'Submitted for review',
  reviewed: 'Reviewed',
};

export function PythonProblemList() {
  const { data: problems, isLoading } = usePythonProblems();
  const { data: reviewStatuses } = usePythonReviewStatuses();
  const { profile } = useCurrentProfile();

  return (
    <Card>
      <div className="topic-head">
        <div>
          <div className="ref">Py</div>
          <h2>Custom problems</h2>
        </div>
        {profile?.role === 'supporter' && (
          <Link href="/python/new" className="btn2">
            + New problem
          </Link>
        )}
      </div>

      {isLoading && <p className="empty-note">Loading…</p>}
      {!isLoading && (problems ?? []).length === 0 && (
        <p className="empty-note">No problems yet.</p>
      )}

      <div className="python-list">
        {(problems ?? []).map((problem) => {
          const status = reviewStatuses?.[problem.id] ?? 'not-started';
          return (
            <Link key={problem.id} href={`/python/${problem.id}`} className="python-row">
              <div>
                <div className="title">{problem.title}</div>
                {problem.due_date && (
                  <div className="due">Due {new Date(problem.due_date).toLocaleDateString()}</div>
                )}
              </div>
              <span className="status-badge" data-status={status}>
                {STATUS_LABEL[status]}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
