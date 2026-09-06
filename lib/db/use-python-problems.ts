'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useOptimisticMutation } from './use-optimistic-mutation';
import { useRealtimeTables } from './use-realtime-tables';
import { logActivity } from './log-activity';

export type PythonProblem = {
  id: number;
  title: string;
  description: string;
  starter_code: string | null;
  due_date: string | null;
  created_by: string;
  created_at: string;
  submitted_for_review_at: string | null;
};

export type NewTestCase = { input: string; expectedOutput: string };

export function pythonProblemsQueryKey() {
  return ['python-problems'] as const;
}

async function fetchPythonProblems(): Promise<PythonProblem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('python_problems')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export function usePythonProblems() {
  const queryClient = useQueryClient();
  const queryKey = pythonProblemsQueryKey();

  const query = useQuery({ queryKey, queryFn: fetchPythonProblems });

  useRealtimeTables(['python_problems'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

export function useCreatePythonProblem() {
  const queryKey = pythonProblemsQueryKey();

  return useOptimisticMutation<
    {
      title: string;
      description: string;
      starterCode: string;
      dueDate: string | null;
      testCases: NewTestCase[];
    },
    void
  >({
    queryKey,
    mutationFn: async ({ title, description, starterCode, dueDate, testCases }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { data: problem, error } = await supabase
        .from('python_problems')
        .insert({
          title,
          description,
          starter_code: starterCode || null,
          due_date: dueDate,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;

      // Same request, not a DB transaction (matches
      // use-subtopic-status.ts's documented gap) - a real but accepted
      // risk: if this second insert fails after the first succeeds, the
      // problem exists with no test cases. RLS still applies (both
      // policies are supporter-only), so this can't be exploited to
      // create a problem some other way; it's a partial-write edge case,
      // not a security gap.
      const { error: testCasesError } = await supabase.from('python_test_cases').insert(
        testCases.map((testCase, index) => ({
          problem_id: problem.id,
          position: index,
          input: testCase.input,
          expected_output: testCase.expectedOutput,
        }))
      );
      if (testCasesError) throw testCasesError;

      await logActivity({
        eventType: 'python_problem_created',
        summary: `added a Python problem "${title}"`,
        targetRef: String(problem.id),
      });
    },
    updater: (previous, variables) => {
      const problems = (previous as PythonProblem[] | undefined) ?? [];
      const optimisticProblem: PythonProblem = {
        id: -Date.now(),
        title: variables.title,
        description: variables.description,
        starter_code: variables.starterCode || null,
        due_date: variables.dueDate,
        created_by: 'optimistic',
        created_at: new Date().toISOString(),
        submitted_for_review_at: null,
      };
      return [optimisticProblem, ...problems];
    },
  });
}
