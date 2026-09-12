'use client';

import { useState } from 'react';
import { PythonEditor } from './PythonEditor';
import { MASTERY_CHALLENGES } from '@/lib/exercises/mastery-challenges';
import { usePyodideWorker } from '@/lib/python/use-pyodide-worker';
import { gradeSubmission } from '@/lib/python/grade-submission';
import { useSubmitMasteryChallengeAttempt } from '@/lib/db/use-mastery-attempts';

// The programming-challenge "confident" mastery-gate route (design.md
// §6.13, requirements.md §12.3): 2 challenges, both must pass. Reuses the
// existing Pyodide execution pipeline unchanged - same worker, same
// gradeSubmission(), same timeout/interrupt handling as OCR challenges.
export function MasteryChallengeFlow({
  topicId,
  onDone,
}: {
  topicId: string;
  onDone: () => void;
}) {
  const challenges = MASTERY_CHALLENGES[topicId] ?? [];
  const worker = usePyodideWorker();
  const [code, setCode] = useState<Record<string, string>>({});
  const [runResults, setRunResults] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);
  const submit = useSubmitMasteryChallengeAttempt(topicId);

  async function runOne(challengeId: string) {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return false;
    const grading = await gradeSubmission(
      code[challengeId] ?? '',
      challenge.testCases,
      worker
    );
    const passed = grading.overallResult === 'pass';
    setRunResults((prev) => ({ ...prev, [challengeId]: passed }));
    return passed;
  }

  async function handleSubmitAttempt() {
    setRunning(true);
    try {
      const items = [];
      for (let position = 0; position < challenges.length; position++) {
        const challenge = challenges[position];
        const passed = await runOne(challenge.id);
        items.push({
          itemRef: challenge.id,
          position,
          answer: code[challenge.id] ?? '',
          correct: passed,
        });
      }
      const outcome = await submit.mutateAsync(items);
      setResult(outcome);
    } finally {
      setRunning(false);
    }
  }

  if (result) {
    return (
      <div className="mastery-result">
        <p className={result.passed ? 'ex-feedback ok' : 'ex-feedback no'}>
          {result.passed
            ? `Both challenges passed. Confident is now unlocked for this topic.`
            : `${result.score}/${challenges.length} passed — both are needed. This attempt is saved in History; you can try again any time.`}
        </p>
        <button type="button" className="btn2 alt" onClick={onDone}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="mastery-challenges">
      {challenges.map((challenge) => (
        <div key={challenge.id} className="mastery-challenge">
          <h3 className="section-title">{challenge.title}</h3>
          <p className="blurb" style={{ whiteSpace: 'pre-wrap' }}>
            {challenge.description}
          </p>
          <PythonEditor
            value={code[challenge.id] ?? ''}
            onChange={(value) =>
              setCode((prev) => ({ ...prev, [challenge.id]: value }))
            }
          />
          {challenge.id in runResults && (
            <p
              className={
                runResults[challenge.id] ? 'ex-feedback ok' : 'ex-feedback no'
              }
            >
              {runResults[challenge.id] ? 'Passed' : 'Not passing yet'}
            </p>
          )}
        </div>
      ))}
      <div className="ex-actions">
        <button
          type="button"
          className="btn2"
          onClick={handleSubmitAttempt}
          disabled={running || submit.isPending}
        >
          {running || submit.isPending ? 'Running…' : 'Submit attempt'}
        </button>
      </div>
    </div>
  );
}
