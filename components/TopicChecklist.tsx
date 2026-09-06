'use client';

import { StatusSegmentedControl } from './StatusSegmentedControl';
import { useCurrentProfile } from '@/lib/db/use-current-profile';
import { useSetSubtopicStatus, useSubtopicStatuses } from '@/lib/db/use-subtopic-status';
import { subtopicId } from '@/lib/spec/subtopics';

export function TopicChecklist({
  topicId,
  items,
}: {
  topicId: string;
  items: string[];
}) {
  const { profile } = useCurrentProfile();
  const { data: statuses, isLoading } = useSubtopicStatuses(topicId);
  const setStatus = useSetSubtopicStatus(topicId);

  const confidentCount = isLoading
    ? 0
    : items.filter(
        (_, index) => statuses?.[subtopicId(topicId, index)] === 'confident'
      ).length;

  return (
    <>
      <h3 className="section-title" style={{ marginTop: 22 }}>
        Checklist — {isLoading ? '…' : `${confidentCount}/${items.length} confident`}
      </h3>
      <div className="checklist">
        {items.map((item, index) => {
          const id = subtopicId(topicId, index);
          const value = statuses?.[id] ?? 'not-started';
          return (
            <div className="check-row" key={id}>
              <div className="label">{item}</div>
              <StatusSegmentedControl
                value={value}
                disabled={profile?.role !== 'student'}
                onChange={(status) => setStatus.mutate({ subtopicId: id, status })}
              />
            </div>
          );
        })}
      </div>
      {setStatus.isError && (
        <p className="ex-feedback no">
          Couldn&apos;t save —{' '}
          <button className="btn2 alt" onClick={() => setStatus.retry()}>
            retry
          </button>
        </p>
      )}
    </>
  );
}
