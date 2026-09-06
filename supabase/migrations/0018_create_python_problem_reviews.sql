-- Parent feedback on a Python problem (design.md §2.2/§6.7,
-- requirements.md §8.6). Append-only, supporter-only insert - a row's
-- mere existence after submitted_for_review_at is what makes a problem
-- "reviewed" in the derived-status table (design.md §6.7/§9 decision 2).
create table python_problem_reviews (
  id bigserial primary key,
  problem_id bigint not null references python_problems(id) on delete cascade,
  body text,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

alter table python_problem_reviews enable row level security;

create policy "authenticated accounts read python_problem_reviews"
  on python_problem_reviews for select
  to authenticated
  using (true);

create policy "supporter writes python_problem_reviews"
  on python_problem_reviews for insert
  to authenticated
  with check (is_role('supporter'));

alter publication supabase_realtime add table python_problem_reviews;
