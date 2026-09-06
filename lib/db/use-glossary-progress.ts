'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useOptimisticMutation } from './use-optimistic-mutation';
import { useRealtimeTables } from './use-realtime-tables';
import type { GlossaryProgressMap } from '@/lib/exercises/glossary-drill';

export function glossaryProgressQueryKey() {
  return ['glossary-progress'] as const;
}

async function fetchGlossaryProgress(): Promise<GlossaryProgressMap> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('glossary_progress')
    .select('term_id, mastered, next_eligible_at');
  if (error) throw error;

  const map: GlossaryProgressMap = {};
  for (const row of data) {
    map[row.term_id] = { mastered: row.mastered, nextEligibleAt: row.next_eligible_at };
  }
  return map;
}

export function useGlossaryProgress() {
  const queryClient = useQueryClient();
  const queryKey = glossaryProgressQueryKey();

  const query = useQuery({
    queryKey,
    queryFn: fetchGlossaryProgress,
  });

  useRealtimeTables(['glossary_progress'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

export function useSetGlossaryProgress() {
  const queryKey = glossaryProgressQueryKey();

  return useOptimisticMutation<
    { termId: string; mastered: boolean; nextEligibleAt: string | null },
    void
  >({
    queryKey,
    mutationFn: async ({ termId, mastered, nextEligibleAt }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase.from('glossary_progress').upsert({
        term_id: termId,
        mastered,
        next_eligible_at: nextEligibleAt,
        updated_by: user.id,
      });
      if (error) throw error;
    },
    updater: (previous, variables) => {
      const map = (previous as GlossaryProgressMap | undefined) ?? {};
      return {
        ...map,
        [variables.termId]: {
          mastered: variables.mastered,
          nextEligibleAt: variables.nextEligibleAt,
        },
      };
    },
  });
}
