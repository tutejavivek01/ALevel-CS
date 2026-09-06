-- Append-only history of status changes (design.md §2.2, requirements.md
-- §2's "last touched" requirement). Written by the app alongside every
-- subtopic_status write (tasks.md task 9: "same transaction/request"),
-- not by a database trigger - matches the same reasoning design.md §6.5
-- uses for activity_events, and keeps both writes in the one mutationFn
-- that already owns this concern.
create table subtopic_status_history (
  id bigserial primary key,
  subtopic_id text not null,
  status text not null,
  changed_at timestamptz not null default now(),
  changed_by uuid not null references profiles(id)
);

alter table subtopic_status_history enable row level security;

create policy "authenticated accounts read subtopic_status_history"
  on subtopic_status_history for select
  to authenticated
  using (true);

-- Mirrors subtopic_status's own write restriction: history only ever
-- comes from a real student status change.
create policy "student writes subtopic_status_history"
  on subtopic_status_history for insert
  to authenticated
  with check (is_role('student'));

alter publication supabase_realtime add table subtopic_status_history;
