import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test('a submission is graded against every test case, persisted, shown in history on a later visit, and timeout/error are stored distinctly from pass/fail', async ({
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

  const uniqueTitle = `Submission test ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const { data: problem } = await supporter
    .from('python_problems')
    .insert({
      title: uniqueTitle,
      description: 'Echo the input.',
      created_by: user!.id,
    })
    .select()
    .single();

  await supporter.from('python_test_cases').insert([
    { problem_id: problem!.id, position: 0, input: '5\n', expected_output: '5\n' },
    { problem_id: problem!.id, position: 1, input: '3\n', expected_output: '3\n' },
  ]);

  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await page.goto(`/python/${problem!.id}`);

  const editor = page.locator('.cm-content');

  async function typeCode(code: string) {
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(code);
  }

  // Correct solution: graded against BOTH test cases, not just one.
  await typeCode('print(input())');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.locator('.python-output.pass')).toBeVisible({ timeout: 45000 });
  await expect(page.locator('.python-output')).toContainText('Test 1: passed');
  await expect(page.locator('.python-output')).toContainText('Test 2: passed');

  // Buggy solution: fails test 1, still runs (and reports) test 2.
  await typeCode('print("3")');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.locator('.python-output.fail')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.python-output')).toContainText('Test 1: failed');
  await expect(page.locator('.python-output')).toContainText('Test 2: passed');

  // A genuine error - distinct from a failed test case, not persisted
  // as 'fail'.
  await typeCode('1 / 0');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.locator('.python-output.error')).toBeVisible({ timeout: 10000 });

  // A timeout - distinct from both 'fail' and 'error'.
  await typeCode('while True: pass');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.locator('.python-output.timeout')).toBeVisible({ timeout: 10000 });

  // All four attempts are persisted and visible on a later visit - not
  // just held in this page's local state.
  await page.reload();
  const historyRows = page.locator('.submission-row');
  await expect(historyRows).toHaveCount(4);
  await expect(page.locator('.result-badge[data-result="pass"]')).toHaveCount(1);
  await expect(page.locator('.result-badge[data-result="fail"]')).toHaveCount(1);
  await expect(page.locator('.result-badge[data-result="error"]')).toHaveCount(1);
  await expect(page.locator('.result-badge[data-result="timeout"]')).toHaveCount(1);
  await expect(page.locator('.submission-row.pass')).toContainText('2 / 2 test cases passed');
});
