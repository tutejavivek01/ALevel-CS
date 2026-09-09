-- Per-test-case grading detail for an OCR challenge submission
-- (design.md §2.2/§6.8). test_case_position indexes into the challenge's
-- code-defined test case array (/lib/exercises/ocr-challenges.ts), not a
-- database row - there is no ocr_challenge_test_cases table, since test
-- cases are fixed content, not something a supporter authors.
create table ocr_challenge_submission_results (
  id                 bigserial primary key,
  submission_id      bigint not null references ocr_challenge_submissions(id) on delete cascade,
  test_case_position int not null,
  passed             boolean not null,
  actual_output      text not null
);

alter table ocr_challenge_submission_results enable row level security;

create policy "authenticated accounts read ocr_challenge_submission_results"
  on ocr_challenge_submission_results for select
  to authenticated
  using (true);

create policy "student writes ocr_challenge_submission_results"
  on ocr_challenge_submission_results for insert
  to authenticated
  with check (is_role('student'));

alter publication supabase_realtime add table ocr_challenge_submission_results;
