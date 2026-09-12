'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useRealtimeTables } from './use-realtime-tables';
import { getTopicById } from '@/lib/spec';
import { getExamChaptersForTopic } from '@/lib/exercises/exam-question-bank';
import { computeExamGateStatus } from '@/lib/exercises/exam-question-progress';
import {
  latestAttemptsByPart,
  useExamQuestionAttempts,
} from './use-exam-question-attempts';

// The "confident" mastery gate (design.md §6.13, requirements.md §12).
// Every attempt - quiz or programming-challenge, pass or fail - is a
// permanent insert; there is no update/delete path, mirroring every
// other attempt-history table in this schema.

export type MasteryAttemptItem = {
  id: number;
  attempt_id: number;
  item_ref: string;
  position: number;
  answer: string;
  correct: boolean;
};

export type MasteryAttempt = {
  id: number;
  topic_id: string;
  route: 'quiz' | 'challenge';
  score: number;
  max_score: number;
  passed: boolean;
  attempted_by: string;
  created_at: string;
  mastery_attempt_items: MasteryAttemptItem[];
};

export function masteryAttemptsQueryKey(topicId: string) {
  return ['mastery-attempts', topicId] as const;
}

async function fetchMasteryAttempts(
  topicId: string
): Promise<MasteryAttempt[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('mastery_attempts')
    .select('*, mastery_attempt_items(*)')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export function useMasteryAttempts(topicId: string) {
  const queryClient = useQueryClient();
  const queryKey = masteryAttemptsQueryKey(topicId);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchMasteryAttempts(topicId),
  });

  useRealtimeTables(['mastery_attempts', 'mastery_attempt_items'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

// Whether the topic's gate has ever been passed - any one of the three
// routes is enough (requirements.md §5.2/§12.1: quiz, programming
// challenge, or the exam-question threshold - not additive). For the
// quiz/challenge routes this is "any one passing attempt exists" and
// stays true even if a later re-attempt fails (requirements.md §12.5's
// no-auto-revoke rule). The exam-question route is different in kind -
// it's a live threshold over cumulative attempts (requirements.md §5.2),
// not a single pass/fail event, so it's recomputed from current data
// each time rather than stored as its own "passed" flag.
export function useMasteryGateStatus(topicId: string) {
  const { data: attempts, isLoading: attemptsLoading } =
    useMasteryAttempts(topicId);
  const topic = getTopicById(topicId);
  const { data: examAttempts, isLoading: examLoading } =
    useExamQuestionAttempts(topic?.ref ?? '');

  const passedQuizOrChallenge = (attempts ?? []).some(
    (attempt) => attempt.passed
  );
  const passedExamQuestions = topic
    ? computeExamGateStatus(
        getExamChaptersForTopic(topic.ref),
        latestAttemptsByPart(examAttempts ?? [])
      ).passed
    : false;

  return {
    passed: passedQuizOrChallenge || passedExamQuestions,
    isLoading: attemptsLoading || examLoading,
  };
}

type SubmitItem = {
  itemRef: string;
  position: number;
  answer: string;
  correct: boolean;
};

async function insertAttempt(
  topicId: string,
  route: 'quiz' | 'challenge',
  score: number,
  maxScore: number,
  passed: boolean,
  items: SubmitItem[]
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data: attempt, error: attemptError } = await supabase
    .from('mastery_attempts')
    .insert({
      topic_id: topicId,
      route,
      score,
      max_score: maxScore,
      passed,
      attempted_by: user.id,
    })
    .select()
    .single();
  if (attemptError) throw attemptError;

  const { data: insertedItems, error: itemsError } = await supabase
    .from('mastery_attempt_items')
    .insert(
      items.map((item) => ({
        attempt_id: attempt.id,
        item_ref: item.itemRef,
        position: item.position,
        answer: item.answer,
        correct: item.correct,
      }))
    )
    .select();
  if (itemsError) throw itemsError;

  return { ...attempt, mastery_attempt_items: insertedItems } as MasteryAttempt;
}

// Quiz pass bar (requirements.md §12.2): 8/10.
export const MASTERY_QUIZ_PASS_SCORE = 8;

export function useSubmitMasteryQuizAttempt(topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: SubmitItem[]) => {
      const score = items.filter((item) => item.correct).length;
      const passed = score >= MASTERY_QUIZ_PASS_SCORE;
      const attempt = await insertAttempt(
        topicId,
        'quiz',
        score,
        items.length,
        passed,
        items
      );
      return { score, passed, attempt };
    },
    // Prepend the real inserted row to the cache immediately, not just
    // invalidate-and-wait - useMasteryGateStatus reads this same query,
    // and a student clicking "Confident" right after passing must see it
    // unlocked without waiting on a refetch round trip (the same lesson
    // as the /python list's due-date mirrors, lib/db/use-optimistic-mutation.ts).
    onSuccess: ({ attempt }) => {
      queryClient.setQueryData(
        masteryAttemptsQueryKey(topicId),
        (old: MasteryAttempt[] | undefined) => [attempt, ...(old ?? [])]
      );
      queryClient.invalidateQueries({
        queryKey: masteryAttemptsQueryKey(topicId),
      });
    },
  });
}

export function useSubmitMasteryChallengeAttempt(topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: SubmitItem[]) => {
      // Both challenges must pass (requirements.md §12.3) - not 1 of 2.
      const score = items.filter((item) => item.correct).length;
      const passed = items.length > 0 && items.every((item) => item.correct);
      const attempt = await insertAttempt(
        topicId,
        'challenge',
        score,
        items.length,
        passed,
        items
      );
      return { score, passed, attempt };
    },
    onSuccess: ({ attempt }) => {
      queryClient.setQueryData(
        masteryAttemptsQueryKey(topicId),
        (old: MasteryAttempt[] | undefined) => [attempt, ...(old ?? [])]
      );
      queryClient.invalidateQueries({
        queryKey: masteryAttemptsQueryKey(topicId),
      });
    },
  });
}
