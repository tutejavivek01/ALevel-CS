'use client';

import Link from 'next/link';
import { Card } from './Card';
import { OCR_CHALLENGES } from '@/lib/exercises/ocr-challenges';
import { useOcrChallengeReviewStatuses } from '@/lib/db/use-ocr-challenge-review-statuses';
import { useOcrChallengeDueDates } from '@/lib/db/use-ocr-challenge-reviews';
import { isOcrChallengeOverdue } from '@/lib/ocr-challenge-deadlines';

const STATUS_LABEL: Record<string, string> = {
  'not-started': 'Not started',
  attempted: 'Attempted',
  'submitted-for-review': 'Submitted for review',
  reviewed: 'Reviewed',
};

export function OcrChallengeList() {
  const { data: reviewStatuses } = useOcrChallengeReviewStatuses();
  const { data: dueDates } = useOcrChallengeDueDates();

  return (
    <Card>
      <div className="topic-head">
        <div>
          <div className="ref">Py</div>
          <h2>OCR Coding Challenges</h2>
        </div>
      </div>

      <div className="python-list">
        {OCR_CHALLENGES.map((challenge) => {
          const status = reviewStatuses?.[challenge.id] ?? 'not-started';
          const dueDate = dueDates?.[challenge.id];
          const overdue = status !== 'reviewed' && !!dueDate && isOcrChallengeOverdue(dueDate);
          return (
            <Link
              key={challenge.id}
              href={`/python/ocr/${challenge.id}`}
              className="python-row"
            >
              <div>
                <div className="title">
                  {challenge.number}. {challenge.title}
                </div>
                {!challenge.testCases && <div className="due">Manual review only</div>}
                {dueDate && (
                  <div className={`due${overdue ? ' overdue' : ''}`}>
                    {overdue ? 'Overdue' : 'Due'}: {dueDate}
                  </div>
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
