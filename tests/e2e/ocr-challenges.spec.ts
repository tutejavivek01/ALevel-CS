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

test('the /python list shows all 80 OCR challenges as a single list', async ({ page }) => {
  await page.goto('/python');

  await expect(page.getByRole('heading', { name: 'OCR Coding Challenges' })).toBeVisible();

  // All 80 are reachable from the list - spot-check the first, a
  // middle, and the last rather than asserting every single link.
  await expect(page.getByText('1. Factorial Finder')).toBeVisible();
  await expect(page.getByText('44. Sudoku')).toBeVisible();
  await expect(page.getByText('80. Happy Hopper')).toBeVisible();
});

test('a challenge renders its correct content and a working editor', async ({ page }) => {
  const challenge = OCR_CHALLENGES.find((c) => c.id === 'ocr-fizz-buzz')!;
  await page.goto(`/python/ocr/${challenge.id}`);

  await expect(page.getByRole('heading', { name: challenge.title })).toBeVisible();
  await expect(page.locator('.blurb')).toContainText('replicates the famous game Fizz Buzz');
  await expect(page.locator('.cm-content')).toBeVisible();
  // fizz-buzz got real test cases in task 34, so Run is enabled here -
  // execution itself is covered by ocr-challenge-execution.spec.ts.
  await expect(page.getByRole('button', { name: 'Run' })).toBeEnabled();
});

test('a challenge with no test cases shows the manual-review note', async ({ page }) => {
  // ocr-fireworks is one of the 58 permanently non-testable challenges
  // (requirements.md §8.8) - it never gets test cases, unlike the 22
  // that did once task 34 hand-derived them.
  const challenge = OCR_CHALLENGES.find((c) => c.id === 'ocr-fireworks')!;
  expect(challenge.testCases).toBeUndefined();
  await page.goto(`/python/ocr/${challenge.id}`);

  await expect(page.getByText('Manual review only - no automated tests')).toBeVisible();
});

test('an unknown challenge id 404s', async ({ page }) => {
  const response = await page.goto('/python/ocr/not-a-real-challenge');
  expect(response?.status()).toBe(404);
});

test('the retired ad hoc problem routes no longer exist', async ({ page }) => {
  // design.md §6.9, requirements.md §8.11 - the creation form and the
  // per-problem detail page are deleted from the product surface.
  const newResponse = await page.goto('/python/new');
  expect(newResponse?.status()).toBe(404);

  const detailResponse = await page.goto('/python/1');
  expect(detailResponse?.status()).toBe(404);
});
