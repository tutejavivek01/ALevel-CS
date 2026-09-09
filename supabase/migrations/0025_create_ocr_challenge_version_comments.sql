-- Supporter feedback on one specific saved code version (design.md
-- §2.2/§6.10, requirements.md §8.12) - a new, separate table rather than
-- a nullable version_id added to ocr_challenge_reviews, so the existing
-- challenge-level review thread and reviewed-status derivation stay
-- completely unchanged; this is an additive, more granular feedback
-- channel alongside it, not a replacement. Same shape and role split as
-- ocr_challenge_reviews (see design.md §2.3's "five small comment-shaped
-- tables" reasoning).
create table ocr_challenge_version_comments (
  id           bigserial primary key,
  version_id   bigint not null references ocr_challenge_code_versions(id) on delete cascade,
  body         text not null,
  created_by   uuid not null references profiles(id),
  created_at   timestamptz not null default now()
);

alter table ocr_challenge_version_comments enable row level security;

create policy "authenticated accounts read ocr_challenge_version_comments"
  on ocr_challenge_version_comments for select
  to authenticated
  using (true);

create policy "supporter writes ocr_challenge_version_comments"
  on ocr_challenge_version_comments for insert
  to authenticated
  with check (is_role('supporter'));

alter publication supabase_realtime add table ocr_challenge_version_comments;
