import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

// AccountBadge (rendered by Home) uses next/navigation's router and the
// Supabase browser client, neither of which exist in a bare RTL render.
// The router hook needs App Router context; exercising real sign-in/auth
// state belongs to the Playwright flows in tests/e2e, not this smoke test.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock('@/lib/db/use-current-profile', () => ({
  useCurrentProfile: () => ({ profile: null, loading: true }),
}));

test('home page renders a heading', () => {
  render(<Home />);
  expect(
    screen.getByRole('heading', { level: 1, name: 'Spec Tracker' })
  ).toBeDefined();
});
