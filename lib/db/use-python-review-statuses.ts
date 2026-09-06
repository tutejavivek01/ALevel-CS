'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useRealtimeTables } from './use-realtime-tables';
import { deriveReviewStatus, type PythonReviewStatus } from '@/lib/exercises/python-review-status';

// One derived status per problem, for the /python list page (design.md
// §6.7, replacing task 21's placeholder column). Fetches minimal
// columns from all three tables at once rather than one query per
// problem - this app has a small, personal-scale problem set, so a
// full-table fetch is cheap and keeps the list page to one round trip
// per table regardless of how many problems exist.
export function pythonReviewStatusesQueryKey() {
  return ['python-review-statuses'] as const;
}

async function fetchPythonReviewStatuses(): Promise<Record<number, PythonReviewStatus>> {
  const supabase = createClient();
  const [
    { data: problems, error: problemsError },
    { data: submissions, error: submissionsError },
    { data: reviews, error: reviewsError },
  ] = await Promise.all([
    supabase.from('python_problems').select('id, submitted_for_review_at'),
    supabase.from('python_submissions').select('problem_id'),
    supabase.from('python_problem_reviews').select('problem_id, created_at'),
  ]);
  if (problemsError) throw problemsError;
  if (submissionsError) throw submissionsError;
  if (reviewsError) throw reviewsError;

  const hasSubmissions = new Set(submissions.map((s) => s.problem_id));
  const latestReviewAt = new Map<number, string>();
  for (const review of reviews) {
    const existing = latestReviewAt.get(review.problem_id);
    if (!existing || review.created_at > existing) {
      latestReviewAt.set(review.problem_id, review.created_at);
    }
  }

  const statuses: Record<number, PythonReviewStatus> = {};
  for (const problem of problems) {
    statuses[problem.id] = deriveReviewStatus({
      hasSubmissions: hasSubmissions.has(problem.id),
      submittedForReviewAt: problem.submitted_for_review_at,
      latestReviewAt: latestReviewAt.get(problem.id) ?? null,
    });
  }
  return statuses;
}

export function usePythonReviewStatuses() {
  const queryClient = useQueryClient();
  const queryKey = pythonReviewStatusesQueryKey();

  const query = useQuery({ queryKey, queryFn: fetchPythonReviewStatuses });

  useRealtimeTables(
    ['python_problems', 'python_submissions', 'python_problem_reviews'],
    () => {
      queryClient.invalidateQueries({ queryKey });
    }
  );

  return query;
}
