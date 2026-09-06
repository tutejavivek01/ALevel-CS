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

test('the student account cannot reach /python/new even by direct navigation', async ({
  browser,
}) => {
  const student = await loginAs(
    browser,
    process.env.E2E_STUDENT_EMAIL!,
    process.env.E2E_STUDENT_PASSWORD!
  );

  const response = await student.page.goto('/python/new');
  expect(response?.status()).toBe(404);

  await student.context.close();
});

test('the supporter account can create a problem with test cases, and it appears in the list for both accounts', async ({
  browser,
}) => {
  const supporter = await loginAs(
    browser,
    process.env.E2E_SUPPORTER_EMAIL!,
    process.env.E2E_SUPPORTER_PASSWORD!
  );
  const student = await loginAs(
    browser,
    process.env.E2E_STUDENT_EMAIL!,
    process.env.E2E_STUDENT_PASSWORD!
  );

  const uniqueTitle = `Sum two numbers ${Date.now()}-${Math.random().toString(36).slice(2)}`;

  await supporter.page.goto('/python/new');
  await supporter.page.getByLabel('Title').fill(uniqueTitle);
  await supporter.page
    .getByLabel('Description')
    .fill('Read two integers and print their sum.');
  await supporter.page.getByPlaceholder('Input (stdin, optional)').fill('2\n3\n');
  await supporter.page.getByPlaceholder('Expected output').fill('5\n');
  await supporter.page.getByRole('button', { name: 'Create problem' }).click();

  await supporter.page.waitForURL('/python');
  await expect(supporter.page.getByText(uniqueTitle)).toBeVisible();

  await student.page.goto('/python');
  await expect(student.page.getByText(uniqueTitle)).toBeVisible({ timeout: 10000 });

  // The supporter-only "+ New problem" link is not offered to the student.
  await expect(student.page.getByRole('link', { name: '+ New problem' })).toHaveCount(0);

  await supporter.context.close();
  await student.context.close();
});
