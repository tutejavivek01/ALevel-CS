import { SteppedTraceForm } from './SteppedTraceForm';
import { FsmDiagram } from './FsmDiagram';
import type { FsmExerciseData } from '@/lib/exercises/fsm';

export function FsmExercise({ exercise }: { exercise: FsmExerciseData }) {
  return (
    <SteppedTraceForm exercise={exercise}>
      <FsmDiagram fsm={exercise.fsm} />
    </SteppedTraceForm>
  );
}
