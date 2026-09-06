-- Supporter comments on a subtopic (design.md §2.2/§6.1, requirements.md
-- §2). Append-only for now - no edit/delete policy, since resolution
-- state was left as an explicit open item (requirements.md §10); adding
-- it later is an additive migration, not a redesign.
create table subtopic_flags (
  id bigserial primary key,
  subtopic_id text not null,
  body text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

alter table subtopic_flags enable row level security;

create policy "authenticated accounts read subtopic_flags"
  on subtopic_flags for select
  to authenticated
  using (true);

-- Only the supporter may leave a flag (design.md §3.2's worked example).
create policy "supporter writes subtopic_flags"
  on subtopic_flags for insert
  to authenticated
  with check (is_role('supporter'));

alter publication supabase_realtime add table subtopic_flags;
