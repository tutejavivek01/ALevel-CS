// Derived status for a Python problem (design.md §6.7's table,
// requirements.md §8.6) - computed from existing data, never stored as
// its own column, so there's no way for it to drift out of sync with
// the rows it's derived from.
export type PythonReviewStatus =
  | 'not-started'
  | 'attempted'
  | 'submitted-for-review'
  | 'reviewed';

export function deriveReviewStatus(params: {
  hasSubmissions: boolean;
  submittedForReviewAt: string | null;
  // Timestamp of the most recent python_problem_reviews row for this
  // problem, if any - null if it's never been reviewed at all.
  latestReviewAt: string | null;
}): PythonReviewStatus {
  const { hasSubmissions, submittedForReviewAt, latestReviewAt } = params;

  if (submittedForReviewAt) {
    // Only a review created AFTER the current submit-for-review counts -
    // an older review from a prior round shouldn't mark a fresh
    // "please look again" request as already handled.
    if (latestReviewAt && latestReviewAt > submittedForReviewAt) {
      return 'reviewed';
    }
    return 'submitted-for-review';
  }
  if (hasSubmissions) return 'attempted';
  return 'not-started';
}
