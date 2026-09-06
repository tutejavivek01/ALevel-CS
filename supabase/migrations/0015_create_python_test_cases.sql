-- Test cases for a Python problem (design.md §2.2/§6.7, requirements.md
-- §8.1). Fully visible to the student - no hidden-case concept
-- (design.md §9 decision 1). Written by the supporter alongside the
-- parent python_problems row, in the same authoring form (task 21).
create table python_test_cases (
  id bigserial primary key,
  problem_id bigint not null references python_problems(id) on delete cascade,
  position int not null,
  input text not null default '',
  expected_output text not null
);

alter table python_test_cases enable row level security;

create policy "authenticated accounts read python_test_cases"
  on python_test_cases for select
  to authenticated
  using (true);

create policy "supporter writes python_test_cases"
  on python_test_cases for insert
  to authenticated
  with check (is_role('supporter'));

alter publication supabase_realtime add table python_test_cases;
