'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useOptimisticMutation } from './use-optimistic-mutation';
import { logActivity } from './log-activity';
import { getNeaSectionById } from '@/lib/spec';

export type NeaStatusValue = 'not-started' | 'in-progress' | 'drafted' | 'complete';

export type NeaSectionState = {
  status: NeaStatusValue;
  target_date: string | null;
};

export type NeaStateMap = Record<string, NeaSectionState>;

export function neaStateQueryKey() {
  return ['nea-state'] as const;
}

async function fetchNeaState(): Promise<NeaStateMap> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('nea_state')
    .select('section_id, status, target_date');
  if (error) throw error;

  const map: NeaStateMap = {};
  for (const row of data) {
    map[row.section_id] = {
      status: row.status as NeaStatusValue,
      target_date: row.target_date,
    };
  }
  return map;
}

const DEFAULT_STATE: NeaSectionState = { status: 'not-started', target_date: null };

export function getNeaSectionState(map: NeaStateMap, sectionId: string): NeaSectionState {
  return map[sectionId] ?? DEFAULT_STATE;
}

export function useNeaState() {
  return useQuery({
    queryKey: neaStateQueryKey(),
    queryFn: fetchNeaState,
  });
}

export function useSetNeaStatus() {
  const queryKey = neaStateQueryKey();

  return useOptimisticMutation<{ sectionId: string; status: NeaStatusValue }, void>({
    queryKey,
    mutationFn: async ({ sectionId, status }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      // Partial upsert: PostgREST's upsert only sets the columns given
      // here on conflict, so an existing target_date is left untouched.
      const { error } = await supabase
        .from('nea_state')
        .upsert({ section_id: sectionId, status, updated_by: user.id });
      if (error) throw error;

      const sectionName = getNeaSectionById(sectionId)?.name ?? sectionId;
      await logActivity({
        eventType: 'nea_status_changed',
        summary: `set NEA "${sectionName}" to ${status}`,
        targetRef: sectionId,
      });
    },
    updater: (previous, variables) => {
      const map = (previous as NeaStateMap | undefined) ?? {};
      const current = getNeaSectionState(map, variables.sectionId);
      return { ...map, [variables.sectionId]: { ...current, status: variables.status } };
    },
  });
}

export function useSetNeaTargetDate() {
  const queryKey = neaStateQueryKey();

  return useOptimisticMutation<{ sectionId: string; targetDate: string | null }, void>({
    queryKey,
    mutationFn: async ({ sectionId, targetDate }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase
        .from('nea_state')
        .upsert({ section_id: sectionId, target_date: targetDate, updated_by: user.id });
      if (error) throw error;

      const sectionName = getNeaSectionById(sectionId)?.name ?? sectionId;
      await logActivity({
        eventType: 'nea_target_changed',
        summary: `set a target date for NEA "${sectionName}"`,
        targetRef: sectionId,
      });
    },
    updater: (previous, variables) => {
      const map = (previous as NeaStateMap | undefined) ?? {};
      const current = getNeaSectionState(map, variables.sectionId);
      return {
        ...map,
        [variables.sectionId]: { ...current, target_date: variables.targetDate },
      };
    },
  });
}
