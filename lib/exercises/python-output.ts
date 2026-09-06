// The actual-vs-expected-output comparator for grading a Python
// submission (design.md §8's testing-strategy mapping calls this out
// explicitly as needing a Vitest test, not just inline `===`).
//
// Trailing whitespace (including the newline print() always appends) is
// ignored, since it's rarely what a test case author intends to check
// and would otherwise make "print(5)" fail against an expected_output
// of "5" typed without a trailing newline. Leading and internal
// whitespace still count - a program that gets the formatting wrong
// should still fail.
export function outputsMatch(actual: string, expected: string): boolean {
  return trimTrailingWhitespace(actual) === trimTrailingWhitespace(expected);
}

function trimTrailingWhitespace(value: string): string {
  return value.replace(/\s+$/, '');
}
