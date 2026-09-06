import { describe, it, expect } from 'vitest';
import { deriveReviewStatus } from '@/lib/exercises/python-review-status';

describe('deriveReviewStatus', () => {
  it('is not-started with no submissions and no submit-for-review', () => {
    expect(
      deriveReviewStatus({
        hasSubmissions: false,
        submittedForReviewAt: null,
        latestReviewAt: null,
      })
    ).toBe('not-started');
  });

  it('is attempted with at least one submission but no submit-for-review', () => {
    expect(
      deriveReviewStatus({
        hasSubmissions: true,
        submittedForReviewAt: null,
        latestReviewAt: null,
      })
    ).toBe('attempted');
  });

  it('is submitted-for-review when submitted and no review exists yet', () => {
    expect(
      deriveReviewStatus({
        hasSubmissions: true,
        submittedForReviewAt: '2026-09-01T00:00:00.000Z',
        latestReviewAt: null,
      })
    ).toBe('submitted-for-review');
  });

  it('is reviewed when a review exists after the submit-for-review time', () => {
    expect(
      deriveReviewStatus({
        hasSubmissions: true,
        submittedForReviewAt: '2026-09-01T00:00:00.000Z',
        latestReviewAt: '2026-09-02T00:00:00.000Z',
      })
    ).toBe('reviewed');
  });

  it('is still submitted-for-review if the only review predates this submit-for-review', () => {
    // A prior round's review shouldn't mark a fresh request as handled.
    expect(
      deriveReviewStatus({
        hasSubmissions: true,
        submittedForReviewAt: '2026-09-05T00:00:00.000Z',
        latestReviewAt: '2026-09-01T00:00:00.000Z',
      })
    ).toBe('submitted-for-review');
  });

  it('prioritizes submitted-for-review/reviewed over attempted regardless of submission count', () => {
    expect(
      deriveReviewStatus({
        hasSubmissions: false,
        submittedForReviewAt: '2026-09-01T00:00:00.000Z',
        latestReviewAt: null,
      })
    ).toBe('submitted-for-review');
  });
});
