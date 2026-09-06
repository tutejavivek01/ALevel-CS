-- Per-test-case grading detail for a submission (design.md §2.2/§6.7).
-- Written alongside the parent python_submissions row, by the same
-- student-only mutation - inserted here, never updated.
create table python_submission_results (
  id bigserial primary key,
  submission_id bigint not null references python_submissions(id) on delete cascade,
  test_case_id bigint not null references python_test_cases(id) on delete cascade,
  passed boolean not null,
  actual_output text not null
);

alter table python_submission_results enable row level security;

create policy "authenticated accounts read python_submission_results"
  on python_submission_results for select
  to authenticated
  using (true);

create policy "student writes python_submission_results"
  on python_submission_results for insert
  to authenticated
  with check (is_role('student'));

alter publication supabase_realtime add table python_submission_results;
