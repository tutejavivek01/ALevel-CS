import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test('dashboard shows live aggregate numbers that update without reload', async ({
  browser,
}) => {
  const studentCtx = await browser.newContext();
  const studentPage = await studentCtx.newPage();
  await studentPage.goto('/login');
  await studentPage.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await studentPage.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await studentPage.getByRole('button', { name: 'Sign in' }).click();
  await studentPage.waitForURL('/');

  const supporterCtx = await browser.newContext();
  const supporterPage = await supporterCtx.newPage();
  await supporterPage.goto('/login');
  await supporterPage.getByLabel('Email').fill(process.env.E2E_SUPPORTER_EMAIL!);
  await supporterPage.getByLabel('Password').fill(process.env.E2E_SUPPORTER_PASSWORD!);
  await supporterPage.getByRole('button', { name: 'Sign in' }).click();
  await supporterPage.waitForURL('/');

  // Supporter watches the dashboard the whole time - never reloads.
  await supporterPage.goto('/');
  const kpiConfidentBefore = await supporterPage
    .locator('.kpi', { hasText: 'Sub-topics marked confident' })
    .locator('.n')
    .innerText();

  // Student changes a status on a topic page.
  await studentPage.goto('/topic/algorithms');
  const row = studentPage.locator('.check-row', {
    hasText: 'Bubble sort & merge sort',
  });
  const wasConfident = await row
    .getByRole('button', { name: 'Confident' })
    .evaluate((el) => el.classList.contains('on'));
  // Toggle to a known state so the KPI is guaranteed to change either way.
  await row.getByRole('button', { name: wasConfident ? 'Learning' : 'Confident' }).click();
  await expect(
    row.getByRole('button', { name: wasConfident ? 'Learning' : 'Confident' })
  ).toHaveClass(/on/);

  // Supporter's dashboard (never navigated/reloaded) should update live.
  await expect(async () => {
    const after = await supporterPage
      .locator('.kpi', { hasText: 'Sub-topics marked confident' })
      .locator('.n')
      .innerText();
    expect(after).not.toBe(kpiConfidentBefore);
  }).toPass({ timeout: 10000 });

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
