-- Current status per subtopic (design.md §2.2 / §6.1, requirements.md §2).
-- subtopic_id is a code-defined slug from /lib/spec, not a foreign key -
-- see __tests__/spec-integrity.test.ts for how referential integrity is
-- actually enforced instead.
create table subtopic_status (
  subtopic_id text primary key,
  status text not null default 'not-started'
    check (status in ('not-started', 'learning', 'practising', 'confident')),
  updated_at timestamptz not null default now(),
  updated_by uuid not null references profiles(id)
);

alter table subtopic_status enable row level security;

create policy "authenticated accounts read subtopic_status"
  on subtopic_status for select
  to authenticated
  using (true);

-- Only the student may write their own confidence status
-- (design.md §3.2's worked example, requirements.md §2).
create policy "student writes subtopic_status"
  on subtopic_status for insert
  to authenticated
  with check (is_role('student'));

create policy "student updates subtopic_status"
  on subtopic_status for update
  to authenticated
  using (is_role('student'))
  with check (is_role('student'));

alter publication supabase_realtime add table subtopic_status;
