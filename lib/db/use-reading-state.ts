'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useOptimisticMutation } from './use-optimistic-mutation';
import { useRealtimeTables } from './use-realtime-tables';

// specs/reading-material/design.md §4 - topic_read_state/chapter_read_state
// mirror ocr_challenge_review_state's exact shape and mutation pattern
// (a nullable timestamptz toggle, upserted by the student role only).

export type TopicReadState = {
  topic_ref: string;
  read_at: string | null;
  updated_by: string;
};

export function topicReadStateQueryKey(topicRef: string) {
  return ['topic-read-state', topicRef] as const;
}

async function fetchTopicReadState(
  topicRef: string
): Promise<TopicReadState | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('topic_read_state')
    .select('*')
    .eq('topic_ref', topicRef)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function useTopicReadState(topicRef: string) {
  const queryClient = useQueryClient();
  const queryKey = topicReadStateQueryKey(topicRef);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchTopicReadState(topicRef),
  });

  useRealtimeTables(['topic_read_state'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

// Every topic's read_at in one query, keyed by topic_ref - for the
// Dashboard's passive per-tile indicator (requirements.md §4.1), which
// needs every topic's state at once rather than one at a time (mirrors
// useAllSubtopicStatuses / useOcrChallengeDueDates exactly).
export function allTopicReadStateQueryKey() {
  return ['all-topic-read-state'] as const;
}

async function fetchAllTopicReadState(): Promise<
  Record<string, string | null>
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('topic_read_state')
    .select('topic_ref, read_at');
  if (error) throw error;

  const map: Record<string, string | null> = {};
  for (const row of data) map[row.topic_ref] = row.read_at;
  return map;
}

export function useAllTopicReadState() {
  const queryClient = useQueryClient();
  const queryKey = allTopicReadStateQueryKey();

  const query = useQuery({ queryKey, queryFn: fetchAllTopicReadState });

  useRealtimeTables(['topic_read_state'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

// requirements.md §4.1 - a real, directly-settable toggle (ticking every
// chapter also sets it, via useSetChapterRead below, but this is not
// merely derived).
export function useSetTopicRead(topicRef: string) {
  const queryKey = topicReadStateQueryKey(topicRef);

  return useOptimisticMutation<boolean, void>({
    queryKey,
    mutationFn: async (read) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase.from('topic_read_state').upsert({
        topic_ref: topicRef,
        read_at: read ? new Date().toISOString() : null,
        updated_by: user.id,
      });
      if (error) throw error;
    },
    updater: (previous, read) => {
      const state = previous as TopicReadState | null | undefined;
      return {
        topic_ref: topicRef,
        read_at: read ? new Date().toISOString() : null,
        updated_by: state?.updated_by ?? 'optimistic',
      };
    },
    mirrors: [
      {
        queryKey: allTopicReadStateQueryKey(),
        updater: (previous, read) => ({
          ...((previous as Record<string, string | null>) ?? {}),
          [topicRef]: read ? new Date().toISOString() : null,
        }),
      },
    ],
  });
}

export function chapterReadStatesQueryKey(topicRef: string) {
  return ['chapter-read-states', topicRef] as const;
}

async function fetchChapterReadStates(
  chapterIds: string[]
): Promise<Record<string, string | null>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('chapter_read_state')
    .select('chapter_id, read_at')
    .in('chapter_id', chapterIds);
  if (error) throw error;

  const map: Record<string, string | null> = {};
  for (const row of data) map[row.chapter_id] = row.read_at;
  return map;
}

export function useChapterReadStates(topicRef: string, chapterIds: string[]) {
  const queryClient = useQueryClient();
  const queryKey = chapterReadStatesQueryKey(topicRef);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchChapterReadStates(chapterIds),
    enabled: chapterIds.length > 0,
  });

  useRealtimeTables(['chapter_read_state'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

// requirements.md §4.2 - ticking every chapter in a topic automatically
// marks the topic itself read; the reverse never happens (un-marking the
// topic never clears a chapter tick - that asymmetry falls out naturally
// from useSetTopicRead/useSetChapterRead being independent mutations with
// no wiring in that direction; only the topic-read auto-set below exists).
export function useSetChapterRead(topicRef: string, allChapterIds: string[]) {
  const queryClient = useQueryClient();
  const queryKey = chapterReadStatesQueryKey(topicRef);
  const setTopicRead = useSetTopicRead(topicRef);

  const mutation = useOptimisticMutation<
    { chapterId: string; read: boolean },
    void
  >({
    queryKey,
    mutationFn: async ({ chapterId, read }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase.from('chapter_read_state').upsert({
        chapter_id: chapterId,
        read_at: read ? new Date().toISOString() : null,
        updated_by: user.id,
      });
      if (error) throw error;
    },
    updater: (previous, { chapterId, read }) => ({
      ...((previous as Record<string, string | null>) ?? {}),
      [chapterId]: read ? new Date().toISOString() : null,
    }),
  });

  function setChapterRead(chapterId: string, read: boolean) {
    mutation.mutate(
      { chapterId, read },
      {
        onSuccess: () => {
          // Only ticking a chapter read can trigger the auto-mark - never
          // un-ticking, which must never revoke the topic's own state.
          if (!read) return;
          const map =
            queryClient.getQueryData<Record<string, string | null>>(queryKey) ??
            {};
          const allRead = allChapterIds.every((id) => Boolean(map[id]));
          if (allRead) setTopicRead.mutate(true);
        },
      }
    );
  }

  return { ...mutation, setChapterRead };
}
