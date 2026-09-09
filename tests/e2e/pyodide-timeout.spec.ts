import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

// Retired the python_problems-backed setup this test used to create for
// itself along with that flow (design.md §6.9, requirements.md §8.11) -
// the timeout/interrupt mechanism itself is entirely shared with the OCR
// flow, so this now runs against the real, fixed ocr-factorial-finder
// challenge.
test('an infinite loop reports timed out within ~5s without freezing the tab, and a normal run right after still works', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  await page.goto('/python/ocr/ocr-factorial-finder');

  const editor = page.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('while True: pass');
  await page.getByRole('button', { name: 'Run' }).click();

  // The main thread must stay responsive throughout, not just appear to
  // - the infinite loop runs in the worker, so the page itself should
  // still evaluate arbitrary JS immediately while it's running.
  await expect(page.getByRole('button', { name: 'Running…' })).toBeVisible();
  const respondedWithinABeat = await Promise.race([
    page.evaluate(() => 1 + 1).then(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000)),
  ]);
  expect(respondedWithinABeat).toBe(true);

  // Generous timeout for pyodide's one-time load, but the interrupt
  // itself should fire within a few seconds of PYTHON_EXEC_TIMEOUT_MS.
  await expect(page.locator('.python-output.timeout')).toBeVisible({ timeout: 45000 });
  await expect(page.locator('.python-output')).toContainText('Timed out');

  // The worker/runtime survived the interrupt - a normal run right
  // after still works, with no reload needed.
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('import math\nprint(math.factorial(int(input())))');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.locator('.python-output.pass')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.python-output')).toContainText('All tests passed');
});
