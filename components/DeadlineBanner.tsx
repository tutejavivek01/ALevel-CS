'use client';

import Link from 'next/link';
import { Card } from './Card';
import { useNeaState } from '@/lib/db/use-nea-state';
import { getNeaDeadlines } from '@/lib/nea-progress';
import { useOcrChallengeDueDates } from '@/lib/db/use-ocr-challenge-reviews';
import { useOcrChallengeReviewStatuses } from '@/lib/db/use-ocr-challenge-review-statuses';
import { getOcrChallengeDeadlines } from '@/lib/ocr-challenge-deadlines';

// One combined deadlines banner, not several separate ones (task 27's
// original reasoning, carried forward) - an overdue OCR challenge
// belongs in the same list as an overdue NEA section. Python due dates
// were retired along with the ad hoc problem source (design.md §6.9,
// requirements.md §8.11); OCR challenge due dates (design.md §6.11)
// take their place here.
export function DeadlineBanner() {
  const { data: neaStateMap } = useNeaState();
  const neaDeadlines = getNeaDeadlines(neaStateMap ?? {});

  const { data: ocrDueDates } = useOcrChallengeDueDates();
  const { data: ocrReviewStatuses } = useOcrChallengeReviewStatuses();
  const ocrDeadlines = getOcrChallengeDeadlines(ocrDueDates ?? {}, ocrReviewStatuses ?? {});

  if (neaDeadlines.length === 0 && ocrDeadlines.length === 0) return null;

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
        {ocrDeadlines.map((deadline) => (
          <Link
            key={`ocr-${deadline.challenge.id}`}
            href={`/python/ocr/${deadline.challenge.id}`}
            style={{
              fontSize: 13,
              color: deadline.status === 'overdue' ? 'var(--warn)' : 'var(--ink)',
              textDecoration: 'none',
            }}
          >
            <strong>{deadline.status === 'overdue' ? 'Overdue' : 'Upcoming'}:</strong>{' '}
            {deadline.challenge.title} &middot; <span className="mono">{deadline.dueDate}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
