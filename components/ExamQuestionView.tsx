import type { ExamQuestion } from '@/lib/exercises/exam-question-bank';
import type { ExamQuestionAttempt } from '@/lib/db/use-exam-question-attempts';
import { ExamAnswerForm } from './ExamAnswerForm';

// One exam-bank question: stem, provenance, needs_review notice, then
// either one whole-question answer or one per part (requirements.md
// §2.2-§2.4, §3.1).
export function ExamQuestionView({
  topicRef,
  question,
  latestAttempts,
}: {
  topicRef: string;
  question: ExamQuestion;
  latestAttempts: Record<string, ExamQuestionAttempt>;
}) {
  return (
    <div className="exam-question-card">
      <div className="exam-question-head">
        <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
          Q{question.number}
        </span>
        {question.sourceExam && (
          <span style={{ fontSize: 11.5, color: 'var(--ink-dim)' }}>
            {question.sourceExam}
          </span>
        )}
        {question.marksPartial || question.marksUnreadable ? (
          <span style={{ fontSize: 11, color: 'var(--warn)' }}>
            ≥ {question.marks} marks
          </span>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--ink-dim)' }}>
            {question.marks} marks
          </span>
        )}
      </div>

      {question.needsReview && (
        <p className="exam-review-notice">
          This question references a diagram, table, or figure not reproduced
          here — see page {question.pdfPage} of the source. It&apos;s still
          answerable; the marker will say so if the missing figure is genuinely
          needed.
        </p>
      )}

      {question.stem && <p className="blurb">{question.stem}</p>}

      {question.parts && question.parts.length > 0 ? (
        <div className="exam-parts">
          {question.parts.map((part) => (
            <div key={part.partKey} className="exam-part">
              <div className="exam-part-head">
                <span className="mono">({part.part})</span>{' '}
                <span style={{ fontSize: 13 }}>{part.text}</span>
                {part.marks === undefined ? (
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {' '}
                    — marks unknown
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {' '}
                    [{part.marks}]
                  </span>
                )}
              </div>
              <ExamAnswerForm
                topicRef={topicRef}
                questionId={question.id}
                part={part.partKey}
                marks={part.marks ?? null}
                latestAttempt={latestAttempts[`${question.id}:${part.partKey}`]}
              />
            </div>
          ))}
        </div>
      ) : (
        <>
          {question.text && <p className="blurb">{question.text}</p>}
          <ExamAnswerForm
            topicRef={topicRef}
            questionId={question.id}
            part=""
            marks={question.marks || null}
            latestAttempt={latestAttempts[`${question.id}:`]}
          />
        </>
      )}
    </div>
  );
}
