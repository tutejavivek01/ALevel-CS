-- Tracks whether the student has marked a spec area's reading material as
-- read (specs/reading-material/design.md §4.1, requirements.md §4.1).
-- topic_ref is a code-defined slug (Topic.ref, e.g. '4.4') - not a foreign
-- key, same convention as every other content id in this schema.
-- read_at is a real, directly-settable toggle, not purely derived from
-- chapter_read_state, even though ticking every chapter also sets it
-- (requirements.md §4.2's aggregation rule, enforced client-side).
--
-- This app has exactly one student account, so (matching
-- ocr_challenge_review_state's exact shape) this isn't scoped by
-- student_id - the row is the single student's state for that area. No
-- column-scoping trigger needed: only the student role ever writes
-- either column besides the key.
create table topic_read_state (
  topic_ref  text primary key,
  read_at    timestamptz,
  updated_by uuid not null references profiles(id)
);

alter table topic_read_state enable row level security;

create policy "authenticated accounts read topic_read_state"
  on topic_read_state for select
  to authenticated
  using (true);

create policy "student writes topic_read_state"
  on topic_read_state for insert
  to authenticated
  with check (is_role('student'));

create policy "student updates topic_read_state"
  on topic_read_state for update
  to authenticated
  using (is_role('student'))
  with check (is_role('student'));

alter publication supabase_realtime add table topic_read_state;
