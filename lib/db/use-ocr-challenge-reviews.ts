'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useOptimisticMutation } from './use-optimistic-mutation';
import { useRealtimeTables } from './use-realtime-tables';

export type OcrChallengeReview = {
  id: number;
  challenge_id: string;
  body: string | null;
  created_by: string;
  created_at: string;
};

export function ocrChallengeReviewsQueryKey(challengeId: string) {
  return ['ocr-challenge-reviews', challengeId] as const;
}

async function fetchOcrChallengeReviews(challengeId: string): Promise<OcrChallengeReview[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('ocr_challenge_reviews')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export function useOcrChallengeReviews(challengeId: string) {
  const queryClient = useQueryClient();
  const queryKey = ocrChallengeReviewsQueryKey(challengeId);

  const query = useQuery({ queryKey, queryFn: () => fetchOcrChallengeReviews(challengeId) });

  useRealtimeTables(['ocr_challenge_reviews'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

export function useAddOcrChallengeReview(challengeId: string) {
  const queryKey = ocrChallengeReviewsQueryKey(challengeId);

  return useOptimisticMutation<{ body: string }, void>({
    queryKey,
    mutationFn: async ({ body }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase
        .from('ocr_challenge_reviews')
        .insert({ challenge_id: challengeId, body, created_by: user.id });
      if (error) throw error;
    },
    updater: (previous, variables) => {
      const reviews = (previous as OcrChallengeReview[] | undefined) ?? [];
      const optimisticReview: OcrChallengeReview = {
        id: -Date.now(),
        challenge_id: challengeId,
        body: variables.body,
        created_by: 'optimistic',
        created_at: new Date().toISOString(),
      };
      return [optimisticReview, ...reviews];
    },
  });
}

export type OcrChallengeReviewState = {
  challenge_id: string;
  due_date: string | null;
  submitted_for_review_at: string | null;
  updated_by: string;
};

export function ocrChallengeReviewStateQueryKey(challengeId: string) {
  return ['ocr-challenge-review-state', challengeId] as const;
}

async function fetchOcrChallengeReviewState(
  challengeId: string
): Promise<OcrChallengeReviewState | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('ocr_challenge_review_state')
    .select('*')
    .eq('challenge_id', challengeId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function useOcrChallengeReviewState(challengeId: string) {
  const queryClient = useQueryClient();
  const queryKey = ocrChallengeReviewStateQueryKey(challengeId);

  const query = useQuery({ queryKey, queryFn: () => fetchOcrChallengeReviewState(challengeId) });

  useRealtimeTables(['ocr_challenge_review_state'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

// due_date is jointly editable by either role (design.md §6.11,
// requirements.md §8.13) - unlike submitted_for_review_at below, which
// stays student-only. Upserting only {challenge_id, due_date, updated_by}
// (never submitted_for_review_at) means an existing
// submitted_for_review_at value is left untouched by Postgres's ON
// CONFLICT DO UPDATE (only the columns actually provided are updated),
// and satisfies guard_ocr_challenge_review_state_supporter_write's check
// on the supporter side automatically - no separate code path needed
// per role.
export function useSetOcrChallengeDueDate(challengeId: string) {
  const queryKey = ocrChallengeReviewStateQueryKey(challengeId);

  return useOptimisticMutation<string | null, void>({
    queryKey,
    mutationFn: async (dueDate) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase
        .from('ocr_challenge_review_state')
        .upsert({ challenge_id: challengeId, due_date: dueDate, updated_by: user.id });
      if (error) throw error;
    },
    updater: (previous, dueDate) => {
      const state = previous as OcrChallengeReviewState | null | undefined;
      return {
        challenge_id: challengeId,
        due_date: dueDate,
        submitted_for_review_at: state?.submitted_for_review_at ?? null,
        updated_by: state?.updated_by ?? 'optimistic',
      };
    },
  });
}

// Sets only submitted_for_review_at, the same as
// python_problems/useSubmitForReview - but this table has no other
// column to protect on the same row in the first place (design.md
// §6.8), so a plain upsert (there is no pre-existing row per challenge
// the way a python_problems row already exists) is enough; no
// column-scoping trigger needed.
export function useSubmitOcrChallengeForReview(challengeId: string) {
  const queryKey = ocrChallengeReviewStateQueryKey(challengeId);

  return useOptimisticMutation<void, void>({
    queryKey,
    mutationFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase.from('ocr_challenge_review_state').upsert({
        challenge_id: challengeId,
        submitted_for_review_at: new Date().toISOString(),
        updated_by: user.id,
      });
      if (error) throw error;
    },
    updater: (previous) => {
      const state = previous as OcrChallengeReviewState | null | undefined;
      return {
        challenge_id: challengeId,
        due_date: state?.due_date ?? null,
        submitted_for_review_at: new Date().toISOString(),
        updated_by: state?.updated_by ?? 'optimistic',
      };
    },
  });
}

// Every challenge's due_date in one query, keyed by challenge_id - for
// the list page and the dashboard deadline banner (design.md §6.11,
// lib/ocr-challenge-deadlines.ts), which both need every challenge's
// date at once rather than one at a time.
export function ocrChallengeDueDatesQueryKey() {
  return ['ocr-challenge-due-dates'] as const;
}

async function fetchOcrChallengeDueDates(): Promise<Record<string, string | null>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('ocr_challenge_review_state')
    .select('challenge_id, due_date');
  if (error) throw error;

  const dueDates: Record<string, string | null> = {};
  for (const row of data) dueDates[row.challenge_id] = row.due_date;
  return dueDates;
}

export function useOcrChallengeDueDates() {
  const queryClient = useQueryClient();
  const queryKey = ocrChallengeDueDatesQueryKey();

  const query = useQuery({ queryKey, queryFn: fetchOcrChallengeDueDates });

  useRealtimeTables(['ocr_challenge_review_state'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}
