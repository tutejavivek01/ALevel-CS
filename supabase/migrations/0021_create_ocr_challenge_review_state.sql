-- Tracks whether a student has asked for review on an OCR challenge
-- (design.md §2.2/§6.8, requirements.md §8.6/§8.8). challenge_id is a
-- code-defined slug, not a foreign key (same reasoning as
-- ocr_challenge_submissions). Unlike python_problems, there is no
-- supporter-owned column sharing this row for a student write to
-- accidentally clobber - submitted_for_review_at is the only column
-- besides the key, and it's entirely student-owned - so this needs no
-- column-scoping trigger, just a plain student-only policy (design.md
-- §6.8's simplification over §3.2's python_problems pattern).
create table ocr_challenge_review_state (
  challenge_id            text primary key,
  submitted_for_review_at timestamptz,
  updated_by              uuid not null references profiles(id)
);

alter table ocr_challenge_review_state enable row level security;

create policy "authenticated accounts read ocr_challenge_review_state"
  on ocr_challenge_review_state for select
  to authenticated
  using (true);

create policy "student writes ocr_challenge_review_state"
  on ocr_challenge_review_state for insert
  to authenticated
  with check (is_role('student'));

create policy "student updates ocr_challenge_review_state"
  on ocr_challenge_review_state for update
  to authenticated
  using (is_role('student'))
  with check (is_role('student'));

alter publication supabase_realtime add table ocr_challenge_review_state;
