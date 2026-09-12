'use client';

import { useEffect, useState } from 'react';
import { ExamAnswerResult } from './ExamAnswerResult';
import {
  useSubmitExamAnswer,
  type ExamQuestionAttempt,
} from '@/lib/db/use-exam-question-attempts';

// Per-part answer, submit, and result (requirements.md §3, §4). Autosave
// is a per-viewer localStorage draft, not shared state - the permanent,
// shared record is the exam_question_attempts row created on submit
// (design.md §5). Wrapped in try/catch: a private window or blocked
// storage must not break the form itself.
function draftKey(questionId: string, part: string) {
  return `exam-draft:${questionId}:${part}`;
}

export function ExamAnswerForm({
  topicRef,
  questionId,
  part,
  marks,
  latestAttempt,
}: {
  topicRef: string;
  questionId: string;
  part: string;
  marks: number | null;
  latestAttempt: ExamQuestionAttempt | undefined;
}) {
  const [draft, setDraft] = useState('');
  const submit = useSubmitExamAnswer(topicRef);

  // Reading localStorage (an external system) on mount, per this rule's
  // own documented exception - not synchronizing React state derived
  // from props/state. Starting the textarea at '' server-side and
  // client-first-paint, then filling in the saved draft, avoids a
  // hydration mismatch (window/localStorage don't exist during SSR).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(draftKey(questionId, part));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setDraft(saved);
    } catch {
      // storage unavailable - form still works, just without a draft.
    }
  }, [questionId, part]);

  function updateDraft(value: string) {
    setDraft(value);
    try {
      window.localStorage.setItem(draftKey(questionId, part), value);
    } catch {
      // per-viewer convenience only - never block on this.
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit.mutateAsync({ questionId, part, answer: draft });
  }

  // Rows scale with the part's marks (requirements.md §2.2) - a rough
  // heuristic, not a precise measurement: more marks implies a longer
  // expected answer.
  const rows = marks ? Math.max(2, Math.min(10, Math.ceil(marks / 2) + 1)) : 3;

  return (
    <div className="exam-answer">
      <form onSubmit={handleSubmit}>
        <textarea
          className="exam-answer-textarea"
          rows={rows}
          value={draft}
          onChange={(e) => updateDraft(e.target.value)}
          placeholder="Write your answer…"
        />
        <div className="ex-actions">
          <button
            type="submit"
            className="btn2"
            disabled={submit.isPending || draft.trim().length === 0}
          >
            {submit.isPending ? 'Submitting…' : 'Submit answer'}
          </button>
        </div>
        {submit.isError && (
          <p className="ex-feedback no">{(submit.error as Error).message}</p>
        )}
      </form>
      {latestAttempt && (
        <ExamAnswerResult
          attempt={latestAttempt}
          retrying={submit.isPending}
          onRetry={() =>
            submit.mutate({ questionId, part, answer: latestAttempt.answer })
          }
        />
      )}
    </div>
  );
}
