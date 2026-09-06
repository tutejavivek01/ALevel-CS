import { config } from 'dotenv';
import path from 'node:path';
import { test, expect, type Browser } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

const TOPIC_PATH = '/topic/data-structures';
const HISTORY_ITEM_LABEL = 'Stacks — push, pop, peek';
const FLAG_ITEM_LABEL = 'Queues — linear, circular, priority';

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

function checkRow(page: import('@playwright/test').Page, label: string) {
  return page.locator('.check-row', { hasText: label });
}

test('a status change is attributed to the correct account in history', async ({
  browser,
}) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await supabase.auth.signInWithPassword({
    email: process.env.E2E_STUDENT_EMAIL!,
    password: process.env.E2E_STUDENT_PASSWORD!,
  });
  const {
    data: { user: studentUser },
  } = await supabase.auth.getUser();

  const { context, page } = await loginAs(
    browser,
    process.env.E2E_STUDENT_EMAIL!,
    process.env.E2E_STUDENT_PASSWORD!
  );
  await page.goto(TOPIC_PATH);

  const row = checkRow(page, HISTORY_ITEM_LABEL);
  await row.getByRole('button', { name: 'Practising' }).click();
  await expect(row.getByRole('button', { name: 'Practising' })).toHaveClass(/on/);

  // "Last touched" only renders once useLastTouched's query reflects the
  // history row - waiting for it here means the write below is settled,
  // not just optimistically applied in the UI.
  await expect(row.getByText(/Last touched/)).toBeVisible();

  const { data: history, error } = await supabase
    .from('subtopic_status_history')
    .select('status, changed_by')
    .eq('subtopic_id', 'data-structures__2')
    .order('changed_at', { ascending: false })
    .limit(1);

  expect(error).toBeNull();
  expect(history).toHaveLength(1);
  expect(history![0].status).toBe('practising');
  expect(history![0].changed_by).toBe(studentUser!.id);

  await context.close();
});

test('a supporter flag appears live on the student session, and the student cannot write one', async ({
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

  await student.page.goto(TOPIC_PATH);
  await supporter.page.goto(TOPIC_PATH);

  const studentRow = checkRow(student.page, FLAG_ITEM_LABEL);
  const supporterRow = checkRow(supporter.page, FLAG_ITEM_LABEL);

  // Student's UI has no way to write a flag at all - confirms the
  // control itself isn't offered, not just that a submit would fail.
  await expect(
    studentRow.locator('..').getByPlaceholder('Leave a note…')
  ).toHaveCount(0);

  const uniqueNote = `worth revisiting - ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await supporterRow
    .locator('..')
    .getByPlaceholder('Leave a note…')
    .fill(uniqueNote);
  await supporterRow.locator('..').getByRole('button', { name: 'Flag' }).click();

  // Student never touched anything - should see the supporter's note live.
  await expect(
    student.page.getByText(uniqueNote, { exact: false })
  ).toBeVisible({ timeout: 10000 });

  await student.context.close();
  await supporter.context.close();
});

test('a student account is rejected by RLS if it calls the flag mutation directly', async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await supabase.auth.signInWithPassword({
    email: process.env.E2E_STUDENT_EMAIL!,
    password: process.env.E2E_STUDENT_PASSWORD!,
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('subtopic_flags').insert({
    subtopic_id: 'data-structures__3',
    body: 'a student trying to flag their own subtopic',
    created_by: user!.id,
  });

  expect(error).not.toBeNull();
  expect(error!.message).toMatch(/row-level security|policy/i);
});
