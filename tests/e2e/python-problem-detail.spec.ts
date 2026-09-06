import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
});

test('a problem renders its description, test cases, and a working editable code editor', async ({
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

  const uniqueTitle = `Detail-view test ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const { data: problem } = await supporter
    .from('python_problems')
    .insert({
      title: uniqueTitle,
      description: 'Print the word hello.',
      starter_code: 'print("start")',
      created_by: user!.id,
    })
    .select()
    .single();

  await supporter.from('python_test_cases').insert({
    problem_id: problem!.id,
    position: 0,
    input: '',
    expected_output: 'hello\n',
  });

  await page.goto(`/python/${problem!.id}`);

  await expect(page.getByRole('heading', { name: uniqueTitle })).toBeVisible();
  await expect(page.getByText('Print the word hello.')).toBeVisible();
  await expect(page.getByText('Expected: hello')).toBeVisible();

  // The editor is pre-filled with starter_code and is genuinely editable
  // (not a static <pre> block) - CodeMirror renders a contenteditable
  // .cm-content div, not a <textarea>.
  const editor = page.locator('.cm-content');
  await expect(editor).toContainText('print("start")');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('print("hello")');
  await expect(editor).toContainText('print("hello")');

  // Execution itself (task 23) is covered by pyodide-execution.spec.ts -
  // just confirm the control is present and enabled here.
  await expect(page.getByRole('button', { name: 'Run' })).toBeEnabled();
});

test('an unknown problem id 404s', async ({ page }) => {
  const response = await page.goto('/python/999999999');
  expect(response?.status()).toBe(404);
});
