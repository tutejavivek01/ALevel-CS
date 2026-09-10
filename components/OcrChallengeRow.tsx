'use client';

import Link from 'next/link';
import type { OcrChallenge } from '@/lib/exercises/ocr-challenges';
import type { PythonReviewStatus } from '@/lib/exercises/python-review-status';
import { useSetOcrChallengeDueDate } from '@/lib/db/use-ocr-challenge-reviews';
import { isOcrChallengeOverdue } from '@/lib/ocr-challenge-deadlines';

const STATUS_LABEL: Record<PythonReviewStatus, string> = {
  'not-started': 'Not started',
  attempted: 'Attempted',
  'submitted-for-review': 'Submitted for review',
  reviewed: 'Reviewed',
};

type Props = {
  challenge: OcrChallenge;
  status: PythonReviewStatus;
  dueDate: string | null;
};

// One /python list row. Split out of OcrChallengeList so the per-challenge
// useSetOcrChallengeDueDate hook isn't called inside a .map(). The row is
// a plain function of its props - the due date comes from the
// all-challenges map the list already holds, not a per-row subscription.
export function OcrChallengeRow({ challenge, status, dueDate }: Props) {
  const setDueDate = useSetOcrChallengeDueDate(challenge.id);
  const overdue =
    status !== 'reviewed' && !!dueDate && isOcrChallengeOverdue(dueDate);

  return (
    <div className="python-row">
      <Link href={`/python/ocr/${challenge.id}`} className="python-row-main">
        <div>
          <div className="title">
            {challenge.number}. {challenge.title}
          </div>
          {!challenge.testCases && (
            <div className="due">Manual review only</div>
          )}
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
      {/* Outside the <Link> - a click or keypress in the date picker must
          never navigate (design.md §6.11: jointly editable from the list
          row too, not only the detail page). */}
      <label className="python-row-due">
        <span className="field-label">Due</span>
        <input
          type="date"
          value={dueDate ?? ''}
          onChange={(e) => setDueDate.mutate(e.target.value || null)}
        />
      </label>
    </div>
  );
}
