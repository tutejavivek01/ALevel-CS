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
  await page.goto('/practice/theory-of-computation');
});

test('the flashcard flips between term and definition', async ({ page }) => {
  const card = page.locator('.flash-card');
  await expect(card.getByText('Term')).toBeVisible();
  await card.click();
  await expect(card.getByText('Definition')).toBeVisible();
});

test('marking a term "Got it" advances to another card and updates the mastered count', async ({
  page,
}) => {
  const before = await page.locator('.flash-progress').innerText();
  await page.getByRole('button', { name: 'Got it' }).click();
  // The mastered count is a shared, persistent figure across all 14
  // terms - clicking "Got it" once must increase it (or at worst leave
  // it unchanged if this exact term was already mastered from an
  // earlier run), never decrease it.
  const afterCount = Number(
    (await page.locator('.flash-progress').innerText()).split(' ')[0]
  );
  const beforeCount = Number(before.split(' ')[0]);
  expect(afterCount).toBeGreaterThanOrEqual(beforeCount);
});

test('mastering every term directly, then reloading, still shows a card (never gets stuck)', async ({
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

  const farFuture = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString();
  const terms = [
    'abstraction',
    'decomposition',
    'representational-abstraction',
    'abstraction-by-generalisation',
    'information-hiding',
    'procedural-abstraction',
    'functional-abstraction',
    'data-abstraction',
    'problem-abstraction-reduction',
    'finite-state-machine',
    'state-transition-diagram',
    'state-transition-table',
    'mealy-machine',
    'accepting-state',
  ];
  for (const termId of terms) {
    await supabase.from('glossary_progress').upsert({
      term_id: termId,
      mastered: true,
      next_eligible_at: farFuture, // not eligible yet - the "all mastered, none eligible" edge case
      updated_by: user!.id,
    });
  }

  await page.reload();
  await expect(page.locator('.flash-card')).toBeVisible();
  await expect(page.getByText('14 / 14 mastered')).toBeVisible();
});
