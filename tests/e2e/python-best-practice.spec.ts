import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test('the best-practice checker flags a poorly-structured submission, stays quiet for a well-structured one, and never changes pass/fail', async ({
  page,
}) => {
  const supporter = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await supporter.auth.signInWithPassword({
    email: process.env.E2E_SUPPORTER_EMAIL!,
    password: process.env.E2E_SUPPORTER_PASSWORD!,
  });
  const {
    data: { user },
  } = await supporter.auth.getUser();

  const uniqueTitle = `Best-practice test ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const { data: problem } = await supporter
    .from('python_problems')
    .insert({ title: uniqueTitle, description: 'Print a value.', created_by: user!.id })
    .select()
    .single();
  await supporter
    .from('python_test_cases')
    .insert({ problem_id: problem!.id, position: 0, input: '', expected_output: '5\n' });

  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await page.goto(`/python/${problem!.id}`);

  const editor = page.locator('.cm-content');

  // Poorly-structured but correct: no functions, a single-letter name.
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('x = 5\nprint(x)');
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
  await page.keyboard.type('def get_value():\n    return 5\n\n\nprint(get_value())');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.locator('.python-output.pass')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.best-practice-panel')).toHaveCount(0);

  // A poorly-structured WRONG answer is still marked fail, not let off
  // easy - the checker never touches overallResult.
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('x = 6\nprint(x)');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.locator('.python-output.fail')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.best-practice-panel')).toBeVisible();
});

// gradeSubmission() (lib/python/grade-submission.ts) is shared between the
// parent-authored flow above and the OCR flow, so the checker logic itself
// is already proven - this asserts the OCR detail page actually renders
// .best-practice-panel for a real OCR submission, which the shared-helper
// test above can't see.
test('the best-practice checker also renders on an OCR challenge submission', async ({
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
  await page.keyboard.type(`x = int(input())\nimport math\nprint(math.factorial(x))`);
  await page.getByRole('button', { name: 'Run' }).click();

  await expect(page.locator('.python-output')).toBeVisible({ timeout: 45000 });
  await expect(page.locator('.best-practice-panel')).toBeVisible();
  await expect(page.locator('.best-practice-panel')).toContainText('No functions or classes');
  await expect(page.locator('.best-practice-panel')).toContainText(
    "Variable 'x' has a non-descriptive single-letter name"
  );
});
