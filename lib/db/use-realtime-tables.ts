'use client';

import { useEffect, useRef } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { createClient } from './supabase-browser';

type ChangeHandler = (
  table: string,
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>
) => void;

// Subscribes to several tables at once, in a single effect - not one
// useRealtimeTable() call per table. Empirically, several independent
// hook instances each running their own effect (join -> leave -> rejoin
// under React StrictMode) could leave one of several concurrently
// (re)joining channels acknowledged by the server but never actually
// delivering postgres_changes; a single effect owning every channel for
// a given screen did not reproduce that, verified directly against
// subtopic_status / subtopic_status_history / subtopic_flags together.
export function useRealtimeTables(tables: string[], onChange: ChangeHandler) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const tablesKey = tables.join(',');

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Make sure the client's session is fully loaded before joining any
    // channel - @supabase/ssr's browser client hydrates the session from
    // cookies asynchronously, and a channel joined before that finishes
    // has nothing valid to authorize postgres_changes with.
    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      for (const table of tables) {
        const channel = supabase
          .channel(`realtime:${table}:${Math.random().toString(36).slice(2)}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table },
            (payload) => onChangeRef.current(table, payload)
          )
          .subscribe();
        channels.push(channel);
      }
    });

    return () => {
      cancelled = true;
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
    // tablesKey intentionally replaces `tables` here: an inline array
    // literal from the caller would otherwise re-subscribe every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablesKey]);
}
