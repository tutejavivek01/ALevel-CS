import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

// topic_completion RLS split: only the student role may write, and nobody
// can update or delete (completion is sticky) - checked by calling the
// table directly, not through the UI.
test('supporter cannot write topic_completion (RLS, not just UI)', async () => {
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

  const { error } = await supabase
    .from('topic_completion')
    .insert({ topic_id: 'data-structures', completed_by: user!.id });
  expect(error).not.toBeNull();
  expect(error!.message).toMatch(/row-level security|policy/i);
});
