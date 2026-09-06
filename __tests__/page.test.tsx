import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../app/(app)/page';

test('dashboard page renders its section heading', () => {
  render(<DashboardPage />);
  expect(screen.getByText('Dashboard')).toBeDefined();
});
