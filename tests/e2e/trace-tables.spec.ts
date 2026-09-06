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

test('all three trace-table exercises render with their pseudocode', async ({
  page,
}) => {
  await expect(page.getByRole('heading', { name: 'Summing with a WHILE loop' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Swapping two values' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Nested FOR loops' })).toBeVisible();
  await expect(page.locator('pre.code').first()).toContainText('total');
});

test('a fully correct trace is checkable and marked all correct', async ({ page }) => {
  const exercise = page.locator('.ex', { hasText: 'Swapping two values' });
  const inputs = exercise.locator('table.trace input');
  await inputs.nth(0).fill('3');
  await inputs.nth(1).fill('8');
  await inputs.nth(2).fill('8');
  await exercise.getByRole('button', { name: 'Check my trace' }).click();

  await expect(inputs.nth(0)).toHaveClass(/correct/);
  await expect(inputs.nth(1)).toHaveClass(/correct/);
  await expect(inputs.nth(2)).toHaveClass(/correct/);
  await expect(exercise.getByText('All 3 correct!')).toBeVisible();
});

test('a wrong cell is highlighted distinctly from correct cells', async ({ page }) => {
  const exercise = page.locator('.ex', { hasText: 'Swapping two values' });
  const inputs = exercise.locator('table.trace input');
  await inputs.nth(0).fill('3');
  await inputs.nth(1).fill('999'); // wrong
  await inputs.nth(2).fill('8');
  await exercise.getByRole('button', { name: 'Check my trace' }).click();

  await expect(inputs.nth(0)).toHaveClass(/correct/);
  await expect(inputs.nth(1)).toHaveClass(/wrong/);
  await expect(inputs.nth(2)).toHaveClass(/correct/);
  await expect(exercise.getByText('2/3 correct')).toBeVisible();
});

test('the nested-loop exercise shows given i/j context columns as read-only', async ({
  page,
}) => {
  const exercise = page.locator('.ex', { hasText: 'Nested FOR loops' });
  // 6 rows x 1 editable column (output) = 6 inputs, not 18 - i and j are
  // given/read-only, not editable.
  await expect(exercise.locator('table.trace input')).toHaveCount(6);
  await expect(exercise.locator('table.trace td.given').first()).toHaveText('1');
});

test('show worked trace reveals the answer text', async ({ page }) => {
  const exercise = page.locator('.ex', { hasText: 'Summing with a WHILE loop' });
  await expect(exercise.getByText('OUTPUT total → 15')).not.toBeVisible();
  await exercise.getByRole('button', { name: 'Show worked trace' }).click();
  await expect(exercise.getByText('OUTPUT total → 15')).toBeVisible();
});
