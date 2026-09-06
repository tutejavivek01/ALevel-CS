'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useRealtimeTables } from './use-realtime-tables';
import type { SubtopicStatusMap, SubtopicStatusValue } from './use-subtopic-status';

// Unlike useSubtopicStatuses (scoped to one topic's rows), this fetches
// every subtopic_status row - needed for the header ring and dashboard
// KPIs, which aggregate across all 13 topics at once.
export function allSubtopicStatusesQueryKey() {
  return ['all-subtopic-status'] as const;
}

async function fetchAllStatuses(): Promise<SubtopicStatusMap> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subtopic_status')
    .select('subtopic_id, status');
  if (error) throw error;

  const map: SubtopicStatusMap = {};
  for (const row of data) {
    map[row.subtopic_id] = row.status as SubtopicStatusValue;
  }
  return map;
}

export function useAllSubtopicStatuses() {
  const queryClient = useQueryClient();
  const queryKey = allSubtopicStatusesQueryKey();

  const query = useQuery({
    queryKey,
    queryFn: fetchAllStatuses,
  });

  useRealtimeTables(['subtopic_status'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}
