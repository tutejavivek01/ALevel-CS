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
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(topic.title);
    await expect(page.getByText(`§ ${topic.ref}`)).toBeVisible();
    // Not asserting an exact count here: the e2e accounts' subtopic
    // statuses are real, persisted DB rows other tests (task 8+) also
    // write to, so only the format/denominator is guaranteed stable.
    await expect(
      page.getByText(new RegExp(`Checklist — \\d+/${topic.items.length} confident`))
    ).toBeVisible();
  }
});

test('an unknown topic id 404s', async ({ page }) => {
  const response = await page.goto('/topic/not-a-real-topic');
  expect(response?.status()).toBe(404);
});
