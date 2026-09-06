'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useOptimisticMutation } from './use-optimistic-mutation';
import { logActivity } from './log-activity';
import { getSubtopicLabel } from '@/lib/spec';

export type SubtopicFlag = {
  id: number;
  subtopic_id: string;
  body: string;
  created_by: string;
  created_at: string;
};

export type SubtopicFlagsMap = Record<string, SubtopicFlag[]>;

// See components/TopicChecklist.tsx's single combined useRealtimeTables
// call for why this isn't subscribed here (lib/db/use-realtime-tables.ts).
export function subtopicFlagsQueryKey(topicId: string) {
  return ['subtopic-flags', topicId] as const;
}

async function fetchFlags(topicId: string): Promise<SubtopicFlagsMap> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subtopic_flags')
    .select('*')
    .like('subtopic_id', `${topicId}__%`)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const map: SubtopicFlagsMap = {};
  for (const row of data as SubtopicFlag[]) {
    (map[row.subtopic_id] ??= []).push(row);
  }
  return map;
}

export function useSubtopicFlags(topicId: string) {
  return useQuery({
    queryKey: subtopicFlagsQueryKey(topicId),
    queryFn: () => fetchFlags(topicId),
  });
}

export function useAddSubtopicFlag(topicId: string) {
  const queryKey = subtopicFlagsQueryKey(topicId);

  return useOptimisticMutation<{ subtopicId: string; body: string }, void>({
    queryKey,
    mutationFn: async ({ subtopicId, body }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase
        .from('subtopic_flags')
        .insert({ subtopic_id: subtopicId, body, created_by: user.id });
      if (error) throw error;

      const label = getSubtopicLabel(subtopicId) ?? subtopicId;
      await logActivity({
        eventType: 'subtopic_flagged',
        summary: `flagged "${label}"`,
        targetRef: subtopicId,
      });
    },
    updater: (previous, variables) => {
      const map = (previous as SubtopicFlagsMap | undefined) ?? {};
      const optimisticFlag: SubtopicFlag = {
        id: -Date.now(),
        subtopic_id: variables.subtopicId,
        body: variables.body,
        created_by: 'optimistic',
        created_at: new Date().toISOString(),
      };
      return {
        ...map,
        [variables.subtopicId]: [
          ...(map[variables.subtopicId] ?? []),
          optimisticFlag,
        ],
      };
    },
  });
}
