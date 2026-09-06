'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type { SteppedExercise, StepValues } from '@/lib/exercises/types';

type CellResult = 'correct' | 'wrong';

export function SteppedTraceForm<Step extends StepValues>({
  exercise,
  children,
}: {
  exercise: SteppedExercise<Step>;
  // Rendered between the prompt and the table - a trace table's
  // pseudocode block (task 16), or an FSM's state diagram (task 17-18).
  children?: ReactNode;
}) {
  const expectedSteps = useMemo(() => exercise.computeExpectedSteps(), [exercise]);
  const givenKeys = useMemo(() => new Set(exercise.givenKeys ?? []), [exercise]);
  const editableKeys = useMemo(
    () => exercise.fieldKeys.filter((key) => !givenKeys.has(key)),
    [exercise, givenKeys]
  );

  const [values, setValues] = useState<StepValues[]>(() =>
    expectedSteps.map(() => Object.fromEntries(editableKeys.map((key) => [key, ''])))
  );
  const [results, setResults] = useState<CellResult[][] | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  function setValue(stepIndex: number, key: string, value: string) {
    setValues((prev) => {
      const next = prev.map((row) => ({ ...row }));
      next[stepIndex] = { ...next[stepIndex], [key]: value };
      return next;
    });
    setResults(null);
  }

  function handleCheck() {
    setResults(
      expectedSteps.map((expected, stepIndex) =>
        editableKeys.map((key) =>
          exercise.isStepCorrect(values[stepIndex][key] ?? '', expected[key] ?? '')
            ? 'correct'
            : 'wrong'
        )
      )
    );
  }

  const totalCells = expectedSteps.length * editableKeys.length;
  const correctCells = results
    ? results.flat().filter((r) => r === 'correct').length
    : 0;

  return (
    <div className="ex">
      <h4>{exercise.title}</h4>
      <p className="prompt">{exercise.prompt}</p>
      {children}
      <table className="trace">
        <thead>
          <tr>
            {exercise.fieldKeys.map((key) => (
              <th key={key}>{exercise.fieldLabels?.[key] ?? key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {expectedSteps.map((expected, stepIndex) => (
            <tr key={stepIndex}>
              {exercise.fieldKeys.map((key) =>
                givenKeys.has(key) ? (
                  <td className="given" key={key}>
                    {expected[key]}
                  </td>
                ) : (
                  <td key={key}>
                    <input
                      size={3}
                      value={values[stepIndex][key]}
                      onChange={(e) => setValue(stepIndex, key, e.target.value)}
                      className={
                        results
                          ? results[stepIndex][editableKeys.indexOf(key)]
                          : undefined
                      }
                    />
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ex-actions">
        <button className="btn2" onClick={handleCheck}>
          Check my trace
        </button>
        {exercise.workedAnswer && (
          <button className="btn2 alt" onClick={() => setShowAnswer((s) => !s)}>
            Show worked trace
          </button>
        )}
        {results && (
          <span className={`ex-feedback ${correctCells === totalCells ? 'ok' : 'no'}`}>
            {correctCells === totalCells
              ? `All ${totalCells} correct!`
              : `${correctCells}/${totalCells} correct — check the highlighted cells.`}
          </span>
        )}
      </div>
      {exercise.workedAnswer && (
        <div className={`answer${showAnswer ? ' show' : ''}`}>
          {exercise.workedAnswer}
        </div>
      )}
    </div>
  );
}
