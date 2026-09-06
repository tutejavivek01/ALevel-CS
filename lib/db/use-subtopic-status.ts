'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useOptimisticMutation } from './use-optimistic-mutation';
import { useRealtimeTable } from './use-realtime-table';

export type SubtopicStatusValue =
  | 'not-started'
  | 'learning'
  | 'practising'
  | 'confident';

export type SubtopicStatusMap = Record<string, SubtopicStatusValue>;

function queryKeyFor(topicId: string) {
  return ['subtopic-status', topicId] as const;
}

async function fetchStatuses(topicId: string): Promise<SubtopicStatusMap> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subtopic_status')
    .select('subtopic_id, status')
    .like('subtopic_id', `${topicId}__%`);
  if (error) throw error;

  const map: SubtopicStatusMap = {};
  for (const row of data) {
    map[row.subtopic_id] = row.status as SubtopicStatusValue;
  }
  return map;
}

// Reads are scoped per topic (only the rows that topic's page needs), but
// the Realtime subscription is on the whole table - postgres_changes
// doesn't support a LIKE filter, only exact-match column filters, and
// there's no shared "topic_id" column to filter on since subtopic_id is a
// single derived string. Invalidating on every change is cheap enough at
// this scale (a few hundred rows, two accounts) not to be worth a
// different data-modelling choice just to enable a filtered subscription.
export function useSubtopicStatuses(topicId: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeyFor(topicId);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchStatuses(topicId),
  });

  useRealtimeTable('subtopic_status', () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

export function useSetSubtopicStatus(topicId: string) {
  const queryKey = queryKeyFor(topicId);

  return useOptimisticMutation<
    { subtopicId: string; status: SubtopicStatusValue },
    void
  >({
    queryKey,
    mutationFn: async ({ subtopicId, status }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase
        .from('subtopic_status')
        .upsert({ subtopic_id: subtopicId, status, updated_by: user.id });
      if (error) throw error;
    },
    updater: (previous, variables) => {
      const map = (previous as SubtopicStatusMap | undefined) ?? {};
      return { ...map, [variables.subtopicId]: variables.status };
    },
  });
}
