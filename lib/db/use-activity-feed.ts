'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useRealtimeTables } from './use-realtime-tables';

export type ActivityEvent = {
  id: number;
  event_type: string;
  summary: string;
  target_ref: string | null;
  created_at: string;
  actorName: string;
};

export function activityFeedQueryKey() {
  return ['activity-feed'] as const;
}

async function fetchActivityFeed(): Promise<ActivityEvent[]> {
  const supabase = createClient();
  const [eventsRes, profilesRes] = await Promise.all([
    supabase
      .from('activity_events')
      .select('id, actor_id, event_type, summary, target_ref, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('profiles').select('id, display_name'),
  ]);
  if (eventsRes.error) throw eventsRes.error;
  if (profilesRes.error) throw profilesRes.error;

  const nameById = new Map(profilesRes.data.map((p) => [p.id, p.display_name]));

  return eventsRes.data.map((event) => ({
    id: event.id,
    event_type: event.event_type,
    summary: event.summary,
    target_ref: event.target_ref,
    created_at: event.created_at,
    actorName: nameById.get(event.actor_id) ?? 'Someone',
  }));
}

// Not a full audit log - just the latest ~20 events, newest first
// (requirements.md §6).
export function useActivityFeed() {
  const queryClient = useQueryClient();
  const queryKey = activityFeedQueryKey();

  const query = useQuery({
    queryKey,
    queryFn: fetchActivityFeed,
  });

  useRealtimeTables(['activity_events'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}
