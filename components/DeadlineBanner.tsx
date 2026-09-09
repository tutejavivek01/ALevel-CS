'use client';

import Link from 'next/link';
import { Card } from './Card';
import { useNeaState } from '@/lib/db/use-nea-state';
import { getNeaDeadlines } from '@/lib/nea-progress';

// Python due dates are retired along with the ad hoc problem source
// (design.md §6.9, requirements.md §8.11) - this banner is NEA-only
// until task 41 adds OCR challenge due dates back in (design.md §6.11),
// reusing this same combined-banner shape rather than a second banner.
export function DeadlineBanner() {
  const { data: neaStateMap } = useNeaState();
  const neaDeadlines = getNeaDeadlines(neaStateMap ?? {});

  if (neaDeadlines.length === 0) return null;

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
      </div>
    </Card>
  );
}
