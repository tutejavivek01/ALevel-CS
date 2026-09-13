import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Scoped per test (by topic_ref), never a blanket cleanup shared across
// every test in this file - Playwright can run different tests from one
// file across parallel workers, so a shared before/afterEach covering
// every ref this file touches could delete a *different*, concurrently-
// running test's just-written row for a topic_ref it doesn't itself use.
async function cleanupTopic(topicRef: string, chapterIds: string[] = []) {
  const admin = adminClient();
  await admin.from('topic_read_state').delete().eq('topic_ref', topicRef);
  if (chapterIds.length > 0) {
    await admin
      .from('chapter_read_state')
      .delete()
      .in('chapter_id', chapterIds);
  }
}

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
}

test('marking an area read persists across reload and shows on the Dashboard without opening the reading page', async ({
  page,
}) => {
  await cleanupTopic('4.10');
  await login(page);
  // Uses a different topic than the big-data/4.11 tests below (its own
  // describe.serial block) so this one is free to run in parallel with
  // them without racing the same topic_read_state row.
  await page.goto('/topic/databases/reading');

  await page.getByRole('button', { name: 'Mark as read' }).click();
  const markedButton = page.getByRole('button', { name: '✓ Marked as read' });
  await expect(markedButton).toBeVisible();
  // The optimistic UI update above is instant, but the real network
  // write is still in flight at that point - reloading immediately would
  // race it and could interrupt it before it's actually durable. Wait for
  // the button to re-enable (MarkAsReadToggle disables it while its
  // mutation is pending) as a real signal the write attempt has settled,
  // not a guess at timing.
  await expect(markedButton).toBeEnabled();

  await page.reload();
  await expect(
    page.getByRole('button', { name: '✓ Marked as read' })
  ).toBeVisible();

  await page.goto('/');
  const tile = page.locator('.topic-tile', { hasText: '4.10' });
  await expect(tile.locator('.reading-read-dot')).toBeVisible();

  await cleanupTopic('4.10');
});

// Both tests below exercise big-data (4.11), the topic whose reading
// content is exactly one chapter - serialised relative to each other so
// they never race the same topic_read_state/chapter_read_state rows.
test.describe.serial('big-data chapter-tick aggregation', () => {
  test.beforeEach(() => cleanupTopic('4.11', ['ch72-big-data']));
  test.afterEach(() => cleanupTopic('4.11', ['ch72-big-data']));

  test('ticking every chapter in a topic automatically marks the topic read', async ({
    page,
  }) => {
    await login(page);
    // big-data (4.11) has exactly one chapter - ticking it is trivially
    // "every chapter ticked".
    await page.goto('/topic/big-data/reading');
    // 4.11's only chapter is A Level (Year 13) content, hidden by the
    // shared level-filter preference until toggled on.
    await page.getByLabel('Include A Level (Year 13) chapters').check();
    await expect(
      page.getByRole('button', { name: 'Mark as read' })
    ).toBeVisible();

    await page.locator('#ch72-big-data').locator('> summary').click();
    await page
      .locator('#ch72-big-data')
      .getByLabel('Mark this chapter read')
      .check();

    await expect(
      page.getByRole('button', { name: '✓ Marked as read' })
    ).toBeVisible();
  });

  test("un-marking the area's read state does not clear any chapter's individual tick", async ({
    page,
  }) => {
    await login(page);
    await page.goto('/topic/big-data/reading');
    await page.getByLabel('Include A Level (Year 13) chapters').check();

    await page.locator('#ch72-big-data').locator('> summary').click();
    const tick = page
      .locator('#ch72-big-data')
      .getByLabel('Mark this chapter read');
    await tick.check();
    const markedButton = page.getByRole('button', { name: '✓ Marked as read' });
    await expect(markedButton).toBeVisible();
    // The chapter tick's own network write must resolve before the
    // aggregation rule's auto-mark mutation even fires (it runs from that
    // mutation's onSuccess) - so the button showing "marked" here is only
    // ever the *optimistic* update from that auto-mark. Wait for it to
    // re-enable (its mutation genuinely settling) before unmarking,
    // otherwise a manual unmark fired while the auto-mark's own network
    // write is still in flight can race it and lose - whichever request
    // completes last wins, regardless of click order.
    await expect(markedButton).toBeEnabled();

    // Un-mark the area directly.
    await markedButton.click();
    await expect(
      page.getByRole('button', { name: 'Mark as read' })
    ).toBeVisible();

    // The chapter tick set moments ago must still be checked.
    await expect(tick).toBeChecked();
  });
});

test('marking read has no effect on the confident mastery gate', async ({
  page,
}) => {
  // `algorithms` (4.3), not `programming` (4.1) - `reading-material-
  // rls.spec.ts` hardcodes topic_ref '4.1' throughout, and Playwright can
  // run tests from different files concurrently, so sharing that ref here
  // would risk the exact same cross-test race already fixed above.
  await cleanupTopic('4.3');
  // Reset ambient state this test depends on: no passing gate attempt,
  // and the checklist's first item not already confident from unrelated
  // earlier activity in this shared dev database.
  const admin = adminClient();
  await admin.from('mastery_attempts').delete().eq('topic_id', 'algorithms');
  await admin
    .from('subtopic_status')
    .update({ status: 'not-started' })
    .eq('subtopic_id', 'algorithms__0');

  await login(page);
  // `algorithms` (4.3) is on the programming-challenge gate route -
  // Confident is unavailable without passing it, regardless of read state.
  await page.goto('/topic/algorithms/reading');
  await page.getByRole('button', { name: 'Mark as read' }).click();
  await expect(
    page.getByRole('button', { name: '✓ Marked as read' })
  ).toBeVisible();

  await page.goto('/topic/algorithms');
  const row = page.locator('.check-row').first();
  await row.getByRole('button', { name: 'Confident' }).click();
  // Marking read must not have unlocked the gate - clicking Confident
  // opens the Test-knowledge modal instead of setting the status.
  await expect(
    page.getByRole('heading', { name: 'Test knowledge' })
  ).toBeVisible();
  await expect(row.getByRole('button', { name: 'Confident' })).not.toHaveClass(
    /on/
  );

  await cleanupTopic('4.3');
});
