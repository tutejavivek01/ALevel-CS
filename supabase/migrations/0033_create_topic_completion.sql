-- Chapter-level completion (replaces the per-subtopic "confident" mastery
-- gate). A row exists once the student has passed the topic's test
-- (quiz, programming challenges, or the exam-question threshold) and
-- clicked/finished "Mark Complete". Completion is sticky: there is no
-- update or delete path, matching mastery_attempts' no-auto-revoke rule.
-- topic_id is a code-defined slug (Topic.id), not a foreign key.
--
-- Single-student app, so (like topic_read_state) not scoped by student_id.
create table topic_completion (
  topic_id     text primary key,
  completed_at timestamptz not null default now(),
  completed_by uuid not null references profiles(id)
);

alter table topic_completion enable row level security;

create policy "authenticated accounts read topic_completion"
  on topic_completion for select
  to authenticated
  using (true);

create policy "student writes topic_completion"
  on topic_completion for insert
  to authenticated
  with check (is_role('student'));

alter publication supabase_realtime add table topic_completion;
