'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useOptimisticMutation } from './use-optimistic-mutation';

export type SubtopicStatusValue =
  | 'not-started'
  | 'learning'
  | 'practising'
  | 'confident';

export type SubtopicStatusMap = Record<string, SubtopicStatusValue>;

// Exported so callers can invalidate it after a realtime event - see
// components/TopicChecklist.tsx's single combined useRealtimeTables call
// (lib/db/use-realtime-tables.ts) for why this isn't subscribed here.
export function subtopicStatusQueryKey(topicId: string) {
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

export function useSubtopicStatuses(topicId: string) {
  return useQuery({
    queryKey: subtopicStatusQueryKey(topicId),
    queryFn: () => fetchStatuses(topicId),
  });
}

export function useSetSubtopicStatus(topicId: string) {
  const queryKey = subtopicStatusQueryKey(topicId);

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

      // Same request, not a DB trigger (tasks.md task 9) - a real but
      // accepted gap: if this second write fails after the first
      // succeeds, the status change itself still stands, just without a
      // history row for it.
      const { error: historyError } = await supabase
        .from('subtopic_status_history')
        .insert({ subtopic_id: subtopicId, status, changed_by: user.id });
      if (historyError) throw historyError;
    },
    updater: (previous, variables) => {
      const map = (previous as SubtopicStatusMap | undefined) ?? {};
      return { ...map, [variables.subtopicId]: variables.status };
    },
  });
}
