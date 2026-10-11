'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useOptimisticMutation } from './use-optimistic-mutation';
import { useRealtimeTables } from './use-realtime-tables';
import { logActivity } from './log-activity';
import { getTopicById } from '@/lib/spec';

// Chapter-level completion: one sticky row per topic, written once the
// student passes the topic's test and marks it complete. Never revoked.

export type TopicCompletionMap = Record<string, string>;

export function allTopicCompletionQueryKey() {
  return ['all-topic-completion'] as const;
}

async function fetchAllTopicCompletion(): Promise<TopicCompletionMap> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('topic_completion')
    .select('topic_id, completed_at');
  if (error) throw error;

  const map: TopicCompletionMap = {};
  for (const row of data) map[row.topic_id] = row.completed_at;
  return map;
}

export function useAllTopicCompletion() {
  const queryClient = useQueryClient();
  const queryKey = allTopicCompletionQueryKey();

  const query = useQuery({ queryKey, queryFn: fetchAllTopicCompletion });

  useRealtimeTables(['topic_completion'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

// completed_at for one topic, or null/undefined while not complete.
export function useTopicCompletion(topicId: string) {
  const query = useAllTopicCompletion();
  return {
    ...query,
    completedAt: query.data?.[topicId] ?? null,
  };
}

export function useCompleteTopic(topicId: string) {
  return useOptimisticMutation<void, void>({
    queryKey: allTopicCompletionQueryKey(),
    mutationFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      // ignoreDuplicates: completion is sticky, a repeat call must not
      // fail on the primary key nor overwrite the original date.
      const { error } = await supabase
        .from('topic_completion')
        .upsert(
          { topic_id: topicId, completed_by: user.id },
          { onConflict: 'topic_id', ignoreDuplicates: true }
        );
      if (error) throw error;

      const topic = getTopicById(topicId);
      await logActivity({
        eventType: 'topic_completed',
        summary: `completed ${topic ? `${topic.ref} ${topic.title}` : topicId}`,
        targetRef: topicId,
      });
    },
    updater: (previous) => {
      const map = (previous as TopicCompletionMap | undefined) ?? {};
      return { ...map, [topicId]: map[topicId] ?? new Date().toISOString() };
    },
  });
}
