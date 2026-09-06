import type { SubtopicStatusValue } from '@/lib/db/use-subtopic-status';

const STATUSES: { key: SubtopicStatusValue; label: string }[] = [
  { key: 'not-started', label: '—' },
  { key: 'learning', label: 'Learning' },
  { key: 'practising', label: 'Practising' },
  { key: 'confident', label: 'Confident' },
];

type Props = {
  value: SubtopicStatusValue;
  onChange: (status: SubtopicStatusValue) => void;
  // Visual/UX affordance only - the real enforcement is the
  // student-writes-only RLS policy on subtopic_status (design.md §3.2).
  // A supporter account calling the mutation directly, bypassing this
  // control entirely, is still rejected by the database.
  disabled?: boolean;
};

export function StatusSegmentedControl({ value, onChange, disabled }: Props) {
  return (
    <div className="seg">
      {STATUSES.map((s) => (
        <button
          key={s.key}
          type="button"
          data-s={s.key}
          className={value === s.key ? 'on' : ''}
          disabled={disabled}
          onClick={() => onChange(s.key)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
