'use client';

import { useState } from 'react';
import { getExamChaptersForTopic } from '@/lib/exercises/exam-question-bank';
import { computeTopicExamProgress } from '@/lib/exercises/exam-question-progress';
import {
  latestAttemptsByPart,
  useExamQuestionAttempts,
} from '@/lib/db/use-exam-question-attempts';
import { ExamChapterTabs } from './ExamChapterTabs';

const YEAR_13_LEVEL = 'A Level (Year 13)';

// The "Exam questions" section on a topic detail page (specs/
// exam-question-bank/requirements.md §2.1). Server-rendered content
// (getExamChaptersForTopic) combined with client-side attempt state -
// this component itself is the client boundary, like TopicChecklist.
export function ExamQuestionsSection({ topicRef }: { topicRef: string }) {
  const allChapters = getExamChaptersForTopic(topicRef);
  const [includeYear13, setIncludeYear13] = useState(false);
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
            onChange={(e) => setIncludeYear13(e.target.checked)}
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
