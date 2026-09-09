import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

// Retired the python_problems-backed setup this test used to create for
// itself along with that flow (design.md §6.9, requirements.md §8.11) -
// the execution pipeline itself is entirely shared with the OCR flow, so
// this now runs against the real, fixed ocr-factorial-finder challenge.
test('a correct program shows its output, a buggy one shows a real traceback, and pyodide is not reloaded on the second run', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  let wasmRequestCount = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('pyodide.asm.wasm')) wasmRequestCount++;
  });

  await page.goto('/python/ocr/ocr-factorial-finder');

  const editor = page.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('import math\nprint(math.factorial(int(input())))');
  await page.getByRole('button', { name: 'Run' }).click();

  // Generous timeout - this run pays Pyodide's one-time load/init cost.
  await expect(page.locator('.python-output.pass')).toBeVisible({ timeout: 45000 });
  await expect(page.locator('.python-output')).toContainText('All tests passed');
  await expect(page.locator('.python-output')).toContainText('Test 1: passed');

  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('1 / 0');
  await page.getByRole('button', { name: 'Run' }).click();

  await expect(page.locator('.python-output.error')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.python-output')).toContainText('ZeroDivisionError');

  // Exactly one fetch for the wasm binary across both runs - the second
  // run reused the already-warm worker instead of reloading Pyodide.
  expect(wasmRequestCount).toBe(1);
});
