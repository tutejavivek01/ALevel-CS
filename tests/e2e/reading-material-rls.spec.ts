import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

// specs/reading-material/design.md §4.1, task 56 - confirms the RLS split
// on topic_read_state/chapter_read_state directly (calling the same
// mutation the eventual UI will, not through it - task 58/59 build the UI
// itself), before any UI exists to exercise it.

async function cleanup() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  await admin.from('topic_read_state').delete().eq('topic_ref', '4.1');
  await admin
    .from('chapter_read_state')
    .delete()
    .eq('chapter_id', 'ch01-programming-basics');
}

// All three tests below share the same topic_ref/chapter_id (by design -
// they're testing the RLS split on one set of rows), so they're
// serialised relative to each other: Playwright can run different tests
// from one file across parallel workers, and a shared before/afterEach
// on the same row would otherwise let one test's cleanup delete another,
// concurrently-running test's just-written data.
test.describe.serial('topic_read_state / chapter_read_state RLS', () => {
  test.beforeEach(cleanup);
  test.afterEach(cleanup);

  test('student can insert and update topic_read_state and chapter_read_state', async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: process.env.E2E_STUDENT_EMAIL!,
      password: process.env.E2E_STUDENT_PASSWORD!,
    });
    expect(signInError).toBeNull();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: topicInsertError } = await supabase
      .from('topic_read_state')
      .insert({
        topic_ref: '4.1',
        read_at: new Date().toISOString(),
        updated_by: user!.id,
      });
    expect(topicInsertError).toBeNull();

    const { error: topicUpdateError } = await supabase
      .from('topic_read_state')
      .update({ read_at: null, updated_by: user!.id })
      .eq('topic_ref', '4.1');
    expect(topicUpdateError).toBeNull();

    const { error: chapterInsertError } = await supabase
      .from('chapter_read_state')
      .insert({
        chapter_id: 'ch01-programming-basics',
        read_at: new Date().toISOString(),
        updated_by: user!.id,
      });
    expect(chapterInsertError).toBeNull();
  });

  test('supporter cannot write topic_read_state or chapter_read_state even calling the mutation directly (RLS, not just UI)', async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: process.env.E2E_SUPPORTER_EMAIL!,
      password: process.env.E2E_SUPPORTER_PASSWORD!,
    });
    expect(signInError).toBeNull();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: topicError } = await supabase
      .from('topic_read_state')
      .insert({
        topic_ref: '4.1',
        read_at: new Date().toISOString(),
        updated_by: user!.id,
      });
    expect(topicError).not.toBeNull();
    expect(topicError!.message).toMatch(/row-level security|policy/i);

    const { error: chapterError } = await supabase
      .from('chapter_read_state')
      .insert({
        chapter_id: 'ch01-programming-basics',
        read_at: new Date().toISOString(),
        updated_by: user!.id,
      });
    expect(chapterError).not.toBeNull();
    expect(chapterError!.message).toMatch(/row-level security|policy/i);
  });

  test('supporter can read both tables', async () => {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const studentAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await studentAuth.auth.signInWithPassword({
      email: process.env.E2E_STUDENT_EMAIL!,
      password: process.env.E2E_STUDENT_PASSWORD!,
    });
    const {
      data: { user: studentUser },
    } = await studentAuth.auth.getUser();
    await admin.from('topic_read_state').insert({
      topic_ref: '4.1',
      read_at: new Date().toISOString(),
      updated_by: studentUser!.id,
    });

    const supporterAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supporterAuth.auth.signInWithPassword({
      email: process.env.E2E_SUPPORTER_EMAIL!,
      password: process.env.E2E_SUPPORTER_PASSWORD!,
    });
    const { data, error } = await supporterAuth
      .from('topic_read_state')
      .select('*')
      .eq('topic_ref', '4.1')
      .maybeSingle();
    expect(error).toBeNull();
    expect(data).not.toBeNull();
  });
});
