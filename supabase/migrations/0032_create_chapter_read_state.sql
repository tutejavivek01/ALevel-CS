-- Per-chapter read ticks, alongside topic_read_state's area-level toggle
-- (specs/reading-material/design.md §4.1, requirements.md §4.2). chapter_id
-- is ReadingChapter.id (the code-defined filename stem, e.g.
-- 'ch23-logic-gates') - not a foreign key, same convention as every other
-- content id in this schema. Same shape and RLS reasoning as
-- topic_read_state: single-student app, no student_id column, no
-- column-scoping trigger.
create table chapter_read_state (
  chapter_id text primary key,
  read_at    timestamptz,
  updated_by uuid not null references profiles(id)
);

alter table chapter_read_state enable row level security;

create policy "authenticated accounts read chapter_read_state"
  on chapter_read_state for select
  to authenticated
  using (true);

create policy "student writes chapter_read_state"
  on chapter_read_state for insert
  to authenticated
  with check (is_role('student'));

create policy "student updates chapter_read_state"
  on chapter_read_state for update
  to authenticated
  using (is_role('student'))
  with check (is_role('student'));

alter publication supabase_realtime add table chapter_read_state;
