-- Throwaway table proving migrations, RLS, and the Supabase client wrappers
-- all work end-to-end (design.md task 2). Dropped by 0002 once confirmed.
create table smoke_test (
  id bigserial primary key,
  message text not null,
  created_at timestamptz not null default now()
);

alter table smoke_test enable row level security;

-- Deliberately permissive: no accounts/roles exist yet (that's task 3).
-- This is only proving connectivity, not the real permission model.
create policy "anon can read smoke_test"
  on smoke_test for select
  using (true);

create policy "anon can insert smoke_test"
  on smoke_test for insert
  with check (true);
