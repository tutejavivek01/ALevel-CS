import { config } from 'dotenv';
import path from 'node:path';
import { test, expect, type Browser } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

const TOPIC_PATH = '/topic/programming';
// Two different rows, deliberately: tests run in parallel across workers,
// and this file already has another test writing to subtopic__0
// concurrently (see the RLS test doesn't touch UI rows, but the reload
// and realtime tests both drive real writes and must not collide).
const RELOAD_TEST_ITEM_LABEL =
  'Data types & user-defined types (records, arrays)';
const REALTIME_TEST_ITEM_LABEL =
  'Sequence, selection & iteration (definite and indefinite)';

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

function checkRow(page: import('@playwright/test').Page, label: string) {
  return page.locator('.check-row', { hasText: label });
}

test('student can change a status and it persists across reload', async ({
  browser,
}) => {
  // `programming` is on the mastery gate's programming-challenge route
  // (design.md §6.13) - clicking Confident directly no longer works
  // until that topic's gate has been passed at least once. Seed a
  // passing attempt so this test can keep exercising the plain
  // status/reload mechanism it actually cares about, not the gate
  // itself (which mastery-gate.spec.ts covers). Previously this test
  // happened to pass only because programming__0 already had a stale
  // 'confident' status left over from before the gate existed - fixed
  // to not depend on that.
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
  await admin.from('mastery_attempts').insert({
    topic_id: 'programming',
    route: 'challenge',
    score: 2,
    max_score: 2,
    passed: true,
    attempted_by: studentUser!.id,
  });

  const { context, page } = await loginAs(
    browser,
    process.env.E2E_STUDENT_EMAIL!,
    process.env.E2E_STUDENT_PASSWORD!
  );
  await page.goto(TOPIC_PATH);
  const row = checkRow(page, RELOAD_TEST_ITEM_LABEL);

  await row.getByRole('button', { name: 'Confident' }).click();
  await expect(row.getByRole('button', { name: 'Confident' })).toHaveClass(
    /on/
  );

  await page.reload();
  await expect(
    checkRow(page, RELOAD_TEST_ITEM_LABEL).getByRole('button', {
      name: 'Confident',
    })
  ).toHaveClass(/on/);

  await admin.from('mastery_attempts').delete().eq('topic_id', 'programming');
  await context.close();
});

test('supporter cannot write subtopic_status even calling the mutation directly (RLS, not just UI)', async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_SUPPORTER_EMAIL!,
    password: process.env.E2E_SUPPORTER_PASSWORD!,
  });
  expect(signInError).toBeNull();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Calling the exact same mutation the UI would, directly, as the
  // supporter role - RLS must reject this regardless of what the UI does.
  const { error } = await supabase.from('subtopic_status').upsert({
    subtopic_id: 'programming__0',
    status: 'confident',
    updated_by: user!.id,
  });

  expect(error).not.toBeNull();
  expect(error!.message).toMatch(/row-level security|policy/i);
});

test('a status change from one account appears live in the other, without reload', async ({
  browser,
}) => {
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

  await student.page.goto(TOPIC_PATH);
  await supporter.page.goto(TOPIC_PATH);

  const studentRow = checkRow(student.page, REALTIME_TEST_ITEM_LABEL);
  const supporterRow = checkRow(supporter.page, REALTIME_TEST_ITEM_LABEL);

  await studentRow.getByRole('button', { name: 'Learning' }).click();
  await expect(
    studentRow.getByRole('button', { name: 'Learning' })
  ).toHaveClass(/on/);

  // Supporter never touched anything - should see the student's change live.
  await expect(
    supporterRow.getByRole('button', { name: 'Learning' })
  ).toHaveClass(/on/, { timeout: 10000 });

  await student.context.close();
  await supporter.context.close();
});
