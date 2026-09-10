import { config } from 'dotenv';
import path from 'node:path';
import { Client } from 'pg';
import { test, expect, type Browser } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { OCR_CHALLENGES } from '../../lib/exercises/ocr-challenges';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

// ocr_challenge_review_state has no DELETE policy for either role (by
// design - see design.md §6.8's original reasoning), so a
// supabase-js-scoped delete silently no-ops and leaves a prior run's
// due_date/submitted_for_review_at/reviews in place, corrupting this
// test's "not yet reviewed" assumption on the next run. Mirrors
// ocr-challenge-execution.spec.ts's resetOcrChallengeState - the direct
// Postgres connection scripts/migrate.mjs also uses.
async function resetOcrChallengeState(challengeId: string) {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(
      'delete from ocr_challenge_submission_results where submission_id in (select id from ocr_challenge_submissions where challenge_id = $1)',
      [challengeId]
    );
    await client.query(
      'delete from ocr_challenge_submissions where challenge_id = $1',
      [challengeId]
    );
    await client.query(
      'delete from ocr_challenge_reviews where challenge_id = $1',
      [challengeId]
    );
    await client.query(
      'delete from ocr_challenge_review_state where challenge_id = $1',
      [challengeId]
    );
  } finally {
    await client.end();
  }
}

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

test('either account can set a due date, live on the other session, and an overdue one is flagged distinctly while a reviewed one is not', async ({
  browser,
}) => {
  const challenge = OCR_CHALLENGES.find((c) => c.id === 'ocr-happy-hopper')!;
  await resetOcrChallengeState(challenge.id);

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await admin.auth.signInWithPassword({
    email: process.env.E2E_SUPPORTER_EMAIL!,
    password: process.env.E2E_SUPPORTER_PASSWORD!,
  });

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

  // Supporter sets a future due date - jointly editable, not a one-way
  // "parent assigns" relationship (design.md §6.11).
  await supporter.page.goto(`/python/ocr/${challenge.id}`);
  await supporter.page.locator('input[type="date"]').fill('2099-06-01');
  await supporter.page.locator('input[type="date"]').blur();

  await student.page.goto(`/python/ocr/${challenge.id}`);
  await expect(student.page.locator('input[type="date"]')).toHaveValue(
    '2099-06-01',
    {
      timeout: 10000,
    }
  );
  await expect(student.page.getByText('Overdue', { exact: true })).toHaveCount(
    0
  );

  // Student changes it to a past date - still jointly editable either
  // direction - and it's flagged overdue since the challenge isn't
  // reviewed yet.
  await student.page.locator('input[type="date"]').fill('2020-01-01');
  await student.page.locator('input[type="date"]').blur();
  await expect(
    student.page.getByText('Overdue', { exact: true })
  ).toBeVisible();

  await expect(
    supporter.page.getByText('Overdue', { exact: true })
  ).toBeVisible({
    timeout: 10000,
  });

  // Get it reviewed - the overdue flag must clear even though the date
  // itself is still in the past (design.md §6.11's "not yet reviewed"
  // condition).
  const studentAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await studentAdmin.auth.signInWithPassword({
    email: process.env.E2E_STUDENT_EMAIL!,
    password: process.env.E2E_STUDENT_PASSWORD!,
  });
  const {
    data: { user: studentUser },
  } = await studentAdmin.auth.getUser();
  await studentAdmin.from('ocr_challenge_submissions').insert({
    challenge_id: challenge.id,
    submitted_by: studentUser!.id,
    code: '# reviewed via direct insert to reach the reviewed state quickly',
    overall_result: 'pass',
    best_practice_findings: [],
  });
  // Backdate this a minute: deriveReviewStatus compares it with the
  // review row's server-generated created_at with a strict `>`, so a
  // client clock even slightly ahead of the database's would otherwise
  // leave the status stuck at submitted-for-review and flake this test.
  await studentAdmin
    .from('ocr_challenge_review_state')
    .update({
      submitted_for_review_at: new Date(Date.now() - 60_000).toISOString(),
    })
    .eq('challenge_id', challenge.id);
  const {
    data: { user: supporterUser },
  } = await admin.auth.getUser();
  await admin.from('ocr_challenge_reviews').insert({
    challenge_id: challenge.id,
    body: 'Looks good!',
    created_by: supporterUser!.id,
  });

  await student.page.reload();
  await expect(
    student.page.locator('.status-badge[data-status="reviewed"]')
  ).toBeVisible({
    timeout: 10000,
  });
  await expect(student.page.getByText('Overdue', { exact: true })).toHaveCount(
    0
  );

  await student.context.close();
  await supporter.context.close();
});

test('a due date set from a /python list row persists, propagates, and shows on the detail page', async ({
  browser,
}) => {
  // requirements.md §8.13 / design.md §6.11 - the due date is now
  // jointly editable straight from the list row, not only the detail
  // page. Uses a different challenge from the test above so the two stay
  // independent under retries. ocr-sudoku is manual-review-only (no test
  // cases), which also proves the picker works on a row with no Run.
  const challenge = OCR_CHALLENGES.find((c) => c.id === 'ocr-sudoku')!;
  await resetOcrChallengeState(challenge.id);

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

  await student.page.goto('/python');
  // The list mounts 80 rows; wait for its queries to settle so every
  // row's onChange handler is hydrated before we type into one.
  await student.page.waitForLoadState('networkidle');
  const row = student.page.locator('.python-row', {
    hasText: `${challenge.number}. ${challenge.title}`,
  });
  await row.locator('input[type="date"]').fill('2099-06-01');
  await row.locator('input[type="date"]').blur();

  // The row's own picker and its caption reflect it without waiting on
  // the Realtime round trip (useOptimisticMutation's mirrors option).
  await expect(row.locator('input[type="date"]')).toHaveValue('2099-06-01');
  await expect(row.getByText('Due: 2099-06-01')).toBeVisible();

  // Persists across a reload.
  await student.page.reload();
  await expect(
    student.page
      .locator('.python-row', {
        hasText: `${challenge.number}. ${challenge.title}`,
      })
      .locator('input[type="date"]')
  ).toHaveValue('2099-06-01', { timeout: 10000 });

  // Propagates to the other session's list.
  await supporter.page.goto('/python');
  await expect(
    supporter.page
      .locator('.python-row', {
        hasText: `${challenge.number}. ${challenge.title}`,
      })
      .locator('input[type="date"]')
  ).toHaveValue('2099-06-01', { timeout: 10000 });

  // And the detail page shows the same value.
  await student.page.goto(`/python/ocr/${challenge.id}`);
  await expect(student.page.locator('input[type="date"]')).toHaveValue(
    '2099-06-01'
  );

  await student.context.close();
  await supporter.context.close();
});
