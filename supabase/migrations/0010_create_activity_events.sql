-- Lightweight activity trail (design.md §2.2/§6.5, requirements.md §6):
-- populated by application code alongside each mutation (see
-- lib/db/log-activity.ts), not a database trigger - the human-readable
-- summary needs /lib/spec content (topic/subtopic titles) that only
-- exists in TypeScript, not in Postgres.
create table activity_events (
  id bigserial primary key,
  actor_id uuid not null references profiles(id),
  event_type text not null,
  summary text not null,
  target_ref text,
  created_at timestamptz not null default now()
);

alter table activity_events enable row level security;

create policy "authenticated accounts read activity_events"
  on activity_events for select
  to authenticated
  using (true);

-- An account can only ever log activity as itself.
create policy "accounts log their own activity"
  on activity_events for insert
  to authenticated
  with check (actor_id = auth.uid());

alter publication supabase_realtime add table activity_events;
