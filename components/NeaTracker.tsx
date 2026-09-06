'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from './Card';
import { NEA_SECTIONS, NEA_TOTAL_MARKS } from '@/lib/spec';
import {
  getNeaSectionState,
  neaStateQueryKey,
  useNeaState,
  useSetNeaStatus,
  useSetNeaTargetDate,
  type NeaStatusValue,
} from '@/lib/db/use-nea-state';
import { neaNotesQueryKey, useAddNeaNote, useNeaNotes } from '@/lib/db/use-nea-notes';
import { useProfiles } from '@/lib/db/use-profiles';
import { useRealtimeTables } from '@/lib/db/use-realtime-tables';

const NEA_STATUS_OPTIONS: NeaStatusValue[] = [
  'not-started',
  'in-progress',
  'drafted',
  'complete',
];

function NoteForm({ onAdd }: { onAdd: (body: string) => void }) {
  const [draft, setDraft] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = draft.trim();
        if (trimmed) {
          onAdd(trimmed);
          setDraft('');
        }
      }}
      style={{ display: 'flex', gap: 8, marginTop: 8 }}
    >
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Add a note…"
      />
      <button type="submit" className="btn2 alt">
        Add note
      </button>
    </form>
  );
}

export function NeaTracker() {
  const queryClient = useQueryClient();
  const { data: stateMap, isLoading: stateLoading } = useNeaState();
  const { data: notes } = useNeaNotes();
  const { data: profiles } = useProfiles();
  const setStatus = useSetNeaStatus();
  const setTargetDate = useSetNeaTargetDate();
  const addNote = useAddNeaNote();

  useRealtimeTables(['nea_state', 'nea_notes'], (table) => {
    if (table === 'nea_state') {
      queryClient.invalidateQueries({ queryKey: neaStateQueryKey() });
    } else if (table === 'nea_notes') {
      queryClient.invalidateQueries({ queryKey: neaNotesQueryKey() });
    }
  });

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
  const safeStateMap = stateMap ?? {};

  return (
    <Card>
      <div className="topic-head">
        <div>
          <div className="ref">§ 4.14</div>
          <h2>Non-Exam Assessment</h2>
          <span className="unit-badge">20% of the A-level &middot; {NEA_TOTAL_MARKS} marks</span>
        </div>
      </div>

      <div className="nea-sections">
        {NEA_SECTIONS.map((section) => {
          const sectionState = getNeaSectionState(safeStateMap, section.id);
          const sectionNotes = (notes ?? []).filter((n) => n.section_id === section.id);

          return (
            <div className="nea-row" key={section.id}>
              <div>
                <div className="name">{section.name}</div>
                <div className="desc">{section.desc}</div>
              </div>
              <div className="marks">
                {section.marks} / {NEA_TOTAL_MARKS}
              </div>
              <div className="ctrl">
                <span className="field-label">Status</span>
                <select
                  value={stateLoading ? 'not-started' : sectionState.status}
                  onChange={(e) =>
                    setStatus.mutate({
                      sectionId: section.id,
                      status: e.target.value as NeaStatusValue,
                    })
                  }
                >
                  {NEA_STATUS_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value.replace('-', ' ')}
                    </option>
                  ))}
                </select>
                <span className="field-label">Target date</span>
                <input
                  type="date"
                  value={sectionState.target_date ?? ''}
                  onChange={(e) =>
                    setTargetDate.mutate({
                      sectionId: section.id,
                      targetDate: e.target.value || null,
                    })
                  }
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: 10 }}>
                <h4 className="section-title" style={{ marginBottom: 6 }}>
                  Notes
                </h4>
                {sectionNotes.length === 0 && (
                  <p className="empty-note">No notes yet.</p>
                )}
                {sectionNotes.map((note) => (
                  <p key={note.id} style={{ fontSize: 12.5, margin: '4px 0' }}>
                    <strong>{nameById.get(note.created_by) ?? 'Someone'}</strong>{' '}
                    <span style={{ color: 'var(--ink-dim)' }}>{note.body}</span>{' '}
                    <span className="mono" style={{ color: 'var(--muted)', fontSize: 11 }}>
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </p>
                ))}
                <NoteForm
                  onAdd={(body) => addNote.mutate({ sectionId: section.id, body })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
