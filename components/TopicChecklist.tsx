'use client';

import { useQueryClient } from '@tanstack/react-query';
import { StatusSegmentedControl } from './StatusSegmentedControl';
import { SupporterFlag } from './SupporterFlag';
import { useCurrentProfile } from '@/lib/db/use-current-profile';
import {
  subtopicStatusQueryKey,
  useSetSubtopicStatus,
  useSubtopicStatuses,
} from '@/lib/db/use-subtopic-status';
import { lastTouchedQueryKey, useLastTouched } from '@/lib/db/use-subtopic-history';
import {
  subtopicFlagsQueryKey,
  useAddSubtopicFlag,
  useSubtopicFlags,
} from '@/lib/db/use-subtopic-flags';
import { useRealtimeTables } from '@/lib/db/use-realtime-tables';
import { subtopicId } from '@/lib/spec/subtopics';

const REALTIME_TABLES = ['subtopic_status', 'subtopic_status_history', 'subtopic_flags'];

export function TopicChecklist({
  topicId,
  items,
}: {
  topicId: string;
  items: string[];
}) {
  const queryClient = useQueryClient();
  const { profile } = useCurrentProfile();
  const { data: statuses, isLoading } = useSubtopicStatuses(topicId);
  const { data: lastTouched } = useLastTouched(topicId);
  const { data: flags } = useSubtopicFlags(topicId);
  const setStatus = useSetSubtopicStatus(topicId);
  const addFlag = useAddSubtopicFlag(topicId);

  // One combined subscription for every table this page needs, not three
  // independent ones - see lib/db/use-realtime-tables.ts.
  useRealtimeTables(REALTIME_TABLES, (table) => {
    if (table === 'subtopic_status') {
      queryClient.invalidateQueries({ queryKey: subtopicStatusQueryKey(topicId) });
    } else if (table === 'subtopic_status_history') {
      queryClient.invalidateQueries({ queryKey: lastTouchedQueryKey(topicId) });
    } else if (table === 'subtopic_flags') {
      queryClient.invalidateQueries({ queryKey: subtopicFlagsQueryKey(topicId) });
    }
  });

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
          const touchedAt = lastTouched?.[id];

          return (
            <div key={id}>
              <div className="check-row">
                <div className="label">
                  {item}
                  {touchedAt && (
                    <div style={{ fontSize: 11, color: 'var(--ink-dim)', marginTop: 2 }}>
                      Last touched {new Date(touchedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <StatusSegmentedControl
                  value={value}
                  disabled={profile?.role !== 'student'}
                  onChange={(status) => setStatus.mutate({ subtopicId: id, status })}
                />
              </div>
              <SupporterFlag
                flags={flags?.[id] ?? []}
                canWrite={profile?.role === 'supporter'}
                onAdd={(body) => addFlag.mutate({ subtopicId: id, body })}
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
