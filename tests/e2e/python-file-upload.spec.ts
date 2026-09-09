import { config } from 'dotenv';
import path from 'node:path';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test('uploading a .py file populates the editor, stays editable, and submits indistinguishably from typed code', async ({
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

  const uniqueTitle = `File-upload test ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const { data: problem } = await supporter
    .from('python_problems')
    .insert({ title: uniqueTitle, description: 'Upload check.', created_by: user!.id })
    .select()
    .single();
  await supporter
    .from('python_test_cases')
    .insert({ problem_id: problem!.id, position: 0, input: '', expected_output: 'from file\n' });

  const tmpDir = mkdtempSync(path.join(tmpdir(), 'ocr-upload-test-'));
  const filePath = path.join(tmpDir, 'solution.py');
  writeFileSync(filePath, 'print("from file")');

  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await page.goto(`/python/${problem!.id}`);

  await page.getByText('Upload .py file').setInputFiles(filePath);

  const editor = page.locator('.cm-content');
  await expect(editor).toContainText('print("from file")');

  // Still editable afterward - not a static/locked preview.
  await editor.click();
  await page.keyboard.press('End');
  await page.keyboard.type('  # edited after upload');
  await expect(editor).toContainText('# edited after upload');

  // Undo the appended comment so the program is exactly the uploaded
  // one again, then submit - the resulting row must be indistinguishable
  // from a typed/pasted submission (same table, same columns, no upload
  // metadata anywhere).
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('print("from file")');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.locator('.python-output.pass')).toBeVisible({ timeout: 45000 });

  const { data: submissions } = await supporter
    .from('python_submissions')
    .select('*')
    .eq('problem_id', problem!.id);
  expect(submissions).toHaveLength(1);
  expect(submissions![0].code).toBe('print("from file")');
  expect(Object.keys(submissions![0]).sort()).toEqual(
    [
      'id',
      'problem_id',
      'submitted_by',
      'code',
      'overall_result',
      'error_message',
      'best_practice_findings',
      'created_at',
    ].sort()
  );

  rmSync(tmpDir, { recursive: true, force: true });
});

test('the upload control is also available on an OCR challenge page', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  await page.goto('/python/ocr/ocr-factorial-finder');
  await expect(page.getByText('Upload .py file')).toBeVisible();
});
