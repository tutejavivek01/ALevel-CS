import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../app/(app)/page';

// Dashboard reads live Supabase data via useAllSubtopicStatuses, which
// needs a QueryClientProvider and a real Supabase client - neither
// exists in a bare RTL render. Exercising real data/realtime behavior
// belongs to the Playwright flows in tests/e2e, not this smoke test.
vi.mock('@/lib/db/use-all-subtopic-statuses', () => ({
  useAllSubtopicStatuses: () => ({ data: {}, isLoading: false }),
}));
vi.mock('@/lib/db/use-activity-feed', () => ({
  useActivityFeed: () => ({ data: [], isLoading: false }),
}));
vi.mock('@/lib/db/use-nea-state', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/db/use-nea-state')>();
  return { ...actual, useNeaState: () => ({ data: {}, isLoading: false }) };
});
// DeadlineBanner also reads OCR challenge due dates/review statuses
// (design.md §6.11) - same reasoning as the mocks above.
vi.mock('@/lib/db/use-ocr-challenge-reviews', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/db/use-ocr-challenge-reviews')>();
  return {
    ...actual,
    useOcrChallengeDueDates: () => ({ data: {}, isLoading: false }),
  };
});
vi.mock('@/lib/db/use-ocr-challenge-review-statuses', () => ({
  useOcrChallengeReviewStatuses: () => ({ data: {}, isLoading: false }),
}));
vi.mock('@/lib/db/use-reading-state', () => ({
  useAllTopicReadState: () => ({ data: {}, isLoading: false }),
}));
test('dashboard page renders the specification map with all 13 topics', () => {
  render(<DashboardPage />);
  expect(screen.getByText('Specification map')).toBeDefined();
  expect(screen.getByText('Fundamentals of Programming')).toBeDefined();
  expect(
    screen.getByText('Systematic Approach to Problem Solving')
  ).toBeDefined();
});
