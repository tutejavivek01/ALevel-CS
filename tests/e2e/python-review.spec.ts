import { config } from 'dotenv';
import path from 'node:path';
import { test, expect, type Browser } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

async function loginAs(browser: Browser, email: string, password: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  return { context, page };
}

test('the four-state review status progresses correctly through the real UI, on both the detail page and the list', async ({
  browser,
}) => {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await admin.auth.signInWithPassword({
    email: process.env.E2E_SUPPORTER_EMAIL!,
    password: process.env.E2E_SUPPORTER_PASSWORD!,
  });
  const {
    data: { user },
  } = await admin.auth.getUser();

  const uniqueTitle = `Review-flow test ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const { data: problem } = await admin
    .from('python_problems')
    .insert({ title: uniqueTitle, description: 'Say hi.', created_by: user!.id })
    .select()
    .single();
  await admin
    .from('python_test_cases')
    .insert({ problem_id: problem!.id, position: 0, input: '', expected_output: 'hi\n' });

  const student = await loginAs(
    browser,
    process.env.E2E_STUDENT_EMAIL!,
    process.env.E2E_STUDENT_PASSWORD!
  );
  const supporter = await loginAs(
    browser,
    process.env.E2E_SUPPORTER_EMAIL!,
    process.env.E2E_SUPPORTER_PASSWORD!
  );

  // not-started: nobody has attempted it yet.
  await student.page.goto(`/python/${problem!.id}`);
  await expect(student.page.locator('.status-badge[data-status="not-started"]')).toBeVisible();
  await student.page.goto('/python');
  await expect(
    student.page.locator('.python-row', { hasText: uniqueTitle }).locator('.status-badge')
  ).toHaveText('Not started');

  // attempted: the student runs it (a submission now exists), but
  // hasn't asked for review yet - the button shouldn't even be usable
  // before that.
  await student.page.goto(`/python/${problem!.id}`);
  await expect(
    student.page.getByRole('button', { name: 'Submit for review' })
  ).toBeDisabled();
  const editor = student.page.locator('.cm-content');
  await editor.click();
  await student.page.keyboard.type('print("hi")');
  await student.page.getByRole('button', { name: 'Run' }).click();
  await expect(student.page.locator('.python-output.pass')).toBeVisible({ timeout: 45000 });
  await expect(student.page.locator('.status-badge[data-status="attempted"]')).toBeVisible();

  // submitted-for-review: the student explicitly asks for feedback -
  // this is a separate action from Run (design.md §6.7).
  await student.page.getByRole('button', { name: 'Submit for review' }).click();
  await expect(
    student.page.locator('.status-badge[data-status="submitted-for-review"]')
  ).toBeVisible();

  // The supporter sees the same status live, without reloading.
  await supporter.page.goto(`/python/${problem!.id}`);
  await expect(
    supporter.page.locator('.status-badge[data-status="submitted-for-review"]')
  ).toBeVisible();

  // reviewed: the supporter leaves feedback - only the supporter can.
  await expect(supporter.page.getByPlaceholder('Leave feedback…')).toBeVisible();
  await expect(student.page.getByPlaceholder('Leave feedback…')).toHaveCount(0);

  await supporter.page.getByPlaceholder('Leave feedback…').fill('Nice, ship it.');
  await supporter.page.getByRole('button', { name: 'Add review' }).click();
  await expect(supporter.page.getByText('Nice, ship it.')).toBeVisible();
  await expect(supporter.page.locator('.status-badge[data-status="reviewed"]')).toBeVisible();

  // Live on the student's session too, and reflected on the list page.
  await expect(student.page.locator('.status-badge[data-status="reviewed"]')).toBeVisible({
    timeout: 10000,
  });
  await student.page.goto('/python');
  await expect(
    student.page.locator('.python-row', { hasText: uniqueTitle }).locator('.status-badge')
  ).toHaveText('Reviewed');

  await student.context.close();
  await supporter.context.close();
});
