'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useRealtimeTables } from './use-realtime-tables';
import { OCR_CHALLENGES } from '@/lib/exercises/ocr-challenges';
import { deriveReviewStatus, type PythonReviewStatus } from '@/lib/exercises/python-review-status';

// Mirrors use-python-review-statuses.ts exactly, except the set of
// challenge ids comes from the code-defined OCR_CHALLENGES array
// (design.md §6.8) rather than a python_problems query - there's no
// database row per challenge to select ids from.
export function ocrChallengeReviewStatusesQueryKey() {
  return ['ocr-challenge-review-statuses'] as const;
}

async function fetchOcrChallengeReviewStatuses(): Promise<Record<string, PythonReviewStatus>> {
  const supabase = createClient();
  const [
    { data: submissions, error: submissionsError },
    { data: reviewStates, error: reviewStatesError },
    { data: reviews, error: reviewsError },
  ] = await Promise.all([
    supabase.from('ocr_challenge_submissions').select('challenge_id'),
    supabase.from('ocr_challenge_review_state').select('challenge_id, submitted_for_review_at'),
    supabase.from('ocr_challenge_reviews').select('challenge_id, created_at'),
  ]);
  if (submissionsError) throw submissionsError;
  if (reviewStatesError) throw reviewStatesError;
  if (reviewsError) throw reviewsError;

  const hasSubmissions = new Set(submissions.map((s) => s.challenge_id));
  const submittedForReviewAt = new Map(
    reviewStates.map((s) => [s.challenge_id, s.submitted_for_review_at] as const)
  );
  const latestReviewAt = new Map<string, string>();
  for (const review of reviews) {
    const existing = latestReviewAt.get(review.challenge_id);
    if (!existing || review.created_at > existing) {
      latestReviewAt.set(review.challenge_id, review.created_at);
    }
  }

  const statuses: Record<string, PythonReviewStatus> = {};
  for (const challenge of OCR_CHALLENGES) {
    statuses[challenge.id] = deriveReviewStatus({
      hasSubmissions: hasSubmissions.has(challenge.id),
      submittedForReviewAt: submittedForReviewAt.get(challenge.id) ?? null,
      latestReviewAt: latestReviewAt.get(challenge.id) ?? null,
    });
  }
  return statuses;
}

export function useOcrChallengeReviewStatuses() {
  const queryClient = useQueryClient();
  const queryKey = ocrChallengeReviewStatusesQueryKey();

  const query = useQuery({ queryKey, queryFn: fetchOcrChallengeReviewStatuses });

  useRealtimeTables(
    ['ocr_challenge_submissions', 'ocr_challenge_review_state', 'ocr_challenge_reviews'],
    () => {
      queryClient.invalidateQueries({ queryKey });
    }
  );

  return query;
}
