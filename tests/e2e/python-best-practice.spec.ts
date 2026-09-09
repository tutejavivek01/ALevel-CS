import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

// The parent-authored ("custom") problem scenario this test used to also
// cover is retired along with that flow (design.md §6.9, requirements.md
// §8.11) - gradeSubmission() (lib/python/grade-submission.ts) is shared
// between the two flows, so this single test on the OCR flow now covers
// every case the deleted one did: findings shown, findings quiet, and a
// wrong answer still marked fail despite poor structure.
test('the best-practice checker flags a poorly-structured submission, stays quiet for a well-structured one, and never changes pass/fail', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await page.goto('/python/ocr/ocr-factorial-finder');

  const editor = page.locator('.cm-content');

  // Poorly-structured but correct: no functions, a single-letter name.
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('x = int(input())\nimport math\nprint(math.factorial(x))');
  await page.getByRole('button', { name: 'Run' }).click();

  await expect(page.locator('.python-output.pass')).toBeVisible({ timeout: 45000 });
  await expect(page.locator('.best-practice-panel')).toBeVisible();
  await expect(page.locator('.best-practice-panel')).toContainText('No functions or classes');
  await expect(page.locator('.best-practice-panel')).toContainText(
    "Variable 'x' has a non-descriptive single-letter name"
  );

  // Well-structured and correct: findings panel doesn't appear at all.
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(
    'def compute_factorial(n):\n    return 1 if n == 0 else n * compute_factorial(n - 1)\n\n\nprint(compute_factorial(int(input())))'
  );
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.locator('.python-output.pass')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.best-practice-panel')).toHaveCount(0);

  // A poorly-structured WRONG answer is still marked fail, not let off
  // easy - the checker never touches overallResult.
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('x = int(input())\nprint(x)');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.locator('.python-output.fail')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.best-practice-panel')).toBeVisible();
});
