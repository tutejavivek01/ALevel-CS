'use client';

import { Card } from '@/components/Card';
import { TraceTableExercise } from '@/components/TraceTableExercise';
import { TRACE_TABLE_EXERCISES } from '@/lib/exercises/trace-tables';

export default function TheoryOfComputationPracticePage() {
  return (
    <Card>
      <h3 className="section-title">Practice — trace tables</h3>
      {TRACE_TABLE_EXERCISES.map((exercise) => (
        <TraceTableExercise key={exercise.id} exercise={exercise} />
      ))}
    </Card>
  );
}
