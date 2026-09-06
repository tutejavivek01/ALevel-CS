'use client';

import { ProgressRing } from './ProgressRing';
import { useAllSubtopicStatuses } from '@/lib/db/use-all-subtopic-statuses';
import { overallProgress } from '@/lib/progress';

export function OverallProgress() {
  const { data: statuses, isLoading } = useAllSubtopicStatuses();
  const progress = overallProgress(statuses ?? {});

  return (
    <>
      <ProgressRing percent={isLoading ? 0 : progress.pct} size={44} stroke={5} />
      <div>
        <div className="num">{isLoading ? '…' : `${progress.pct}%`}</div>
        <div className="lbl">
          {isLoading ? 'loading' : `${progress.confident}/${progress.total} confident`}
        </div>
      </div>
    </>
  );
}
