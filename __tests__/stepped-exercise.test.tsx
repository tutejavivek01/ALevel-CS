import { describe, expect, test } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SteppedTraceForm } from '../components/SteppedTraceForm';
import { exactMatch, type SteppedExercise } from '../lib/exercises/types';

// A trivial, throwaway exercise (design.md §6.4 / tasks.md task 15):
// proves the shared interface + component work before any real exercise
// (trace tables, task 16; FSM, task 17-18) is built on top of them.
type FakeStep = { value: string };

const fakeExercise: SteppedExercise<FakeStep> = {
  id: 'fake-count',
  title: 'Fake counting drill',
  prompt: 'Count up from 1.',
  fieldKeys: ['value'],
  computeExpectedSteps: () => [{ value: '1' }, { value: '2' }, { value: '3' }],
  isStepCorrect: exactMatch,
};

describe('fake exercise: pure logic', () => {
  test('computeExpectedSteps returns the fixed sequence', () => {
    expect(fakeExercise.computeExpectedSteps()).toEqual([
      { value: '1' },
      { value: '2' },
      { value: '3' },
    ]);
  });

  test('isStepCorrect matches trimmed exact values', () => {
    expect(fakeExercise.isStepCorrect('2', '2')).toBe(true);
    expect(fakeExercise.isStepCorrect(' 2 ', '2')).toBe(true);
    expect(fakeExercise.isStepCorrect('3', '2')).toBe(false);
  });
});

describe('SteppedTraceForm: renders and checks the fake exercise', () => {
  test('one input per expected step, and checking highlights correct/wrong cells', () => {
    render(<SteppedTraceForm exercise={fakeExercise} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(3);

    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.change(inputs[1], { target: { value: '99' } });
    fireEvent.change(inputs[2], { target: { value: '3' } });

    fireEvent.click(screen.getByRole('button', { name: 'Check my trace' }));

    expect(inputs[0]).toHaveClass('correct');
    expect(inputs[1]).toHaveClass('wrong');
    expect(inputs[2]).toHaveClass('correct');
    expect(
      screen.getByText('2/3 correct — check the highlighted cells.')
    ).toBeDefined();
  });

  test('editing a cell after checking clears the highlight', () => {
    render(<SteppedTraceForm exercise={fakeExercise} />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check my trace' }));
    expect(inputs[0]).toHaveClass('correct');

    fireEvent.change(inputs[0], { target: { value: '5' } });
    expect(inputs[0]).not.toHaveClass('correct');
    expect(inputs[0]).not.toHaveClass('wrong');
  });
});
