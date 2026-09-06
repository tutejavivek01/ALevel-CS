import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// A singleton, not a fresh client per call: every caller (queries,
// mutations, useCurrentProfile, useRealtimeTable) should share one
// client/socket. Separate instances each carry their own auth
// initialization and realtime connection, which can race - a realtime
// channel subscribed on a client whose session hasn't finished loading
// yet silently receives nothing, since Realtime can't evaluate RLS for
// an unauthenticated socket.
let client: SupabaseClient | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
