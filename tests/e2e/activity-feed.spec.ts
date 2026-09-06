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

test('a supporter flag produces a correctly-worded, live, attributed activity entry', async ({
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

  // Student watches the dashboard the whole time - never reloads.
  await student.page.goto('/');

  await supporter.page.goto('/topic/big-data');
  const row = supporter.page.locator('.check-row', {
    hasText: 'Volume, velocity & variety',
  });
  const uniqueNote = `check this one again ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await row.locator('..').getByPlaceholder('Leave a note…').fill(uniqueNote);
  await row.locator('..').getByRole('button', { name: 'Flag' }).click();

  // The flag write and its activity-log write are two sequential network
  // calls in the same mutationFn - wait for the flag note itself to
  // settle (a real signal, not a guess) before treating the slower
  // second write as done and tearing down the context. Closing a
  // context (or a full page.goto()) can abort a still in-flight fetch,
  // unlike real in-app <Link> navigation, which keeps the same JS
  // context and lets pending requests finish.
  await expect(supporter.page.getByText(uniqueNote)).toBeVisible();
  await supporter.page.waitForLoadState('networkidle');

  // .first(): the feed is newest-first, and repeated test runs against
  // the same fixed subtopic label produce identically-worded entries -
  // .first() is what's actually just been created, not an older one.
  const entry = student.page
    .locator('p', { hasText: 'flagged "Volume, velocity & variety"' })
    .first();
  await expect(entry).toBeVisible({ timeout: 10000 });
  await expect(entry).toContainText('E2E supporter');

  await student.context.close();
  await supporter.context.close();
});

test('a resource link addition produces a correctly-worded activity entry', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  await page.goto('/topic/networking');
  const uniqueLabel = `Activity test ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await page.getByPlaceholder('Label').fill(uniqueLabel);
  await page.getByPlaceholder('https://…').fill('https://example.com/activity-test');
  await page.getByRole('button', { name: 'Add link' }).click();
  await expect(page.getByText(uniqueLabel)).toBeVisible();
  await page.waitForLoadState('networkidle');

  // Client-side nav (a real <Link>), not page.goto(): a full browser
  // navigation tears down the JS context and can abort the still
  // in-flight activity-log write, which a real user's in-app navigation
  // never would (see the comment in the flag test above).
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(
    page.getByText(`added a link "${uniqueLabel}" to Communication & Networking`)
  ).toBeVisible({ timeout: 10000 });
});
