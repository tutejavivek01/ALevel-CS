'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useRealtimeTables } from './use-realtime-tables';
import { usePyodideWorker } from '@/lib/python/use-pyodide-worker';
import { outputsMatch } from '@/lib/exercises/python-output';
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
  const { run } = usePyodideWorker();

  return useMutation({
    mutationFn: async (code: string) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const perTestResults: { testCaseId: number; passed: boolean; actualOutput: string }[] = [];
      let overallResult: PythonSubmission['overall_result'] = 'pass';
      let errorMessage: string | null = null;

      for (const testCase of testCases) {
        const result = await run(code, testCase.input);

        if (result.outcome === 'timeout') {
          overallResult = 'timeout';
          break;
        }
        if (result.outcome === 'error') {
          overallResult = 'error';
          errorMessage = result.traceback;
          break;
        }

        const passed = outputsMatch(result.stdout, testCase.expected_output);
        perTestResults.push({ testCaseId: testCase.id, passed, actualOutput: result.stdout });
        // Wrong output on one case doesn't stop the run - every test
        // case still gets graded, matching task 25's "graded correctly
        // against all test cases" (a timeout/error genuinely can't
        // continue, since the program itself hung or crashed).
        if (!passed && overallResult === 'pass') overallResult = 'fail';
      }

      const { data: submission, error } = await supabase
        .from('python_submissions')
        .insert({
          problem_id: problemId,
          submitted_by: user.id,
          code,
          overall_result: overallResult,
          error_message: errorMessage,
        })
        .select()
        .single();
      if (error) throw error;

      if (perTestResults.length > 0) {
        const { error: resultsError } = await supabase.from('python_submission_results').insert(
          perTestResults.map((r) => ({
            submission_id: submission.id,
            test_case_id: r.testCaseId,
            passed: r.passed,
            actual_output: r.actualOutput,
          }))
        );
        if (resultsError) throw resultsError;
      }

      return { overallResult, perTestResults, errorMessage };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pythonSubmissionsQueryKey(problemId) });
    },
  });
}
