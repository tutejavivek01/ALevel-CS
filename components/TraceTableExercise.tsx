import { Fragment } from 'react';
import { SteppedTraceForm } from './SteppedTraceForm';
import type { StepValues } from '@/lib/exercises/types';
import type { TraceTableExercise as TraceTableExerciseData } from '@/lib/exercises/trace-tables';

export function TraceTableExercise<Step extends StepValues>({
  exercise,
}: {
  exercise: TraceTableExerciseData<Step>;
}) {
  return (
    <SteppedTraceForm exercise={exercise}>
      <pre className="code">
        {exercise.code.map((line, index) => (
          <Fragment key={index}>
            {line[0]}
            <span className="kw">{line[1]}</span>
            {index < exercise.code.length - 1 ? '\n' : null}
          </Fragment>
        ))}
      </pre>
    </SteppedTraceForm>
  );
}
