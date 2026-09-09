import { config } from 'dotenv';
import path from 'node:path';
import { Client } from 'pg';
import { test, expect, type Browser } from '@playwright/test';
import { OCR_CHALLENGES } from '../../lib/exercises/ocr-challenges';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

// Mirrors ocr-challenge-execution.spec.ts's resetOcrChallengeState - a
// version/comment lifecycle test needs a clean slate the same way that
// file's review-lifecycle test does, for the same reason: these tables
// have no student/supporter delete policy, so state from a prior run
// would otherwise persist and break repeatability.
async function resetOcrChallengeState(challengeId: string) {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(
      'delete from ocr_challenge_version_comments where version_id in (select id from ocr_challenge_code_versions where challenge_id = $1)',
      [challengeId]
    );
    await client.query('delete from ocr_challenge_code_versions where challenge_id = $1', [
      challengeId,
    ]);
    await client.query(
      'delete from ocr_challenge_submission_results where submission_id in (select id from ocr_challenge_submissions where challenge_id = $1)',
      [challengeId]
    );
    await client.query('delete from ocr_challenge_submissions where challenge_id = $1', [
      challengeId,
    ]);
    await client.query('delete from ocr_challenge_reviews where challenge_id = $1', [challengeId]);
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

test('Save works on a manual-review-only challenge with no Run, reaches attempted, and a supporter comment on the version appears live without touching the challenge-level review thread', async ({
  browser,
}) => {
  const challenge = OCR_CHALLENGES.find((c) => c.id === 'ocr-mandelbrot-set')!;
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
  await expect(student.page.getByRole('button', { name: 'Save' })).toBeVisible();
  await expect(
    student.page.locator('.status-badge[data-status="not-started"]')
  ).toBeVisible();

  const editor = student.page.locator('.cm-content');
  await editor.click();
  await editor.press('Control+A');
  await student.page.keyboard.type('draw_mandelbrot()');
  await student.page.getByRole('button', { name: 'Save' }).click();

  await expect(student.page.locator('.version-row')).toContainText('draw_mandelbrot()');
  await expect(
    student.page.locator('.status-badge[data-status="attempted"]')
  ).toBeVisible();

  await supporter.page.goto(`/python/ocr/${challenge.id}`);
  await expect(supporter.page.locator('.version-row')).toContainText('draw_mandelbrot()');
  await expect(
    supporter.page.locator('.status-badge[data-status="attempted"]')
  ).toBeVisible();

  await supporter.page
    .locator('.version-row')
    .getByPlaceholder('Comment on this version…')
    .fill('Good start - now try the extension.');
  await supporter.page.getByRole('button', { name: 'Add comment' }).click();

  await expect(student.page.locator('.version-row')).toContainText(
    'Good start - now try the extension.',
    { timeout: 10000 }
  );
  // A version comment is additive, not the challenge-level review thread
  // (design.md §6.10) - it must not flip the derived status to reviewed.
  await expect(
    student.page.locator('.status-badge[data-status="attempted"]')
  ).toBeVisible();
  await expect(student.page.locator('.empty-note', { hasText: 'No reviews yet.' })).toBeVisible();

  await student.context.close();
  await supporter.context.close();
});

test('Save also works on a testable challenge, independently of Run', async ({ page }) => {
  const challenge = OCR_CHALLENGES.find((c) => c.id === 'ocr-palindromes')!;
  expect(challenge.testCases?.length).toBeGreaterThan(0);

  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await page.goto(`/python/ocr/${challenge.id}`);

  // A single-line, bracket-free syntax error - avoids CodeMirror's
  // bracket auto-close silently turning an intentionally-unclosed
  // paren into valid code (it "helpfully" inserts the matching ")"),
  // and avoids the separate indent/dedent auto-indent issue documented
  // in python-best-practice.spec.ts by never indenting at all.
  const editor = page.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('x = = 5');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.locator('.version-row').first()).toContainText('x = = 5');
  await expect(page.locator('.version-row').first()).toContainText('SyntaxError');
});
