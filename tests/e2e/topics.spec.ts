import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { TOPICS } from '../../lib/spec/topics';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
});

test('all 13 topics render their correct title and ref', async ({ page }) => {
  expect(TOPICS).toHaveLength(13);

  for (const topic of TOPICS) {
    await page.goto(`/topic/${topic.id}`);
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(
      topic.title
    );
    await expect(page.getByText(`§ ${topic.ref}`)).toBeVisible();
    // Not asserting an exact count here: the e2e accounts' subtopic
    // statuses are real, persisted DB rows other tests (task 8+) also
    // write to, so only the format/denominator is guaranteed stable.
    await expect(
      page.getByText(
        new RegExp(`Checklist — \\d+/${topic.items.length} confident`)
      )
    ).toBeVisible();
  }
});

test('an unknown topic id 404s', async ({ page }) => {
  const response = await page.goto('/topic/not-a-real-topic');
  expect(response?.status()).toBe(404);
});

test('a topic page shows spec detail, watch & revise, and keeps the status control', async ({
  page,
}) => {
  // requirements.md §11 - the enriched topic detail page.
  await page.goto('/topic/computation');

  // The topic title is still the page's only <h2> (the 13-topic loop
  // above relies on that).
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Theory of Computation'
  );

  // §11.1 - full spec detail, collapsed by default, expands on click.
  await expect(
    page.getByRole('heading', { name: 'Specification detail' })
  ).toBeVisible();
  const section = page.locator('.spec-section', { hasText: '4.4.2' });
  await expect(section.getByText('Finite State Machines')).toBeHidden();
  await section.locator('summary').click();
  await expect(section.getByText('Finite State Machines')).toBeVisible();

  // §11.2 - watch & revise, links only, never a specific-video URL.
  await expect(
    page.getByRole('heading', { name: 'Watch & revise' })
  ).toBeVisible();
  await expect(
    page.locator('.watch-revise a', { hasText: "Craig 'n' Dave" }).first()
  ).toHaveAttribute('href', 'https://www.craigndave.org/');
  await expect(page.locator('.watch-revise a[href*="watch?v="]')).toHaveCount(
    0
  );

  // §11.3 - the per-subtopic status control still works from this view.
  const segButton = page
    .locator('.seg button', { hasText: 'Confident' })
    .first();
  await expect(segButton).toBeEnabled();
});
