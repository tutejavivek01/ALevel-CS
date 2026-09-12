-- One row per submitted answer to one part of an exam-bank question
-- (specs/exam-question-bank/design.md §2, requirements.md §3-§4).
-- question_id/part are code-defined refs into
-- lib/exercises/exam-question-bank.ts, not foreign keys - the question
-- content isn't in the database. topic_id is denormalised from the
-- question's spec_area at insert time so progress/gate queries filter by
-- topic without re-deriving it from the content module on every read.
--
-- This is the one attempt-history table in this schema that isn't purely
-- insert-only: the row is inserted immediately (marking_status =
-- 'pending', per requirements.md §4.5's "persist before marking is
-- attempted") and then updated once marking resolves. The update policy
-- is a plain owner check (student_id = auth.uid()), not the
-- column-scoping-trigger pattern used elsewhere for two roles co-owning
-- one row (e.g. guard_ocr_challenge_review_state_supporter_write) -
-- there's only ever one party (the same student) writing this row twice,
-- so no trigger is needed.
create table exam_question_attempts (
  id             bigserial primary key,
  question_id    text not null,
  part           text not null default '',
  topic_id       text not null,
  student_id     uuid not null references profiles(id),
  answer         text not null,
  marking_status text not null default 'pending'
                   check (marking_status in ('pending', 'marked', 'unmarkable', 'failed')),
  awarded        int,
  max            int,
  credited       text[],
  missed         text[],
  model_answer   text,
  misconceptions text[],
  confidence     numeric,
  created_at     timestamptz not null default now(),
  marked_at      timestamptz
);

alter table exam_question_attempts enable row level security;

create policy "authenticated accounts read exam_question_attempts"
  on exam_question_attempts for select
  to authenticated
  using (true);

create policy "student writes exam_question_attempts"
  on exam_question_attempts for insert
  to authenticated
  with check (is_role('student') and student_id = auth.uid());

create policy "student updates own exam_question_attempts"
  on exam_question_attempts for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

alter publication supabase_realtime add table exam_question_attempts;
