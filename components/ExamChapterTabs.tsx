'use client';

import { useState } from 'react';
import type { ExamChapter } from '@/lib/exercises/exam-question-bank';
import type { ExamQuestionAttempt } from '@/lib/db/use-exam-question-attempts';
import { ExamQuestionView } from './ExamQuestionView';

// One tab per book chapter within the topic's spec area (requirements.md
// §1.2 - the "confirmed: chapter-as-sub-tab" decision). Renders nothing
// but a heading when there's exactly one chapter, rather than a
// redundant single-tab control.
export function ExamChapterTabs({
  topicRef,
  chapters,
  latestAttempts,
}: {
  topicRef: string;
  chapters: ExamChapter[];
  latestAttempts: Record<string, ExamQuestionAttempt>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = chapters[activeIndex] ?? chapters[0];

  if (chapters.length === 0) {
    return <p className="empty-note">No exam questions for this topic yet.</p>;
  }

  return (
    <div>
      {chapters.length > 1 && (
        <div className="exam-chapter-tabs" role="tablist">
          {chapters.map((chapter, index) => (
            <button
              key={String(chapter.chapter)}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              className={
                index === activeIndex
                  ? 'exam-chapter-tab active'
                  : 'exam-chapter-tab'
              }
              onClick={() => setActiveIndex(index)}
            >
              {typeof chapter.chapter === 'number'
                ? `Ch ${chapter.chapter}`
                : chapter.chapter}
              : {chapter.title}
            </button>
          ))}
        </div>
      )}
      {chapters.length === 1 && (
        <h4 style={{ marginTop: 4 }}>{active.title}</h4>
      )}

      <div className="exam-question-list">
        {active.questions.map((question) => (
          <ExamQuestionView
            key={question.id}
            topicRef={topicRef}
            question={question}
            latestAttempts={latestAttempts}
          />
        ))}
      </div>
    </div>
  );
}
