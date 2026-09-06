'use client';

import { Card } from '@/components/Card';
import { TraceTableExercise } from '@/components/TraceTableExercise';
import { FsmExercise } from '@/components/FsmExercise';
import { GlossaryDrill } from '@/components/GlossaryDrill';
import { TRACE_TABLE_EXERCISES } from '@/lib/exercises/trace-tables';
import { FSM_EXERCISES } from '@/lib/exercises/fsm';

export default function TheoryOfComputationPracticePage() {
  return (
    <div className="stack">
      <Card>
        <h3 className="section-title">Practice — trace tables</h3>
        {TRACE_TABLE_EXERCISES.map((exercise) => (
          <TraceTableExercise key={exercise.id} exercise={exercise} />
        ))}
      </Card>

      <Card>
        <h3 className="section-title">Practice — finite state machines</h3>
        {FSM_EXERCISES.map((exercise) => (
          <FsmExercise key={exercise.id} exercise={exercise} />
        ))}
      </Card>

      <Card>
        <h3 className="section-title">Practice — glossary drill</h3>
        <GlossaryDrill />
      </Card>
    </div>
  );
}
