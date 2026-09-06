'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useOptimisticMutation } from './use-optimistic-mutation';
import { logActivity } from './log-activity';
import { getNeaSectionById } from '@/lib/spec';

export type NeaNote = {
  id: number;
  section_id: string;
  body: string;
  created_by: string;
  created_at: string;
};

export function neaNotesQueryKey() {
  return ['nea-notes'] as const;
}

async function fetchNeaNotes(): Promise<NeaNote[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('nea_notes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// All sections' notes in one query/subscription, like the topic-page
// hooks - grouped client-side per section for display.
export function useNeaNotes() {
  return useQuery({
    queryKey: neaNotesQueryKey(),
    queryFn: fetchNeaNotes,
  });
}

export function useAddNeaNote() {
  const queryKey = neaNotesQueryKey();

  return useOptimisticMutation<{ sectionId: string; body: string }, void>({
    queryKey,
    mutationFn: async ({ sectionId, body }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase
        .from('nea_notes')
        .insert({ section_id: sectionId, body, created_by: user.id });
      if (error) throw error;

      const sectionName = getNeaSectionById(sectionId)?.name ?? sectionId;
      await logActivity({
        eventType: 'nea_note_added',
        summary: `added a note to NEA "${sectionName}"`,
        targetRef: sectionId,
      });
    },
    updater: (previous, variables) => {
      const notes = (previous as NeaNote[] | undefined) ?? [];
      const optimisticNote: NeaNote = {
        id: -Date.now(),
        section_id: variables.sectionId,
        body: variables.body,
        created_by: 'optimistic',
        created_at: new Date().toISOString(),
      };
      return [optimisticNote, ...notes];
    },
  });
}
