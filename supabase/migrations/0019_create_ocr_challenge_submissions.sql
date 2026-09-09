-- Mutable state for the fixed OCR challenge set (design.md §6.8,
-- requirements.md §8.8). challenge_id is a code-defined slug from
-- /lib/exercises/ocr-challenges.ts, not a foreign key - the challenge
-- content itself isn't in the database, the same pattern as
-- subtopic_status's subtopic_id. Otherwise mirrors python_submissions
-- exactly (task 20), including best_practice_findings (design.md §6.7's
-- code-quality check, task 31).
create table ocr_challenge_submissions (
  id             bigserial primary key,
  challenge_id   text not null,
  submitted_by   uuid not null references profiles(id),
  code           text not null,
  overall_result text not null check (overall_result in ('pass', 'fail', 'timeout', 'error')),
  error_message  text,
  best_practice_findings text[] not null default '{}',
  created_at     timestamptz not null default now()
);

alter table ocr_challenge_submissions enable row level security;

create policy "authenticated accounts read ocr_challenge_submissions"
  on ocr_challenge_submissions for select
  to authenticated
  using (true);

create policy "student writes ocr_challenge_submissions"
  on ocr_challenge_submissions for insert
  to authenticated
  with check (is_role('student'));

alter publication supabase_realtime add table ocr_challenge_submissions;
