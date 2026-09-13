import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

// specs/reading-material/design.md §2, requirements.md §2.2 - this route
// is the only gate on these files (the site middleware excludes image
// extensions from auth-gating entirely), so it needs direct coverage, not
// just a "the page loads" smoke test.

const REAL_FIGURE = 'ch01-p13-01.png';

test('an unauthenticated request is rejected, not served', async ({
  browser,
}) => {
  const context = await browser.newContext();
  const response = await context.request.get(
    `/api/reading-material/figures/${REAL_FIGURE}`
  );
  expect(response.status()).toBe(401);
  await context.close();
});

test('a path-traversal-shaped filename is rejected, not served', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  const response = await page.request.get(
    '/api/reading-material/figures/..%2F..%2F..%2Fpackage.json'
  );
  expect([400, 404]).toContain(response.status());
});

test('an unknown filename 404s for an authenticated request', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  const response = await page.request.get(
    '/api/reading-material/figures/not-a-real-file.png'
  );
  expect(response.status()).toBe(404);
});

test('a real figure is served with the right content type for an authenticated request', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  const response = await page.request.get(
    `/api/reading-material/figures/${REAL_FIGURE}`
  );
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('image/png');
  const body = await response.body();
  expect(body.length).toBeGreaterThan(0);
});
