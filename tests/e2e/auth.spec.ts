import { config } from 'dotenv';
import path from 'node:path';
import { test, expect, type Page } from '@playwright/test';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test('unauthenticated request to a protected route redirects to /login', async ({
  browser,
}) => {
  // Fresh context - no cookies from any previous test in this file.
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await context.close();
});

test('student account can log in and lands on the protected home page', async ({
  page,
}) => {
  await login(
    page,
    process.env.E2E_STUDENT_EMAIL!,
    process.env.E2E_STUDENT_PASSWORD!
  );
  await expect(page).toHaveURL('/');
  await expect(page.getByText(/Signed in as .* \(student\)/)).toBeVisible();
});

test('supporter account can log in and lands on the protected home page', async ({
  page,
}) => {
  await login(
    page,
    process.env.E2E_SUPPORTER_EMAIL!,
    process.env.E2E_SUPPORTER_PASSWORD!
  );
  await expect(page).toHaveURL('/');
  await expect(page.getByText(/Signed in as .* \(supporter\)/)).toBeVisible();
});

test('session persists across a simulated browser restart', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(
    page,
    process.env.E2E_STUDENT_EMAIL!,
    process.env.E2E_STUDENT_PASSWORD!
  );
  await expect(page).toHaveURL('/');

  // Simulate quitting and reopening the browser: carry the saved cookies
  // into a brand new context/page rather than reusing the live session.
  const storageState = await context.storageState();
  await context.close();

  const restarted = await browser.newContext({ storageState });
  const restartedPage = await restarted.newPage();
  await restartedPage.goto('/');
  await expect(restartedPage).toHaveURL('/');
  await expect(
    restartedPage.getByText(/Signed in as .* \(student\)/)
  ).toBeVisible();
  await restarted.close();
});
