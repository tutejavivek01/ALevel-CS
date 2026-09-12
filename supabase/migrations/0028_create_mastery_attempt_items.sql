-- Per-question/per-challenge detail for a mastery_attempts row (design.md
-- §6.13). item_ref is a code-defined question/challenge id from
-- /lib/exercises/mastery-quiz.ts or mastery-challenges.ts, not a foreign
-- key - the content itself isn't in the database, same as
-- ocr_challenge_submission_results' test_case_position.
create table mastery_attempt_items (
  id         bigserial primary key,
  attempt_id bigint not null references mastery_attempts(id) on delete cascade,
  item_ref   text not null,
  position   int not null,
  answer     text not null,
  correct    boolean not null
);

alter table mastery_attempt_items enable row level security;

create policy "authenticated accounts read mastery_attempt_items"
  on mastery_attempt_items for select
  to authenticated
  using (true);

create policy "student writes mastery_attempt_items"
  on mastery_attempt_items for insert
  to authenticated
  with check (is_role('student'));

alter publication supabase_realtime add table mastery_attempt_items;
