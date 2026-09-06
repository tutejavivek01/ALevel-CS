-- Running notes log per NEA section (design.md §2.2/§6.3, requirements.md
-- §4) - append-only, never overwritten. Either role may write.
create table nea_notes (
  id bigserial primary key,
  section_id text not null,
  body text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

alter table nea_notes enable row level security;

create policy "authenticated accounts read nea_notes"
  on nea_notes for select
  to authenticated
  using (true);

create policy "authenticated accounts write nea_notes"
  on nea_notes for insert
  to authenticated
  with check (true);

alter publication supabase_realtime add table nea_notes;
