'use client';

import Link from 'next/link';
import { Card } from './Card';
import { usePythonProblems } from '@/lib/db/use-python-problems';
import { useCurrentProfile } from '@/lib/db/use-current-profile';

export function PythonProblemList() {
  const { data: problems, isLoading } = usePythonProblems();
  const { profile } = useCurrentProfile();

  return (
    <Card>
      <div className="topic-head">
        <div>
          <div className="ref">Py</div>
          <h2>Python Practice</h2>
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
        {(problems ?? []).map((problem) => (
          <Link key={problem.id} href={`/python/${problem.id}`} className="python-row">
            <div>
              <div className="title">{problem.title}</div>
              {problem.due_date && (
                <div className="due">Due {new Date(problem.due_date).toLocaleDateString()}</div>
              )}
            </div>
            {/* Real derived status (not-started/attempted/submitted-for-review/
                reviewed) lands in task 26 - placeholder until then. */}
            <span className="status-badge">Not started</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
