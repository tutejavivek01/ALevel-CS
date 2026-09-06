'use client';

import { useState } from 'react';
import type { SubtopicFlag } from '@/lib/db/use-subtopic-flags';

type Props = {
  flags: SubtopicFlag[];
  // Visual/UX affordance only - the real enforcement is the
  // supporter-writes-only RLS policy on subtopic_flags (design.md §3.2).
  canWrite: boolean;
  onAdd: (body: string) => void;
};

export function SupporterFlag({ flags, canWrite, onAdd }: Props) {
  const [draft, setDraft] = useState('');

  if (flags.length === 0 && !canWrite) return null;

  return (
    <div style={{ padding: '0 0 12px', fontSize: 12.5 }}>
      {flags.map((flag) => (
        <p key={flag.id} style={{ color: 'var(--ink-dim)', margin: '4px 0' }}>
          🚩 {flag.body}
        </p>
      ))}
      {canWrite && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = draft.trim();
            if (trimmed) {
              onAdd(trimmed);
              setDraft('');
            }
          }}
          style={{ display: 'flex', gap: 6, marginTop: 4 }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Leave a note…"
            style={{
              flex: 1,
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '4px 8px',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: 12.5,
            }}
          />
          <button type="submit" className="btn2 alt">
            Flag
          </button>
        </form>
      )}
    </div>
  );
}
