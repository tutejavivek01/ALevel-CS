-- One row per account (design.md §3.1). role is set once at account
-- creation by the seed script (scripts/seed-accounts.mjs), not
-- self-selected, and never changes through the app.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'supporter')),
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Reusable RLS building block (design.md §3.2): wraps the "does the
-- current account have this role" check so later migrations can write
-- `using (is_role('student'))` instead of repeating the subquery.
--
-- security definer + a pinned search_path: this function must read
-- `profiles` regardless of the caller's own RLS visibility, and running
-- as the (trusted) function owner is what avoids a policy on `profiles`
-- recursively evaluating RLS against itself.
create or replace function is_role(target_role text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = target_role
  );
$$;

-- Either seeded account may read both profiles (needed to attribute
-- activity/flags to "Dad" vs "the student" in the UI). Only two accounts
-- will ever exist per requirements.md §1, so an open select is
-- equivalent to "the other known account" without needing a self-join.
create policy "authenticated accounts read profiles"
  on profiles for select
  to authenticated
  using (true);

-- Deliberately no insert/update/delete policy for authenticated/anon:
-- profiles are only ever written by the seed script using the
-- service_role key, which bypasses RLS entirely.
