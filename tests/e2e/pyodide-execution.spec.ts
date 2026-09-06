import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test('a correct program shows its output, a buggy one shows a real traceback, and pyodide is not reloaded on the second run', async ({
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

  const uniqueTitle = `Pyodide-exec test ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const { data: problem } = await supporter
    .from('python_problems')
    .insert({
      title: uniqueTitle,
      description: 'Run a program.',
      starter_code: 'print("unused")',
      created_by: user!.id,
    })
    .select()
    .single();

  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  let wasmRequestCount = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('pyodide.asm.wasm')) wasmRequestCount++;
  });

  await page.goto(`/python/${problem!.id}`);

  const editor = page.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('print("hello world")');
  await page.getByRole('button', { name: 'Run' }).click();

  // Generous timeout - this run pays Pyodide's one-time load/init cost.
  await expect(page.locator('.python-output.ok')).toBeVisible({ timeout: 45000 });
  await expect(page.locator('.python-output')).toContainText('hello world');

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
