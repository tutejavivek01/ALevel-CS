'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePythonProblem, type NewTestCase } from '@/lib/db/use-python-problems';

const EMPTY_TEST_CASE: NewTestCase = { input: '', expectedOutput: '' };

export function PythonProblemForm() {
  const router = useRouter();
  const createProblem = useCreatePythonProblem();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [testCases, setTestCases] = useState<NewTestCase[]>([{ ...EMPTY_TEST_CASE }]);

  function updateTestCase(index: number, field: keyof NewTestCase, value: string) {
    setTestCases((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addTestCase() {
    setTestCases((rows) => [...rows, { ...EMPTY_TEST_CASE }]);
  }

  function removeTestCase(index: number) {
    setTestCases((rows) => rows.filter((_, i) => i !== index));
  }

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    testCases.length > 0 &&
    testCases.every((tc) => tc.expectedOutput.trim().length > 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    createProblem.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        starterCode: starterCode.trim(),
        dueDate: dueDate || null,
        testCases,
      },
      { onSuccess: () => router.push('/python') }
    );
  }

  return (
    <form className="problem-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>

      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>

      <label>
        Starter code (optional)
        <textarea
          value={starterCode}
          onChange={(e) => setStarterCode(e.target.value)}
          placeholder="def solve():&#10;    ..."
        />
      </label>

      <label>
        Due date (optional)
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </label>

      <div>
        <span className="field-label">Test cases</span>
        {testCases.map((testCase, index) => (
          <div className="test-case-row" key={index}>
            <textarea
              value={testCase.input}
              onChange={(e) => updateTestCase(index, 'input', e.target.value)}
              placeholder="Input (stdin, optional)"
            />
            <textarea
              value={testCase.expectedOutput}
              onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
              placeholder="Expected output"
              required
            />
            <button
              type="button"
              className="btn2 alt"
              onClick={() => removeTestCase(index)}
              disabled={testCases.length === 1}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="btn2 alt" onClick={addTestCase}>
          + Add test case
        </button>
      </div>

      {createProblem.isError && (
        <p className="ex-feedback no">
          Couldn&apos;t save —{' '}
          <button type="button" className="btn2" onClick={() => createProblem.retry()}>
            retry
          </button>
        </p>
      )}

      <button type="submit" className="btn2" disabled={!canSubmit || createProblem.isPending}>
        Create problem
      </button>
    </form>
  );
}
