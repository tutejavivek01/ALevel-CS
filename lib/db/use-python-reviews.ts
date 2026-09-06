'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useOptimisticMutation } from './use-optimistic-mutation';
import { useRealtimeTables } from './use-realtime-tables';
import { pythonProblemQueryKey } from './use-python-problem';
import type { PythonProblem } from './use-python-problems';

export type PythonProblemReview = {
  id: number;
  problem_id: number;
  body: string | null;
  created_by: string;
  created_at: string;
};

export function pythonReviewsQueryKey(problemId: number) {
  return ['python-problem-reviews', problemId] as const;
}

async function fetchPythonReviews(problemId: number): Promise<PythonProblemReview[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('python_problem_reviews')
    .select('*')
    .eq('problem_id', problemId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export function usePythonReviews(problemId: number) {
  const queryClient = useQueryClient();
  const queryKey = pythonReviewsQueryKey(problemId);

  const query = useQuery({ queryKey, queryFn: () => fetchPythonReviews(problemId) });

  useRealtimeTables(['python_problem_reviews'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

export function useAddPythonReview(problemId: number) {
  const queryKey = pythonReviewsQueryKey(problemId);

  return useOptimisticMutation<{ body: string }, void>({
    queryKey,
    mutationFn: async ({ body }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase
        .from('python_problem_reviews')
        .insert({ problem_id: problemId, body, created_by: user.id });
      if (error) throw error;
    },
    updater: (previous, variables) => {
      const reviews = (previous as PythonProblemReview[] | undefined) ?? [];
      const optimisticReview: PythonProblemReview = {
        id: -Date.now(),
        problem_id: problemId,
        body: variables.body,
        created_by: 'optimistic',
        created_at: new Date().toISOString(),
      };
      return [optimisticReview, ...reviews];
    },
  });
}

// Sets only submitted_for_review_at (design.md §6.7/§7.6) - the
// student-only column-scoped update policy + trigger from task 20's
// python_problems migration is what actually enforces that this can't
// touch title/description/etc, not anything client-side here.
export function useSubmitForReview(problemId: number) {
  const queryKey = pythonProblemQueryKey(problemId);

  return useOptimisticMutation<void, void>({
    queryKey,
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from('python_problems')
        .update({ submitted_for_review_at: new Date().toISOString() })
        .eq('id', problemId);
      if (error) throw error;
    },
    updater: (previous) => {
      const problem = previous as PythonProblem | undefined;
      if (!problem) return previous;
      return { ...problem, submitted_for_review_at: new Date().toISOString() };
    },
  });
}
