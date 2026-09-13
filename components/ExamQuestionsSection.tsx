'use client';

import { useEffect, useState } from 'react';
import { getExamChaptersForTopic } from '@/lib/exercises/exam-question-bank';
import { computeTopicExamProgress } from '@/lib/exercises/exam-question-progress';
import {
  latestAttemptsByPart,
  useExamQuestionAttempts,
} from '@/lib/db/use-exam-question-attempts';
import { ExamChapterTabs } from './ExamChapterTabs';

const YEAR_13_LEVEL = 'A Level (Year 13)';
const YEAR_13_PREF_KEY = 'exam-include-year-13';

// requirements.md §2.5 - a client-only preference (one of the two options
// left open in §7), not tied to any one topic: once a student says "show
// me Year 13 questions" they'd want that everywhere, not per-page. Wrapped
// in try/catch like every other localStorage use in this app - a private
// window or blocked storage must not break the filter itself.
function readYear13Pref(): boolean {
  try {
    return window.localStorage.getItem(YEAR_13_PREF_KEY) === 'true';
  } catch {
    return false;
  }
}

// The "Exam questions" section on a topic detail page (specs/
// exam-question-bank/requirements.md §2.1). Server-rendered content
// (getExamChaptersForTopic) combined with client-side attempt state -
// this component itself is the client boundary, like TopicChecklist.
export function ExamQuestionsSection({ topicRef }: { topicRef: string }) {
  const allChapters = getExamChaptersForTopic(topicRef);
  const [includeYear13, setIncludeYear13] = useState(false);

  // Starting at false server-side/first-paint and filling in the saved
  // preference on mount avoids a hydration mismatch (window/localStorage
  // don't exist during SSR) - same pattern as ExamAnswerForm's draft.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIncludeYear13(readYear13Pref());
  }, []);

  function updateIncludeYear13(value: boolean) {
    setIncludeYear13(value);
    try {
      window.localStorage.setItem(YEAR_13_PREF_KEY, String(value));
    } catch {
      // per-viewer convenience only - never block on this.
    }
  }

  const chapters = includeYear13
    ? allChapters
    : allChapters.filter((c) => c.level !== YEAR_13_LEVEL);
  const hasYear13 = allChapters.some((c) => c.level === YEAR_13_LEVEL);

  const { data: attempts } = useExamQuestionAttempts(topicRef);
  const latest = latestAttemptsByPart(attempts ?? []);
  const progress = computeTopicExamProgress(chapters, latest);

  if (allChapters.length === 0) return null;

  return (
    <section className="exam-questions-section">
      <h3 className="section-title" style={{ marginTop: 20 }}>
        Exam questions
      </h3>
      <div className="exam-progress-summary">
        <span>
          {progress.partsAttempted}/{progress.totalParts} attempted
        </span>
        <span>
          {progress.marksAwarded}/{progress.marksAvailable} marks
        </span>
        {progress.lastAttemptAt && (
          <span className="mono" style={{ color: 'var(--muted)' }}>
            last attempt {new Date(progress.lastAttemptAt).toLocaleDateString()}
          </span>
        )}
      </div>
      {progress.topMisconceptions.length > 0 && (
        <div className="exam-misconceptions">
          <div className="field-label">Recurring misconceptions</div>
          <ul>
            {progress.topMisconceptions.map((m) => (
              <li key={m.text}>
                {m.text} ({m.count}×)
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasYear13 && (
        <label className="exam-level-filter">
          <input
            type="checkbox"
            checked={includeYear13}
            onChange={(e) => updateIncludeYear13(e.target.checked)}
          />
          Include A Level (Year 13) questions
        </label>
      )}

      <ExamChapterTabs
        topicRef={topicRef}
        chapters={chapters}
        latestAttempts={latest}
      />
    </section>
  );
}
