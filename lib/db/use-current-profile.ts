'use client';

import { useEffect, useState } from 'react';
import { createClient } from './supabase-browser';

export type Profile = {
  id: string;
  role: 'student' | 'supporter';
  display_name: string;
};

export function useCurrentProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (active) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, role, display_name')
        .eq('id', user.id)
        .single();

      if (active) {
        setProfile(data);
        setLoading(false);
      }
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { profile, loading };
}
