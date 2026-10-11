'use client';

import { ProgressRing } from './ProgressRing';
import { useAllTopicCompletion } from '@/lib/db/use-topic-completion';
import { chapterProgress } from '@/lib/progress';

export function OverallProgress() {
  const { data: completion, isLoading } = useAllTopicCompletion();
  const progress = chapterProgress(completion ?? {});

  return (
    <>
      <ProgressRing percent={isLoading ? 0 : progress.pct} size={44} stroke={5} />
      <div>
        <div className="num">{isLoading ? '…' : `${progress.pct}%`}</div>
        <div className="lbl">
          {isLoading ? 'loading' : `${progress.completed}/${progress.total} chapters complete`}
        </div>
      </div>
    </>
  );
}
