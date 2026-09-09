-- Best-practice / code-quality check (design.md §6.7, requirements.md
-- §8.10) applies to every submission regardless of problem source, so
-- this column is added to the existing python_submissions table here
-- rather than only appearing on the new ocr_challenge_submissions table.
-- No RLS change needed - it's governed by the same existing insert
-- policy that already covers every column on this table.
alter table python_submissions
  add column best_practice_findings text[] not null default '{}';
