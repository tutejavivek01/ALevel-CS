-- Task 55 sign-off finding: requirements.md §4.5 requires a marking
-- failure to be surfaced distinctly (e.g. a rate limit's "try again
-- shortly" message), not as one generic "couldn't mark this" string for
-- every failure cause. lib/exam-marking/marker.ts already computes a
-- specific reason per failure (rate limit / auth / schema / generic) but
-- had nowhere to persist it - add the column so the route can store it
-- and the UI can display it.
alter table exam_question_attempts
  add column failure_reason text;
