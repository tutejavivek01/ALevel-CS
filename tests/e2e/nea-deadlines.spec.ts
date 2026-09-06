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

test('a past target date shows the section as overdue on the dashboard', async ({
  page,
}) => {
  await page.goto('/nea');
  const row = page.locator('.nea-row', { hasText: 'Evaluation' });
  await row.locator('input[type="date"]').fill('2020-01-01');
  await expect(row.locator('input[type="date"]')).toHaveValue('2020-01-01');

  await page.getByRole('link', { name: 'Dashboard' }).click();
  // Scoped to the deadline banner's link specifically - the activity
  // feed on the same page also mentions "Evaluation" once the target
  // date change itself gets logged (task 14), so a bare text search
  // matches both.
  await expect(
    page.getByRole('link', { name: /Overdue: Evaluation/ })
  ).toBeVisible({ timeout: 10000 });
});

test('the marks-worth-complete figure matches a hand-calculated expectation', async ({
  page,
}) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await supabase.auth.signInWithPassword({
    email: process.env.E2E_STUDENT_EMAIL!,
    password: process.env.E2E_STUDENT_PASSWORD!,
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Force a known baseline directly, independent of whatever earlier
  // tests left behind: only "testing" (8 marks) complete. Deliberately
  // not "evaluation" - the other test in this file sets a target date on
  // that section and relies on it staying non-complete.
  const sectionIds = [
    'analysis',
    'design',
    'tech-complete',
    'tech-technique',
    'testing',
    'evaluation',
  ];
  for (const sectionId of sectionIds) {
    await supabase.from('nea_state').upsert({
      section_id: sectionId,
      status: sectionId === 'testing' ? 'complete' : 'in-progress',
      updated_by: user!.id,
    });
  }

  await page.goto('/nea');
  await expect(page.getByText('≥ 8/75')).toBeVisible({ timeout: 10000 });
});
