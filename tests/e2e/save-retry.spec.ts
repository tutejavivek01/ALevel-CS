import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

// design.md §8 / principles.md §1: a failed write must revert its
// optimistic change and surface an inline "Couldn't save - retry"
// control, never just silently disappear. Simulated with route
// interception (design.md §8's own suggested approach) rather than
// touching real RLS policies mid-test, which would risk leaving shared
// state broken for other tests running in parallel against the same
// project.
test('a failed save reverts the optimistic change and shows a working retry control', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');

  await page.goto('/topic/algorithms');
  const row = page.locator('.check-row', { hasText: 'Bubble sort & merge sort' });

  // Fail exactly the next write, then let every subsequent request
  // through normally (including the retry).
  let hasFailed = false;
  await page.route('**/rest/v1/subtopic_status*', async (route) => {
    if (!hasFailed && route.request().method() === 'POST') {
      hasFailed = true;
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'simulated failure' }),
      });
    } else {
      await route.continue();
    }
  });

  await row.getByRole('button', { name: 'Practising' }).click();

  // Reverted, not left showing a lie: the optimistic "on" state doesn't
  // stick around once the write is known to have failed.
  await expect(page.getByText(/Couldn't save/)).toBeVisible();
  await expect(row.getByRole('button', { name: 'Practising' })).not.toHaveClass(/on/);

  await page.getByRole('button', { name: 'retry' }).click();

  await expect(row.getByRole('button', { name: 'Practising' })).toHaveClass(/on/);
  await expect(page.getByText(/Couldn't save/)).toHaveCount(0);
});
