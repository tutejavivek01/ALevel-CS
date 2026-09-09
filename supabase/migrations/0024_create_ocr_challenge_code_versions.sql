-- Saved code checkpoints on an OCR challenge (design.md §2.2/§6.10,
-- requirements.md §8.12). Independent of ocr_challenge_submissions: a
-- version never grades against test cases and never requires the code
-- to run cleanly - saved_by inserts freely, always succeeding.
-- syntax_error/best_practice_findings come from a single {type: 'check',
-- code} worker round trip, not a full execution attempt (see task 39's
-- pyodide-worker.js change for why: a full run would need stdin most
-- challenges' correct programs consume via input(), which would
-- misreport otherwise-correct code as erroring on every save).
create table ocr_challenge_code_versions (
  id                     bigserial primary key,
  challenge_id           text not null,
  code                   text not null,
  syntax_error           text,
  best_practice_findings text[] not null default '{}',
  saved_by               uuid not null references profiles(id),
  created_at             timestamptz not null default now()
);

alter table ocr_challenge_code_versions enable row level security;

create policy "authenticated accounts read ocr_challenge_code_versions"
  on ocr_challenge_code_versions for select
  to authenticated
  using (true);

create policy "student writes ocr_challenge_code_versions"
  on ocr_challenge_code_versions for insert
  to authenticated
  with check (is_role('student'));

alter publication supabase_realtime add table ocr_challenge_code_versions;
