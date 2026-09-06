import { config } from 'dotenv';
import path from 'node:path';
import { test, expect, type Browser } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

const TOPIC_PATH = '/topic/consequences';

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

test('either account can add a link and it appears live on the other session', async ({
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

  const uniqueLabel = `Test link ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await student.page.getByPlaceholder('Label').fill(uniqueLabel);
  await student.page.getByPlaceholder('https://…').fill('https://example.com/resource');
  await student.page.getByRole('button', { name: 'Add link' }).click();

  await expect(student.page.getByText(uniqueLabel)).toBeVisible();
  // Supporter never touched anything - should see it live.
  await expect(supporter.page.getByText(uniqueLabel)).toBeVisible({ timeout: 10000 });

  await student.context.close();
  await supporter.context.close();
});

test('RLS rejects deleting a link the account did not add, even called directly', async () => {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const supporterClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await supporterClient.auth.signInWithPassword({
    email: process.env.E2E_SUPPORTER_EMAIL!,
    password: process.env.E2E_SUPPORTER_PASSWORD!,
  });
  const {
    data: { user: supporterUser },
  } = await supporterClient.auth.getUser();

  // Seed a link owned by the supporter, via the service role (bypasses RLS).
  const { data: inserted, error: insertError } = await admin
    .from('resource_links')
    .insert({
      topic_id: 'consequences',
      url: 'https://example.com/rls-check',
      label: 'rls-check',
      created_by: supporterUser!.id,
    })
    .select()
    .single();
  expect(insertError).toBeNull();

  const studentClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await studentClient.auth.signInWithPassword({
    email: process.env.E2E_STUDENT_EMAIL!,
    password: process.env.E2E_STUDENT_PASSWORD!,
  });

  await studentClient.from('resource_links').delete().eq('id', inserted!.id);

  // RLS delete policies that don't match any row succeed silently with
  // zero rows affected rather than erroring - assert the row still exists.
  const { data: stillThere } = await admin
    .from('resource_links')
    .select('id')
    .eq('id', inserted!.id)
    .maybeSingle();
  expect(stillThere).not.toBeNull();

  await admin.from('resource_links').delete().eq('id', inserted!.id);
});

test('only the account that added a link can delete it', async ({ browser }) => {
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

  const uniqueLabel = `Delete-test ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await student.page.getByPlaceholder('Label').fill(uniqueLabel);
  await student.page.getByPlaceholder('https://…').fill('https://example.com/delete-test');
  await student.page.getByRole('button', { name: 'Add link' }).click();
  await expect(student.page.getByText(uniqueLabel)).toBeVisible();
  await expect(supporter.page.getByText(uniqueLabel)).toBeVisible({ timeout: 10000 });

  // Supporter did not add this link - no delete control offered to them.
  const supporterEntry = supporter.page.locator('.res-link', { hasText: uniqueLabel });
  await expect(supporterEntry.getByRole('button')).toHaveCount(0);

  // Student did add it - can delete it.
  const studentEntry = student.page.locator('.res-link', { hasText: uniqueLabel });
  await studentEntry.getByRole('button').click();
  await expect(student.page.getByText(uniqueLabel)).toHaveCount(0);

  await student.context.close();
  await supporter.context.close();
});
