'use client';

import Link from 'next/link';
import { Card } from './Card';
import { useNeaState } from '@/lib/db/use-nea-state';
import { getNeaDeadlines } from '@/lib/nea-progress';

export function NeaDeadlineBanner() {
  const { data: stateMap } = useNeaState();
  const deadlines = getNeaDeadlines(stateMap ?? {});

  if (deadlines.length === 0) return null;

  return (
    <Card>
      <h3 className="section-title">NEA deadlines</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {deadlines.map((deadline) => (
          <Link
            key={deadline.section.id}
            href="/nea"
            style={{
              fontSize: 13,
              color: deadline.status === 'overdue' ? 'var(--warn)' : 'var(--ink)',
              textDecoration: 'none',
            }}
          >
            <strong>{deadline.status === 'overdue' ? 'Overdue' : 'Upcoming'}:</strong>{' '}
            {deadline.section.name} &middot;{' '}
            <span className="mono">{deadline.targetDate}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
