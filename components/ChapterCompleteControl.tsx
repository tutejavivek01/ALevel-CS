'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { MasteryQuizFlow } from './MasteryQuizFlow';
import { MasteryChallengeFlow } from './MasteryChallengeFlow';
import { useCurrentProfile } from '@/lib/db/use-current-profile';
import {
  useMasteryAttempts,
  useMasteryGateStatus,
} from '@/lib/db/use-mastery-attempts';
import {
  useCompleteTopic,
  useTopicCompletion,
} from '@/lib/db/use-topic-completion';
import { MASTERY_CHALLENGE_TOPICS } from '@/lib/exercises/mastery-challenges';

// Chapter-level completion. "Mark Complete" is the only thing that asks the
// test: if the topic's gate is already satisfied (e.g. the exam-question
// threshold) it completes straight away, otherwise it opens the quiz or
// programming challenges and completes on a pass. Completion is sticky.
export function ChapterCompleteControl({ topicId }: { topicId: string }) {
  const { profile } = useCurrentProfile();
  const { completedAt, isLoading } = useTopicCompletion(topicId);
  const { data: attempts } = useMasteryAttempts(topicId);
  const { passed: gatePassed } = useMasteryGateStatus(topicId);
  const complete = useCompleteTopic(topicId);
  const [modalOpen, setModalOpen] = useState(false);
  const isChallengeRoute = (
    MASTERY_CHALLENGE_TOPICS as readonly string[]
  ).includes(topicId);
  const isStudent = profile?.role === 'student';

  if (isLoading) return null;

  // attempts are ordered newest first.
  const latest = attempts?.[0];

  function handleClick() {
    if (gatePassed) {
      complete.mutate();
    } else {
      setModalOpen(true);
    }
  }

  return (
    <div className="chapter-status">
      {completedAt ? (
        <span className="chapter-complete">
          ✓ Completed {new Date(completedAt).toLocaleDateString()}
        </span>
      ) : (
        <>
          {latest && (
            <span className="chapter-attempted">
              Test attempted — not passed ({latest.score}/{latest.max_score})
            </span>
          )}
          {isStudent && (
            <button type="button" className="btn2" onClick={handleClick}>
              Mark Complete
            </button>
          )}
        </>
      )}
      {complete.isError && (
        <span className="ex-feedback no">
          Couldn&apos;t save —{' '}
          <button className="btn2 alt" onClick={() => complete.retry()}>
            retry
          </button>
        </span>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Mark Complete — test your knowledge"
      >
        {/* Only mounted while open so each attempt starts fresh (Modal.tsx
            keeps the <dialog> in the DOM across opens). The Modal stays
            rendered after completion so the student still sees the pass
            result screen until they close it. */}
        {modalOpen &&
          (isChallengeRoute ? (
            <MasteryChallengeFlow
              topicId={topicId}
              onDone={() => setModalOpen(false)}
              onPassed={() => complete.mutate()}
            />
          ) : (
            <MasteryQuizFlow
              topicId={topicId}
              onDone={() => setModalOpen(false)}
              onPassed={() => complete.mutate()}
            />
          ))}
      </Modal>
    </div>
  );
}
