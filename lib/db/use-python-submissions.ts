'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useRealtimeTables } from './use-realtime-tables';
import { usePyodideWorker } from '@/lib/python/use-pyodide-worker';
import { gradeSubmission } from '@/lib/python/grade-submission';
import type { PythonTestCase } from './use-python-problem';

export type PythonSubmissionResult = {
  id: number;
  submission_id: number;
  test_case_id: number;
  passed: boolean;
  actual_output: string;
};

export type PythonSubmission = {
  id: number;
  problem_id: number;
  submitted_by: string;
  code: string;
  overall_result: 'pass' | 'fail' | 'timeout' | 'error';
  error_message: string | null;
  best_practice_findings: string[];
  created_at: string;
  python_submission_results: PythonSubmissionResult[];
};

export function pythonSubmissionsQueryKey(problemId: number) {
  return ['python-submissions', problemId] as const;
}

async function fetchPythonSubmissions(problemId: number): Promise<PythonSubmission[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('python_submissions')
    .select('*, python_submission_results(*)')
    .eq('problem_id', problemId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export function usePythonSubmissions(problemId: number) {
  const queryClient = useQueryClient();
  const queryKey = pythonSubmissionsQueryKey(problemId);

  const query = useQuery({ queryKey, queryFn: () => fetchPythonSubmissions(problemId) });

  useRealtimeTables(['python_submissions', 'python_submission_results'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

// Not built on useOptimisticMutation (lib/db/use-optimistic-mutation.ts)
// like every other write in this app - that pattern exists to show a
// local guess immediately and roll it back on failure, but there's no
// honest guess to show here: whether a submission passes depends on
// actually running it against every test case first. This just runs
// the real work, then persists and invalidates - Realtime (and the
// invalidate below) update the UI once the true result exists, never a
// moment before.
export function useSubmitPythonCode(problemId: number, testCases: PythonTestCase[]) {
  const queryClient = useQueryClient();
  const worker = usePyodideWorker();

  return useMutation({
    mutationFn: async (code: string) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const gradableTestCases = testCases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expected_output,
      }));
      const { overallResult, perTestResults, errorMessage, bestPracticeFindings } =
        await gradeSubmission(code, gradableTestCases, worker);

      const { data: submission, error } = await supabase
        .from('python_submissions')
        .insert({
          problem_id: problemId,
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
        const { error: resultsError } = await supabase.from('python_submission_results').insert(
          perTestResults.map((r) => ({
            submission_id: submission.id,
            test_case_id: testCases[r.position].id,
            passed: r.passed,
            actual_output: r.actualOutput,
          }))
        );
        if (resultsError) throw resultsError;
      }

      return { overallResult, perTestResults, errorMessage, bestPracticeFindings };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pythonSubmissionsQueryKey(problemId) });
    },
  });
}
