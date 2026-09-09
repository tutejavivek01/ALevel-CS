import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { OCR_CHALLENGES } from '../../lib/exercises/ocr-challenges';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
});

test('the /python list shows both custom problems and all 80 OCR challenges as two distinct groups', async ({
  page,
}) => {
  await page.goto('/python');

  await expect(page.getByRole('heading', { name: 'Custom problems' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'OCR Coding Challenges' })).toBeVisible();

  // All 80 are reachable from the list - spot-check the first, a
  // middle, and the last rather than asserting every single link.
  await expect(page.getByText('1. Factorial Finder')).toBeVisible();
  await expect(page.getByText('44. Sudoku')).toBeVisible();
  await expect(page.getByText('80. Happy Hopper')).toBeVisible();
});

test('a challenge renders its correct content and a working, disabled-for-now editor', async ({
  page,
}) => {
  const challenge = OCR_CHALLENGES.find((c) => c.id === 'ocr-fizz-buzz')!;
  await page.goto(`/python/ocr/${challenge.id}`);

  await expect(page.getByRole('heading', { name: challenge.title })).toBeVisible();
  await expect(page.locator('.blurb')).toContainText('replicates the famous game Fizz Buzz');
  await expect(page.locator('.cm-content')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run' })).toBeDisabled();
});

test('a challenge with no test cases yet shows the manual-review note', async ({ page }) => {
  // No challenge has test cases yet (task 34 hasn't run) - every one
  // currently shows this note, which is exactly the intended behavior
  // for the permanently-non-testable subset too, once task 34 gives the
  // testable ~45-50 real test cases and this stops being universal.
  const challenge = OCR_CHALLENGES.find((c) => c.id === 'ocr-fireworks')!;
  expect(challenge.testCases).toBeUndefined();
  await page.goto(`/python/ocr/${challenge.id}`);

  await expect(page.getByText('Manual review only - no automated tests')).toBeVisible();
});

test('an unknown challenge id 404s', async ({ page }) => {
  const response = await page.goto('/python/ocr/not-a-real-challenge');
  expect(response?.status()).toBe(404);
});
