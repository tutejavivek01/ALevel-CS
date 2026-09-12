'use client';

import { useState } from 'react';
import {
  MASTERY_QUIZZES,
  isQuizAnswerCorrect,
} from '@/lib/exercises/mastery-quiz';
import {
  MASTERY_QUIZ_PASS_SCORE,
  useSubmitMasteryQuizAttempt,
} from '@/lib/db/use-mastery-attempts';

// The default "confident" mastery-gate route (design.md §6.13,
// requirements.md §12.2): 10 questions, graded by plain logic only, 8/10
// to pass. Every attempt is recorded regardless of outcome.
export function MasteryQuizFlow({
  topicId,
  onDone,
}: {
  topicId: string;
  onDone: () => void;
}) {
  const questions = MASTERY_QUIZZES[topicId] ?? [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);
  const submit = useSubmitMasteryQuizAttempt(topicId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const items = questions.map((question, position) => {
      const answer = answers[question.id] ?? '';
      return {
        itemRef: question.id,
        position,
        answer,
        correct: isQuizAnswerCorrect(question, answer),
      };
    });
    const outcome = await submit.mutateAsync(items);
    setResult(outcome);
  }

  if (result) {
    return (
      <div className="mastery-result">
        <p className={result.passed ? 'ex-feedback ok' : 'ex-feedback no'}>
          {result.passed
            ? `Passed — ${result.score}/${questions.length} correct. Confident is now unlocked for this topic.`
            : `Not this time — ${result.score}/${questions.length} correct (need ${MASTERY_QUIZ_PASS_SCORE}/${questions.length}). This attempt is saved in History; you can try again any time.`}
        </p>
        <button type="button" className="btn2 alt" onClick={onDone}>
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mastery-quiz">
      {questions.map((question, index) => (
        <div className="mastery-question" key={question.id}>
          <div className="mastery-question-prompt">
            {index + 1}. {question.prompt}
          </div>
          {question.options ? (
            <div className="mastery-options">
              {question.options.map((option) => (
                <label key={option} className="mastery-option">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, [question.id]: option }))
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              className="mastery-short-answer"
              value={answers[question.id] ?? ''}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [question.id]: e.target.value,
                }))
              }
            />
          )}
        </div>
      ))}
      <div className="ex-actions">
        <button type="submit" className="btn2" disabled={submit.isPending}>
          {submit.isPending ? 'Submitting…' : 'Submit quiz'}
        </button>
      </div>
    </form>
  );
}
