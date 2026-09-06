-- Shared personal links (design.md §2.2/§6.2, requirements.md §3),
-- separate from the code-maintained curated list in /lib/spec.
create table resource_links (
  id bigserial primary key,
  topic_id text not null,
  url text not null,
  label text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

alter table resource_links enable row level security;

create policy "authenticated accounts read resource_links"
  on resource_links for select
  to authenticated
  using (true);

-- Either role may add a link (design.md §6.2: "jointly managed", unlike
-- subtopic confidence).
create policy "authenticated accounts add resource_links"
  on resource_links for insert
  to authenticated
  with check (true);

-- Delete restricted to whoever added it - design.md §6.2's default,
-- resolving requirements.md §10's open question in favor of added-by-only.
create policy "creator deletes own resource_links"
  on resource_links for delete
  to authenticated
  using (created_by = auth.uid());

alter publication supabase_realtime add table resource_links;
