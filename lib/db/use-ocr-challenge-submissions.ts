'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useRealtimeTables } from './use-realtime-tables';
import { usePyodideWorker } from '@/lib/python/use-pyodide-worker';
import { gradeSubmission, type GradableTestCase } from '@/lib/python/grade-submission';

export type OcrChallengeSubmissionResult = {
  id: number;
  submission_id: number;
  test_case_position: number;
  passed: boolean;
  actual_output: string;
};

export type OcrChallengeSubmission = {
  id: number;
  challenge_id: string;
  submitted_by: string;
  code: string;
  overall_result: 'pass' | 'fail' | 'timeout' | 'error';
  error_message: string | null;
  best_practice_findings: string[];
  created_at: string;
  ocr_challenge_submission_results: OcrChallengeSubmissionResult[];
};

export function ocrChallengeSubmissionsQueryKey(challengeId: string) {
  return ['ocr-challenge-submissions', challengeId] as const;
}

async function fetchOcrChallengeSubmissions(
  challengeId: string
): Promise<OcrChallengeSubmission[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('ocr_challenge_submissions')
    .select('*, ocr_challenge_submission_results(*)')
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export function useOcrChallengeSubmissions(challengeId: string) {
  const queryClient = useQueryClient();
  const queryKey = ocrChallengeSubmissionsQueryKey(challengeId);

  const query = useQuery({ queryKey, queryFn: () => fetchOcrChallengeSubmissions(challengeId) });

  useRealtimeTables(['ocr_challenge_submissions', 'ocr_challenge_submission_results'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

// Mirrors useSubmitPythonCode exactly (lib/db/use-python-submissions.ts)
// except for the code-defined text challenge_id key and
// test_case_position replacing test_case_id - both share the same
// gradeSubmission() core (lib/python/grade-submission.ts). Not built on
// useOptimisticMutation for the same reason as the parent-authored
// flow: there's no honest guess to show before the code has actually
// run.
export function useSubmitOcrChallengeCode(challengeId: string, testCases: GradableTestCase[]) {
  const queryClient = useQueryClient();
  const worker = usePyodideWorker();

  return useMutation({
    mutationFn: async (code: string) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { overallResult, perTestResults, errorMessage, bestPracticeFindings } =
        await gradeSubmission(code, testCases, worker);

      const { data: submission, error } = await supabase
        .from('ocr_challenge_submissions')
        .insert({
          challenge_id: challengeId,
          submitted_by: user.id,
          code,
          overall_result: overallResult,
          error_message: errorMessage,
          best_practice_findings: bestPracticeFindings,
        })
        .select()
        .single();
      if (error) throw error;

      if (perTestResults.length > 0) {
        const { error: resultsError } = await supabase
          .from('ocr_challenge_submission_results')
          .insert(
            perTestResults.map((r) => ({
              submission_id: submission.id,
              test_case_position: r.position,
              passed: r.passed,
              actual_output: r.actualOutput,
            }))
          );
        if (resultsError) throw resultsError;
      }

      return { overallResult, perTestResults, errorMessage, bestPracticeFindings };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ocrChallengeSubmissionsQueryKey(challengeId) });
    },
  });
}
