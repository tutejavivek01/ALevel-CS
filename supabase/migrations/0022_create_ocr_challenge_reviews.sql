-- Parent feedback on an OCR challenge (design.md §2.2/§6.8,
-- requirements.md §8.6/§8.8). Append-only, supporter-only insert - same
-- shape and role split as python_problem_reviews (see design.md §2.3's
-- updated "four small comment-shaped tables" reasoning for why this
-- stays its own table rather than merging with the other three).
create table ocr_challenge_reviews (
  id           bigserial primary key,
  challenge_id text not null,
  body         text,
  created_by   uuid not null references profiles(id),
  created_at   timestamptz not null default now()
);

alter table ocr_challenge_reviews enable row level security;

create policy "authenticated accounts read ocr_challenge_reviews"
  on ocr_challenge_reviews for select
  to authenticated
  using (true);

create policy "supporter writes ocr_challenge_reviews"
  on ocr_challenge_reviews for insert
  to authenticated
  with check (is_role('supporter'));

alter publication supabase_realtime add table ocr_challenge_reviews;
