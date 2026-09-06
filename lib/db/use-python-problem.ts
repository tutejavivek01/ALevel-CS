'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useRealtimeTables } from './use-realtime-tables';
import type { PythonProblem } from './use-python-problems';

export type PythonTestCase = {
  id: number;
  problem_id: number;
  position: number;
  input: string;
  expected_output: string;
};

export function pythonProblemQueryKey(problemId: number) {
  return ['python-problem', problemId] as const;
}

async function fetchPythonProblem(problemId: number): Promise<PythonProblem | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('python_problems')
    .select('*')
    .eq('id', problemId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// initialData comes from the server component's own fetch (design.md
// §1's "server components handle first-load data fetching") - this
// hook then takes over for live updates via Realtime, matching every
// other feature's client/server split.
export function usePythonProblem(problemId: number, initialData?: PythonProblem) {
  const queryClient = useQueryClient();
  const queryKey = pythonProblemQueryKey(problemId);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchPythonProblem(problemId),
    initialData,
  });

  useRealtimeTables(['python_problems'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

export function pythonTestCasesQueryKey(problemId: number) {
  return ['python-test-cases', problemId] as const;
}

async function fetchPythonTestCases(problemId: number): Promise<PythonTestCase[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('python_test_cases')
    .select('*')
    .eq('problem_id', problemId)
    .order('position', { ascending: true });
  if (error) throw error;
  return data;
}

export function usePythonTestCases(problemId: number, initialData?: PythonTestCase[]) {
  const queryClient = useQueryClient();
  const queryKey = pythonTestCasesQueryKey(problemId);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchPythonTestCases(problemId),
    initialData,
  });

  useRealtimeTables(['python_test_cases'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}
