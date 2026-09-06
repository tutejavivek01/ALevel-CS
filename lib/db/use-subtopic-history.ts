'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from './supabase-browser';

export type LastTouchedMap = Record<string, string>; // subtopic_id -> ISO timestamp

// See components/TopicChecklist.tsx's single combined useRealtimeTables
// call for why this isn't subscribed here (lib/db/use-realtime-tables.ts).
export function lastTouchedQueryKey(topicId: string) {
  return ['subtopic-history', topicId] as const;
}

async function fetchLastTouched(topicId: string): Promise<LastTouchedMap> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subtopic_status_history')
    .select('subtopic_id, changed_at')
    .like('subtopic_id', `${topicId}__%`)
    .order('changed_at', { ascending: false });
  if (error) throw error;

  // Descending order means the first row seen per subtopic is its latest.
  const map: LastTouchedMap = {};
  for (const row of data) {
    if (!(row.subtopic_id in map)) {
      map[row.subtopic_id] = row.changed_at;
    }
  }
  return map;
}

export function useLastTouched(topicId: string) {
  return useQuery({
    queryKey: lastTouchedQueryKey(topicId),
    queryFn: () => fetchLastTouched(topicId),
  });
}
