-- due_date added for requirements.md §8.13/design.md §6.11: unlike
-- submitted_for_review_at (student-only), due_date is jointly editable
-- by either role - the same column-scoping problem §3.2 already solved
-- for python_problems, just with the restricted side flipped (there,
-- students were restricted to one column; here, supporters are).
alter table ocr_challenge_review_state add column due_date date;

-- Replace the student-only insert/update policies with either-role
-- versions - the guard trigger below is what still stops a supporter
-- from touching submitted_for_review_at.
drop policy "student writes ocr_challenge_review_state" on ocr_challenge_review_state;
drop policy "student updates ocr_challenge_review_state" on ocr_challenge_review_state;

create policy "either role writes ocr_challenge_review_state"
  on ocr_challenge_review_state for insert
  to authenticated
  with check (is_role('student') or is_role('supporter'));

create policy "either role updates ocr_challenge_review_state"
  on ocr_challenge_review_state for update
  to authenticated
  using (is_role('student') or is_role('supporter'))
  with check (is_role('student') or is_role('supporter'));

-- A supporter may insert/update this row (to set due_date on a challenge
-- the student hasn't touched yet) but may never set or change
-- submitted_for_review_at - mirrors guard_python_problems_student_update
-- (§3.2) with the roles' restriction inverted. old is null on insert, so
-- a supporter-originated insert must leave submitted_for_review_at null.
create or replace function guard_ocr_challenge_review_state_supporter_write()
returns trigger as $$
begin
  if is_role('supporter') and not is_role('student') then
    if new.submitted_for_review_at is distinct from
       (case when tg_op = 'INSERT' then null else old.submitted_for_review_at end)
    then
      raise exception 'supporters may only set due_date on ocr_challenge_review_state';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger guard_ocr_challenge_review_state_supporter_write
  before insert or update on ocr_challenge_review_state
  for each row execute function guard_ocr_challenge_review_state_supporter_write();
