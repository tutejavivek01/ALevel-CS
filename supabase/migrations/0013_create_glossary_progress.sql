-- Spaced-resurfacing state for the glossary drill (design.md §2.2/§6.4,
-- requirements.md §5.3). term_id is a code-defined slug from
-- /lib/exercises/glossary.ts. Only mastered + next_eligible_at are
-- actually needed by the resurfacing algorithm
-- (lib/exercises/glossary-drill.ts) - last_shown_at from the original
-- design was left out since nothing reads it.
create table glossary_progress (
  term_id text primary key,
  mastered boolean not null default false,
  next_eligible_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references profiles(id)
);

alter table glossary_progress enable row level security;

create policy "authenticated accounts read glossary_progress"
  on glossary_progress for select
  to authenticated
  using (true);

-- Either account may use the drill.
create policy "authenticated accounts write glossary_progress"
  on glossary_progress for insert
  to authenticated
  with check (true);

create policy "authenticated accounts update glossary_progress"
  on glossary_progress for update
  to authenticated
  using (true)
  with check (true);

alter publication supabase_realtime add table glossary_progress;
