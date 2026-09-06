-- Parent-authored Python practice problems (design.md §2.2/§6.7,
-- requirements.md §8.1). Only a supporter may insert/update the problem
-- itself; submitted_for_review_at is written by the student instead
-- (§7.6's derived status).
create table python_problems (
  id bigserial primary key,
  title text not null,
  description text not null,
  starter_code text,
  due_date date,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  submitted_for_review_at timestamptz
);

alter table python_problems enable row level security;

create policy "authenticated accounts read python_problems"
  on python_problems for select
  to authenticated
  using (true);

create policy "supporter writes python_problems"
  on python_problems for insert
  to authenticated
  with check (is_role('supporter'));

create policy "supporter updates python_problems"
  on python_problems for update
  to authenticated
  using (is_role('supporter'))
  with check (is_role('supporter'));

-- The student also needs to update this same row (to set
-- submitted_for_review_at, §7.6), but row-level USING/WITH CHECK can't
-- express "this role may change only this one column" - both roles map
-- to the same 'authenticated' Postgres role, so there's no column-level
-- GRANT to lean on either. A BEFORE UPDATE trigger closes that gap: a
-- student-originated update is only allowed through if every column
-- other than submitted_for_review_at is unchanged, enforced in the
-- database itself (not the app), so it holds even against a direct API
-- call - same bar as every other RLS policy in this schema.
create policy "student submits python_problems for review"
  on python_problems for update
  to authenticated
  using (is_role('student'))
  with check (is_role('student'));

create or replace function guard_python_problems_student_update()
returns trigger as $$
begin
  if is_role('student') and not is_role('supporter') then
    if new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.starter_code is distinct from old.starter_code
      or new.due_date is distinct from old.due_date
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at
    then
      raise exception 'students may only set submitted_for_review_at on python_problems';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger guard_python_problems_student_update
  before update on python_problems
  for each row execute function guard_python_problems_student_update();

alter publication supabase_realtime add table python_problems;
