import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

test('home page renders a heading', () => {
  render(<Home />);
  expect(
    screen.getByRole('heading', { level: 1, name: 'Spec Tracker' })
  ).toBeDefined();
});
