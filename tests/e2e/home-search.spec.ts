import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
});

test('searching a keyword lists topics with a summary and links to the reading page', async ({
  page,
}) => {
  await page.getByLabel('Search topics').fill('recursion');
  await page.getByRole('button', { name: 'Search', exact: true }).click();

  const results = page.locator('.home-search-result');
  await expect(results.first()).toBeVisible();
  await expect(results.first().locator('.home-search-title')).not.toBeEmpty();
  await expect(results.first().locator('.home-search-summary')).not.toBeEmpty();

  const chapter = results.filter({ hasText: 'Reading' }).first();
  await chapter.click();
  await expect(page).toHaveURL(/\/topic\/[a-z-]+\/reading#ch/);
});

test('a query with no matches says so', async ({ page }) => {
  await page.getByLabel('Search topics').fill('zzzqqqxxx');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByText(/No topics found/)).toBeVisible();
});

test('the search API does not serve results to signed-out requests', async ({
  request,
}) => {
  // The session proxy redirects signed-out requests to /login (and the
  // route itself returns 401 as a backstop) - either way, no results.
  const res = await request.get('/api/search?q=recursion');
  expect(res.url()).toMatch(/\/login|\/api\/search/);
  const body = await res.text();
  expect(body).not.toContain('"results"');
});
