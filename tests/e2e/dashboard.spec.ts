import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test('dashboard shows live aggregate numbers that update without reload', async ({
  browser,
}) => {
  const studentCtx = await browser.newContext();
  const studentPage = await studentCtx.newPage();
  await studentPage.goto('/login');
  await studentPage.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await studentPage
    .getByLabel('Password')
    .fill(process.env.E2E_STUDENT_PASSWORD!);
  await studentPage.getByRole('button', { name: 'Sign in' }).click();
  await studentPage.waitForURL('/');

  // Chapter completion (design.md §6.13) asks the topic's test on Mark
  // Complete. Seed a passing attempt so Mark Complete completes directly
  // and this test can exercise the live KPI behaviour it actually cares
  // about, not the test itself (mastery-gate.spec.ts covers that).
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const studentAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await studentAuth.auth.signInWithPassword({
    email: process.env.E2E_STUDENT_EMAIL!,
    password: process.env.E2E_STUDENT_PASSWORD!,
  });
  const {
    data: { user: studentUser },
  } = await studentAuth.auth.getUser();
  await admin.from('topic_completion').delete().eq('topic_id', 'algorithms');
  await admin.from('mastery_attempts').delete().eq('topic_id', 'algorithms');
  await admin.from('mastery_attempts').insert({
    topic_id: 'algorithms',
    route: 'challenge',
    score: 2,
    max_score: 2,
    passed: true,
    attempted_by: studentUser!.id,
  });

  const supporterCtx = await browser.newContext();
  const supporterPage = await supporterCtx.newPage();
  await supporterPage.goto('/login');
  await supporterPage
    .getByLabel('Email')
    .fill(process.env.E2E_SUPPORTER_EMAIL!);
  await supporterPage
    .getByLabel('Password')
    .fill(process.env.E2E_SUPPORTER_PASSWORD!);
  await supporterPage.getByRole('button', { name: 'Sign in' }).click();
  await supporterPage.waitForURL('/');

  // Supporter watches the dashboard the whole time - never reloads.
  await supporterPage.goto('/');
  const kpiBefore = await supporterPage
    .locator('.kpi', { hasText: 'Chapters marked complete' })
    .locator('.n')
    .innerText();

  // Student completes the chapter on its topic page.
  await studentPage.goto('/topic/algorithms');
  await studentPage.getByRole('button', { name: 'Mark Complete' }).click();
  await expect(studentPage.locator('.chapter-complete')).toBeVisible();

  // Supporter's dashboard (never navigated/reloaded) should update live.
  await expect(async () => {
    const after = await supporterPage
      .locator('.kpi', { hasText: 'Chapters marked complete' })
      .locator('.n')
      .innerText();
    expect(after).not.toBe(kpiBefore);
  }).toPass({ timeout: 10000 });

  await admin.from('topic_completion').delete().eq('topic_id', 'algorithms');
  await admin.from('mastery_attempts').delete().eq('topic_id', 'algorithms');
  await studentCtx.close();
  await supporterCtx.close();
});

test('every topic tile links to its topic page', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  const tiles = page.locator('.topic-tile');
  await expect(tiles).toHaveCount(13);

  await tiles.filter({ hasText: 'Theory of Computation' }).click();
  await expect(page).toHaveURL('/topic/computation');
});
