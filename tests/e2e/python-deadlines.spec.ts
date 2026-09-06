import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test('a Python problem with a past due date and a non-reviewed status appears in the same overdue banner as NEA sections', async ({
  page,
}) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await supabase.auth.signInWithPassword({
    email: process.env.E2E_SUPPORTER_EMAIL!,
    password: process.env.E2E_SUPPORTER_PASSWORD!,
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const uniqueTitle = `Overdue-banner test ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await supabase.from('python_problems').insert({
    title: uniqueTitle,
    description: 'Overdue check.',
    due_date: '2020-01-01',
    created_by: user!.id,
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  await expect(
    page.getByRole('link', { name: new RegExp(`Overdue: ${uniqueTitle}`) })
  ).toBeVisible({ timeout: 10000 });
  // No delete policy on python_problems for either role (task 20) -
  // cleanup happens out of band via the direct DB connection, same as
  // every other Python-problem test in this suite.
});
