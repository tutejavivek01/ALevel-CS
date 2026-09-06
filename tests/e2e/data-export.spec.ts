import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test('an unauthenticated request to /export redirects to /login', async ({ page }) => {
  const response = await page.goto('/export');
  expect(response?.url()).toContain('/login');
});

test('the export contains every table, with counts matching the database directly', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  const response = await page.request.get('/export');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-disposition']).toContain('attachment');
  const body = await response.json();

  const expectedTables = [
    'profiles',
    'subtopic_status',
    'subtopic_status_history',
    'subtopic_flags',
    'nea_state',
    'nea_notes',
    'resource_links',
    'glossary_progress',
    'python_problems',
    'python_test_cases',
    'python_submissions',
    'python_submission_results',
    'python_problem_reviews',
    'activity_events',
  ];
  for (const table of expectedTables) {
    expect(Array.isArray(body[table])).toBe(true);
  }

  // Spot-check a handful of counts against the database directly, per
  // this task's own "done when" - not just "the key exists".
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  for (const table of ['profiles', 'subtopic_status', 'nea_state', 'python_problems']) {
    const { count } = await admin.from(table).select('*', { count: 'exact', head: true });
    expect(body[table].length).toBe(count);
  }
});

test('the "Download my data" link is reachable from the dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  await expect(page.getByRole('link', { name: 'Download my data' })).toHaveAttribute(
    'href',
    '/export'
  );
});
