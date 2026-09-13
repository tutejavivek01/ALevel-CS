'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useRealtimeTables } from './use-realtime-tables';

// specs/exam-question-bank/design.md §2/§4/§5 - every submitted answer,
// its marking status, and (once resolved) its result. Reads are open to
// both roles; writes go exclusively through the server-side marking
// route (app/api/exam-questions/mark/route.ts), never a direct insert
// from the client, since marking must happen server-side.
export type ExamQuestionAttempt = {
  id: number;
  question_id: string;
  part: string;
  topic_id: string;
  student_id: string;
  answer: string;
  marking_status: 'pending' | 'marked' | 'unmarkable' | 'failed';
  awarded: number | null;
  max: number | null;
  credited: string[] | null;
  missed: string[] | null;
  model_answer: string | null;
  misconceptions: string[] | null;
  confidence: number | null;
  // requirements.md §4.5 - the specific reason a 'failed' attempt failed
  // (rate limit / auth / schema / generic), so the UI can show something
  // more useful than one generic "couldn't mark this" message for every
  // cause. Null for every other marking_status.
  failure_reason: string | null;
  created_at: string;
  marked_at: string | null;
};

export function examQuestionAttemptsQueryKey(topicId: string) {
  return ['exam-question-attempts', topicId] as const;
}

async function fetchExamQuestionAttempts(
  topicId: string
): Promise<ExamQuestionAttempt[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('exam_question_attempts')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export function useExamQuestionAttempts(topicId: string) {
  const queryClient = useQueryClient();
  const queryKey = examQuestionAttemptsQueryKey(topicId);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchExamQuestionAttempts(topicId),
  });

  useRealtimeTables(['exam_question_attempts'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

// The most recent attempt per (question, part) - what progress/gate
// computations and the answer form both key off, per
// specs/exam-question-bank/design.md §4's `latestAttemptsByPart`.
export function latestAttemptsByPart(
  attempts: ExamQuestionAttempt[]
): Record<string, ExamQuestionAttempt> {
  const latest: Record<string, ExamQuestionAttempt> = {};
  // attempts is already newest-first (query orders by created_at desc),
  // so the first one seen per key is the latest.
  for (const attempt of attempts) {
    const key = `${attempt.question_id}:${attempt.part}`;
    if (!latest[key]) latest[key] = attempt;
  }
  return latest;
}

export function useSubmitExamAnswer(topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      part,
      answer,
    }: {
      questionId: string;
      part: string;
      answer: string;
    }) => {
      const response = await fetch('/api/exam-questions/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, part, answer }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Could not submit the answer');
      }
      return data as ExamQuestionAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: examQuestionAttemptsQueryKey(topicId),
      });
    },
  });
}
