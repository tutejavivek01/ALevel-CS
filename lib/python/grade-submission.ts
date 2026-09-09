import { outputsMatch } from '@/lib/exercises/python-output';
import type { PyodideRunResponse } from './pyodide-protocol';

// Shared by useSubmitPythonCode and useSubmitOcrChallengeCode (design.md
// §6.7/§6.8) - both grade a submission against a list of {input,
// expectedOutput} test cases the exact same way; the only difference
// between the two callers is what they persist the result as
// afterward (a bigint test_case_id vs. a code-defined position). Test
// cases are addressed by array position here, which both callers can
// map back to their own key.
export type GradableTestCase = { input: string; expectedOutput: string };

export type PerTestResult = { position: number; passed: boolean; actualOutput: string };

export type GradingResult = {
  overallResult: 'pass' | 'fail' | 'timeout' | 'error';
  perTestResults: PerTestResult[];
  errorMessage: string | null;
  bestPracticeFindings: string[];
};

export type PyodideWorkerHandle = {
  run: (code: string, input: string) => Promise<PyodideRunResponse>;
  check: (code: string) => Promise<{ findings: string[]; syntaxError: string | null }>;
};

export async function gradeSubmission(
  code: string,
  testCases: GradableTestCase[],
  worker: PyodideWorkerHandle
): Promise<GradingResult> {
  const perTestResults: PerTestResult[] = [];
  let overallResult: GradingResult['overallResult'] = 'pass';
  let errorMessage: string | null = null;

  for (let position = 0; position < testCases.length; position++) {
    const testCase = testCases[position];
    const result = await worker.run(code, testCase.input);

    if (result.outcome === 'timeout') {
      overallResult = 'timeout';
      break;
    }
    if (result.outcome === 'error') {
      overallResult = 'error';
      errorMessage = result.traceback;
      break;
    }

    const passed = outputsMatch(result.stdout, testCase.expectedOutput);
    perTestResults.push({ position, passed, actualOutput: result.stdout });
    // Wrong output on one case doesn't stop the run - every test case
    // still gets graded (a timeout/error genuinely can't continue,
    // since the program itself hung or crashed).
    if (!passed && overallResult === 'pass') overallResult = 'fail';
  }

  // One check per submission, not per test case - it inspects the
  // submitted source itself, so repeating it per test case would just
  // recompute the same answer. Advisory only: never affects
  // overallResult above. syntaxError is ignored here - a run() already
  // produces a proper traceback for code that doesn't parse, so there's
  // nothing this needs to add (it's only load-bearing for saved code
  // versions, which have no execution attempt of their own - §6.10).
  const { findings: bestPracticeFindings } = await worker.check(code);

  return { overallResult, perTestResults, errorMessage, bestPracticeFindings };
}
