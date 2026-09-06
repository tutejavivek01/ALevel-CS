-- Throwaway table proving the shared optimistic-mutation + Realtime
-- pattern end-to-end (task 6, design.md §4). Dropped once confirmed.
create table realtime_smoke_test (
  id bigint primary key,
  value text not null check (char_length(value) <= 20),
  updated_at timestamptz not null default now()
);

alter table realtime_smoke_test enable row level security;

create policy "authenticated accounts read realtime_smoke_test"
  on realtime_smoke_test for select
  to authenticated
  using (true);

create policy "authenticated accounts write realtime_smoke_test"
  on realtime_smoke_test for insert
  to authenticated
  with check (true);

create policy "authenticated accounts update realtime_smoke_test"
  on realtime_smoke_test for update
  to authenticated
  using (true)
  with check (true);

-- Tables aren't broadcast over Realtime until added to this publication.
alter publication supabase_realtime add table realtime_smoke_test;
