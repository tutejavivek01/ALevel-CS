-- One row per "confident" mastery-gate attempt, quiz or programming
-- challenge (design.md §6.13, requirements.md §12). topic_id is a
-- code-defined slug from /lib/spec (Topic.id) - not a foreign key, same
-- pattern as subtopic_id/challenge_id/term_id elsewhere in this schema.
-- Append-only: no update/delete policy, mirroring every other
-- attempt-history table.
create table mastery_attempts (
  id           bigserial primary key,
  topic_id     text not null,
  route        text not null check (route in ('quiz', 'challenge')),
  score        int not null,
  max_score    int not null,
  passed       boolean not null,
  attempted_by uuid not null references profiles(id),
  created_at   timestamptz not null default now()
);

alter table mastery_attempts enable row level security;

create policy "authenticated accounts read mastery_attempts"
  on mastery_attempts for select
  to authenticated
  using (true);

create policy "student writes mastery_attempts"
  on mastery_attempts for insert
  to authenticated
  with check (is_role('student'));

alter publication supabase_realtime add table mastery_attempts;
