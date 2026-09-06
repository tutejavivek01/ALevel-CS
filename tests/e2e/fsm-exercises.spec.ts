import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await page.goto('/practice/theory-of-computation');
});

test('both FSM exercises render their state diagram', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: /detects a string ending in '01'/ })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /a turnstile/ })).toBeVisible();
  await expect(page.locator('svg.fsm')).toHaveCount(2);
});

test('the ends-in-01 FSM is step-checkable, not just a reveal-only answer', async ({
  page,
}) => {
  const exercise = page.locator('.ex', { hasText: "ending in '01'" });
  const inputs = exercise.locator('table.trace input');
  await expect(inputs).toHaveCount(4); // 4 symbols x 1 checked field (state)

  // Correct trace: 1->A, 0->B, 1->C, 1->A
  await inputs.nth(0).fill('A');
  await inputs.nth(1).fill('B');
  await inputs.nth(2).fill('C');
  await inputs.nth(3).fill('A');
  await exercise.getByRole('button', { name: 'Check my trace' }).click();

  for (let i = 0; i < 4; i++) {
    await expect(inputs.nth(i)).toHaveClass(/correct/);
  }
  await expect(exercise.getByText('All 4 correct!')).toBeVisible();
});

test('an incorrect FSM trace is highlighted per-cell, not revealed', async ({ page }) => {
  const exercise = page.locator('.ex', { hasText: "ending in '01'" });
  const inputs = exercise.locator('table.trace input');
  await inputs.nth(0).fill('A');
  await inputs.nth(1).fill('WRONG');
  await inputs.nth(2).fill('C');
  await inputs.nth(3).fill('A');
  await exercise.getByRole('button', { name: 'Check my trace' }).click();

  await expect(inputs.nth(0)).toHaveClass(/correct/);
  await expect(inputs.nth(1)).toHaveClass(/wrong/);
  await expect(inputs.nth(2)).toHaveClass(/correct/);
  await expect(inputs.nth(3)).toHaveClass(/correct/);
  // The answer must not be shown automatically just because of a wrong guess.
  await expect(exercise.getByText('It ends in state A')).not.toBeVisible();
});

test('the Mealy turnstile checks both state and output per step', async ({ page }) => {
  const exercise = page.locator('.ex', { hasText: 'a turnstile' });
  const inputs = exercise.locator('table.trace input');
  await expect(inputs).toHaveCount(10); // 5 symbols x 2 checked fields (state, output)

  const expectedStates = ['Unlocked', 'Locked', 'Locked', 'Unlocked', 'Locked'];
  const expectedOutputs = ['unlock', 'lock', '–', 'unlock', 'lock'];
  for (let i = 0; i < 5; i++) {
    await inputs.nth(i * 2).fill(expectedStates[i]);
    await inputs.nth(i * 2 + 1).fill(expectedOutputs[i]);
  }
  await exercise.getByRole('button', { name: 'Check my trace' }).click();
  await expect(exercise.getByText('All 10 correct!')).toBeVisible();
});
