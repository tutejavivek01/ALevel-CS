'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from './supabase-browser';

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('profiles').select('id, display_name');
      if (error) throw error;
      return data;
    },
  });
}
