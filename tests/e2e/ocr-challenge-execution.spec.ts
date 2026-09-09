import { config } from 'dotenv';
import path from 'node:path';
import { Client } from 'pg';
import { test, expect, type Browser } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { OCR_CHALLENGES } from '../../lib/exercises/ocr-challenges';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

// ocr_challenge_submissions/ocr_challenge_review_state key off a fixed,
// shared, permanent challenge id with no student delete policy (design.md
// §6.8), so a test asserting a full not-started -> attempted ->
// submitted-for-review -> reviewed lifecycle can't rely on RLS-scoped
// clients to reset it between runs. Only this one test - which actually
// depends on starting from a clean slate, unlike the read-only "accumulate
// forever, just check the newest row" tests elsewhere in this suite -
// reaches past RLS via a direct Postgres connection, the same one
// scripts/migrate.mjs uses.
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
    await client.query('delete from ocr_challenge_submissions where challenge_id = $1', [
      challengeId,
    ]);
    await client.query('delete from ocr_challenge_reviews where challenge_id = $1', [
      challengeId,
    ]);
    await client.query('delete from ocr_challenge_review_state where challenge_id = $1', [
      challengeId,
    ]);
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

test('a testable challenge is graded against every test case and persists across a reload', async ({
  page,
}) => {
  const challenge = OCR_CHALLENGES.find((c) => c.id === 'ocr-palindromes')!;

  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await page.goto(`/python/ocr/${challenge.id}`);

  const editor = page.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(`s = input()\nprint(s == s[::-1])`);
  await page.getByRole('button', { name: 'Run' }).click();

  await expect(page.locator('.python-output.pass')).toBeVisible({ timeout: 45000 });
  await expect(page.locator('.python-output')).toContainText('Test 1: passed');
  await expect(page.locator('.python-output')).toContainText('Test 2: passed');

  // Not scoped to a single expected count - this challenge is real,
  // shared, fixed content (not a throwaway row this test can delete
  // afterward, since ocr_challenge_submissions has no delete policy),
  // so repeat runs of this test accumulate more history rows over time.
  // Only the newest one matters here (newest-first ordering).
  await page.reload();
  await expect(page.locator('.submission-row').first()).toHaveClass(/pass/);
  await expect(page.locator('.submission-row').first()).toContainText('2 / 2 test cases passed');
});

test('a non-testable challenge has no Run button and its submission goes straight into the review progression, live on the supporter session', async ({
  browser,
}) => {
  const challenge = OCR_CHALLENGES.find((c) => c.id === 'ocr-fireworks')!;
  expect(challenge.testCases).toBeUndefined();
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

  await student.page.goto(`/python/ocr/${challenge.id}`);
  await expect(student.page.getByRole('button', { name: 'Run' })).toHaveCount(0);
  await expect(
    student.page.locator('.status-badge[data-status="not-started"]')
  ).toBeVisible();

  // No test cases to run against, but the student can still write and
  // submit code - "Submit for review" needs at least one submission
  // first, so insert one directly (mirroring how a manual-review-only
  // submission would be created once task 36's upload/paste flow is
  // used, without needing a Run button here).
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await admin.auth.signInWithPassword({
    email: process.env.E2E_STUDENT_EMAIL!,
    password: process.env.E2E_STUDENT_PASSWORD!,
  });
  const {
    data: { user: studentUser },
  } = await admin.auth.getUser();
  await admin.from('ocr_challenge_submissions').insert({
    challenge_id: challenge.id,
    submitted_by: studentUser!.id,
    code: '# a manual-review submission, no automated grading',
    overall_result: 'pass',
    best_practice_findings: [],
  });

  await student.page.reload();
  await expect(
    student.page.locator('.status-badge[data-status="attempted"]')
  ).toBeVisible();

  await student.page.getByRole('button', { name: 'Submit for review' }).click();
  await expect(
    student.page.locator('.status-badge[data-status="submitted-for-review"]')
  ).toBeVisible();

  await supporter.page.goto(`/python/ocr/${challenge.id}`);
  await expect(
    supporter.page.locator('.status-badge[data-status="submitted-for-review"]')
  ).toBeVisible({ timeout: 10000 });

  await supporter.page.getByPlaceholder('Leave feedback…').fill('Nice effort!');
  await supporter.page.getByRole('button', { name: 'Add review' }).click();
  await expect(supporter.page.locator('.status-badge[data-status="reviewed"]')).toBeVisible();

  await expect(student.page.locator('.status-badge[data-status="reviewed"]')).toBeVisible({
    timeout: 10000,
  });

  await student.context.close();
  await supporter.context.close();
});

test("the OCR list's real status badge reflects a challenge's progress", async ({ page }) => {
  const challenge = OCR_CHALLENGES.find((c) => c.id === 'ocr-kaprekar')!;

  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  await page.goto(`/python/ocr/${challenge.id}`);
  const editor = page.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type(`n = int(input())\nprint(n == 45)`);
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.locator('.python-output')).toBeVisible({ timeout: 45000 });

  await page.goto('/python');
  await expect(
    page.locator('.python-row', { hasText: challenge.title }).locator('.status-badge')
  ).toHaveText('Attempted');
});
