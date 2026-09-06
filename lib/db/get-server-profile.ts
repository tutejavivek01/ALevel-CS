import { createClient } from './supabase-server';
import type { Profile } from './use-current-profile';

// Server-side equivalent of useCurrentProfile(), for the one route that
// needs to gate rendering on role before anything reaches the client
// (design.md §5: "/python/new... checks role server-side... not just
// hiding the link in the nav").
export async function getServerProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, role, display_name')
    .eq('id', user.id)
    .single();

  return data;
}
