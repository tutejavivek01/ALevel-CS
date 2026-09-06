'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useOptimisticMutation } from './use-optimistic-mutation';
import { useRealtimeTables } from './use-realtime-tables';
import { logActivity } from './log-activity';
import { getTopicById } from '@/lib/spec';

export type ResourceLink = {
  id: number;
  topic_id: string;
  url: string;
  label: string;
  created_by: string;
  created_at: string;
};

export function resourceLinksQueryKey(topicId: string) {
  return ['resource-links', topicId] as const;
}

async function fetchResourceLinks(topicId: string): Promise<ResourceLink[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('resource_links')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export function useResourceLinks(topicId: string) {
  const queryClient = useQueryClient();
  const queryKey = resourceLinksQueryKey(topicId);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchResourceLinks(topicId),
  });

  useRealtimeTables(['resource_links'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

export function useAddResourceLink(topicId: string) {
  const queryKey = resourceLinksQueryKey(topicId);

  return useOptimisticMutation<{ url: string; label: string }, void>({
    queryKey,
    mutationFn: async ({ url, label }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase
        .from('resource_links')
        .insert({ topic_id: topicId, url, label, created_by: user.id });
      if (error) throw error;

      const topicTitle = getTopicById(topicId)?.title ?? topicId;
      await logActivity({
        eventType: 'resource_link_added',
        summary: `added a link "${label}" to ${topicTitle}`,
        targetRef: topicId,
      });
    },
    updater: (previous, variables) => {
      const links = (previous as ResourceLink[] | undefined) ?? [];
      const optimisticLink: ResourceLink = {
        id: -Date.now(),
        topic_id: topicId,
        url: variables.url,
        label: variables.label,
        created_by: 'optimistic',
        created_at: new Date().toISOString(),
      };
      return [...links, optimisticLink];
    },
  });
}

export function useDeleteResourceLink(topicId: string) {
  const queryKey = resourceLinksQueryKey(topicId);

  return useOptimisticMutation<{ id: number }, void>({
    queryKey,
    mutationFn: async ({ id }) => {
      const supabase = createClient();
      const { error } = await supabase.from('resource_links').delete().eq('id', id);
      if (error) throw error;
    },
    updater: (previous, variables) => {
      const links = (previous as ResourceLink[] | undefined) ?? [];
      return links.filter((link) => link.id !== variables.id);
    },
  });
}
