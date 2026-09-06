'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/db/supabase-browser';
import { useCurrentProfile } from '@/lib/db/use-current-profile';

export function AccountBadge() {
  const router = useRouter();
  const { profile, loading } = useCurrentProfile();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  if (loading) return null;
  if (!profile) return null;

  return (
    <p>
      Signed in as {profile.display_name} ({profile.role}){' '}
      <button onClick={handleSignOut}>Sign out</button>
    </p>
  );
}
