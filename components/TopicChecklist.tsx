'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { StatusSegmentedControl } from './StatusSegmentedControl';
import { SupporterFlag } from './SupporterFlag';
import { Modal } from './Modal';
import { MasteryQuizFlow } from './MasteryQuizFlow';
import { MasteryChallengeFlow } from './MasteryChallengeFlow';
import { MasteryGateHistory } from './MasteryGateHistory';
import { useCurrentProfile } from '@/lib/db/use-current-profile';
import {
  subtopicStatusQueryKey,
  useSetSubtopicStatus,
  useSubtopicStatuses,
  type SubtopicStatusValue,
} from '@/lib/db/use-subtopic-status';
import {
  lastTouchedQueryKey,
  useLastTouched,
} from '@/lib/db/use-subtopic-history';
import {
  subtopicFlagsQueryKey,
  useAddSubtopicFlag,
  useSubtopicFlags,
} from '@/lib/db/use-subtopic-flags';
import { useRealtimeTables } from '@/lib/db/use-realtime-tables';
import { subtopicId } from '@/lib/spec/subtopics';
import { useMasteryGateStatus } from '@/lib/db/use-mastery-attempts';
import { MASTERY_CHALLENGE_TOPICS } from '@/lib/exercises/mastery-challenges';

const REALTIME_TABLES = [
  'subtopic_status',
  'subtopic_status_history',
  'subtopic_flags',
];

export function TopicChecklist({
  topicId,
  topicRef,
  items,
}: {
  topicId: string;
  topicRef: string;
  items: string[];
}) {
  const queryClient = useQueryClient();
  const { profile } = useCurrentProfile();
  const { data: statuses, isLoading } = useSubtopicStatuses(topicId);
  const { data: lastTouched } = useLastTouched(topicId);
  const { data: flags } = useSubtopicFlags(topicId);
  const setStatus = useSetSubtopicStatus(topicId);
  const addFlag = useAddSubtopicFlag(topicId);
  const { passed: gatePassed } = useMasteryGateStatus(topicId);
  const isChallengeRoute = (
    MASTERY_CHALLENGE_TOPICS as readonly string[]
  ).includes(topicId);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // The mastery gate (design.md §6.13, requirements.md §12): setting a
  // subtopic to `confident` is blocked until the topic's quiz or
  // programming-challenge gate has been passed at least once. Every other
  // status transition is unaffected - the gate only intercepts this one
  // target value.
  function handleStatusChange(id: string, targetStatus: SubtopicStatusValue) {
    if (targetStatus === 'confident' && !gatePassed) {
      setTestModalOpen(true);
      return;
    }
    setStatus.mutate({ subtopicId: id, status: targetStatus });
  }

  // One combined subscription for every table this page needs, not three
  // independent ones - see lib/db/use-realtime-tables.ts.
  useRealtimeTables(REALTIME_TABLES, (table) => {
    if (table === 'subtopic_status') {
      queryClient.invalidateQueries({
        queryKey: subtopicStatusQueryKey(topicId),
      });
    } else if (table === 'subtopic_status_history') {
      queryClient.invalidateQueries({ queryKey: lastTouchedQueryKey(topicId) });
    } else if (table === 'subtopic_flags') {
      queryClient.invalidateQueries({
        queryKey: subtopicFlagsQueryKey(topicId),
      });
    }
  });

  const confidentCount = isLoading
    ? 0
    : items.filter(
        (_, index) => statuses?.[subtopicId(topicId, index)] === 'confident'
      ).length;

  return (
    <>
      <div className="checklist-head">
        <h3
          className="section-title"
          style={{ marginTop: 22, marginBottom: 0 }}
        >
          Checklist —{' '}
          {isLoading ? '…' : `${confidentCount}/${items.length} confident`}
        </h3>
        <div className="mastery-gate-links">
          {profile?.role === 'student' && (
            <button
              type="button"
              className="link-btn"
              onClick={() => setTestModalOpen(true)}
            >
              Test knowledge
            </button>
          )}
          <button
            type="button"
            className="link-btn"
            onClick={() => setHistoryModalOpen(true)}
          >
            History
          </button>
        </div>
      </div>
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
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--ink-dim)',
                        marginTop: 2,
                      }}
                    >
                      Last touched {new Date(touchedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <StatusSegmentedControl
                  value={value}
                  disabled={profile?.role !== 'student'}
                  onChange={(status) => handleStatusChange(id, status)}
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

      <Modal
        open={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title="Test knowledge"
      >
        {/* Only mounted while open, not merely hidden - the <dialog>
            itself stays in the DOM across opens/closes (Modal.tsx), so a
            fresh mount each time is what resets the flow's own draft/
            result state between attempts, rather than carrying the
            previous attempt's result screen into a re-open. */}
        {testModalOpen &&
          (isChallengeRoute ? (
            <MasteryChallengeFlow
              topicId={topicId}
              onDone={() => setTestModalOpen(false)}
            />
          ) : (
            <MasteryQuizFlow
              topicId={topicId}
              onDone={() => setTestModalOpen(false)}
            />
          ))}
      </Modal>
      <Modal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="History"
      >
        <MasteryGateHistory topicId={topicId} topicRef={topicRef} />
      </Modal>
    </>
  );
}
