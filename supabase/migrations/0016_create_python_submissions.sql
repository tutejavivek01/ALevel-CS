-- Every run of a Python problem, stored permanently and never overwritten
-- (design.md §2.2/§6.7/§8.5). Only a student may insert.
create table python_submissions (
  id bigserial primary key,
  problem_id bigint not null references python_problems(id) on delete cascade,
  submitted_by uuid not null references profiles(id),
  code text not null,
  overall_result text not null check (overall_result in ('pass', 'fail', 'timeout', 'error')),
  error_message text,
  created_at timestamptz not null default now()
);

alter table python_submissions enable row level security;

create policy "authenticated accounts read python_submissions"
  on python_submissions for select
  to authenticated
  using (true);

create policy "student writes python_submissions"
  on python_submissions for insert
  to authenticated
  with check (is_role('student'));

alter publication supabase_realtime add table python_submissions;
