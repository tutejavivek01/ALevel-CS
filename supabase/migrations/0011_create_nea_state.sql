-- Current status + target date per NEA section (design.md §2.2/§6.3,
-- requirements.md §4). section_id is one of the six fixed ids from
-- /lib/spec/nea.ts - marks/names stay in code, not here.
create table nea_state (
  section_id text primary key,
  status text not null default 'not-started'
    check (status in ('not-started', 'in-progress', 'drafted', 'complete')),
  target_date date,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references profiles(id)
);

alter table nea_state enable row level security;

create policy "authenticated accounts read nea_state"
  on nea_state for select
  to authenticated
  using (true);

-- Unlike subtopic confidence, NEA progress is jointly managed - either
-- role may write (design.md §6.3).
create policy "authenticated accounts write nea_state"
  on nea_state for insert
  to authenticated
  with check (true);

create policy "authenticated accounts update nea_state"
  on nea_state for update
  to authenticated
  using (true)
  with check (true);

alter publication supabase_realtime add table nea_state;
