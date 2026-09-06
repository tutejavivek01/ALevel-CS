import { config } from 'dotenv';
import path from 'node:path';
import { test, expect, type Browser } from '@playwright/test';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

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

function neaRow(page: import('@playwright/test').Page, name: string) {
  return page.locator('.nea-row', { hasText: name });
}

test('either account can set a section status and target date, live on the other session', async ({
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

  await student.page.goto('/nea');
  await supporter.page.goto('/nea');

  const studentRow = neaRow(student.page, 'Analysis');
  const supporterRow = neaRow(supporter.page, 'Analysis');

  await studentRow.locator('select').selectOption('in-progress');
  await expect(studentRow.locator('select')).toHaveValue('in-progress');
  await expect(supporterRow.locator('select')).toHaveValue('in-progress', {
    timeout: 10000,
  });

  await supporterRow.locator('input[type="date"]').fill('2026-12-01');
  await expect(studentRow.locator('input[type="date"]')).toHaveValue('2026-12-01', {
    timeout: 10000,
  });

  await student.context.close();
  await supporter.context.close();
});

test('notes are a running log - old notes are never overwritten, and appear live', async ({
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

  await student.page.goto('/nea');
  await supporter.page.goto('/nea');

  const studentRow = neaRow(student.page, 'Testing');
  const supporterRow = neaRow(supporter.page, 'Testing');

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const firstNote = `first note ${suffix}`;
  const secondNote = `second note ${suffix}`;

  await studentRow.getByPlaceholder('Add a note…').fill(firstNote);
  await studentRow.getByRole('button', { name: 'Add note' }).click();
  await expect(studentRow.getByText(firstNote)).toBeVisible();
  await expect(supporterRow.getByText(firstNote)).toBeVisible({ timeout: 10000 });

  await supporterRow.getByPlaceholder('Add a note…').fill(secondNote);
  await supporterRow.getByRole('button', { name: 'Add note' }).click();
  await expect(supporterRow.getByText(secondNote)).toBeVisible();

  // Both notes must still be visible - the second never replaces the first.
  await expect(studentRow.getByText(firstNote)).toBeVisible({ timeout: 10000 });
  await expect(studentRow.getByText(secondNote)).toBeVisible({ timeout: 10000 });

  await student.context.close();
  await supporter.context.close();
});
