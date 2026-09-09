# Tasks

A strict build order, not a dependency graph — task *N* assumes every
task before it is already done, and nothing here is meant to be built in
parallel. Each is sized to roughly 2–4 hours. References point back to
`design.md` (architecture) and `requirements.md` (why). Check tasks off
as they're completed; don't skip ahead even if a later task looks easy —
several early "boring" tasks (the shared mutation pattern, the auth
seeding) exist specifically so later tasks don't have to reinvent them.

- [x] 1. Project scaffolding
- [x] 2. Supabase project setup
- [x] 3. Auth backend: profiles + RLS foundation
- [x] 4. Auth frontend: login + route protection
- [x] 5. Design system port + app shell
- [x] 6. Shared data layer: optimistic mutations + Realtime
- [x] 7. Spec content migration
- [x] 8. Syllabus tracker vertical slice
- [x] 9. Status history + supporter flags
- [x] 10. Dashboard overview
- [x] 11. Resource hub
- [x] 12. Activity trail
- [x] 13. NEA tracker: schema + CRUD
- [x] 14. NEA tracker: deadlines + marks estimate
- [x] 15. Generalized stepped-exercise interface
- [x] 16. Trace-table exercises
- [x] 17. FSM engine
- [x] 18. FSM exercise UI
- [x] 19. Glossary drill
- [x] 20. Python problems: schema + RLS
- [x] 21. Python problems: authoring + list UI
- [x] 22. Python problems: code editor + static detail page
- [x] 23. Pyodide execution: basic Web Worker
- [x] 24. Pyodide execution: timeout/interrupt
- [x] 25. Python problems: submission persistence + attempt history
- [x] 26. Python problems: review workflow
- [x] 27. Dashboard: Python due-date banner
- [x] 28. Data export
- [x] 29. End-to-end polish & sign-off
- [x] 30. OCR challenge tables: schema + RLS
- [x] 31. Best-practice / code-quality checker
- [x] 32. OCR challenge content: descriptions
- [x] 33. OCR challenge list + static detail page
- [x] 34. OCR challenge test cases
- [x] 35. OCR challenge execution, grading & review
- [x] 36. Code submission via file upload
- [ ] 37. End-to-end polish & sign-off (OCR challenge set)

---

## 1. Project scaffolding

Set up the Next.js + TypeScript project itself — no features yet.

- Initialize Next.js (App Router) + TypeScript (strict mode) per
  `tech-stack.md`.
- Configure ESLint/Prettier, Vitest, and Playwright, each with one
  trivial passing smoke test — proves the pipeline works before any real
  code depends on it.
- Create the folder skeleton from `conventions.md`: `/app`, `/components`,
  `/lib/spec`, `/lib/exercises`, `/lib/db`.
- Move `reference/prototype.html` and `steering/` into the new repo
  structure unchanged (they're reference material, not app code).

**Done when:** `npm run build`, `npm test`, and `npx playwright test` all
pass on a project with no real features yet.

## 2. Supabase project setup

- Create the Supabase project; record connection details as env vars
  (never committed — a `.env.example` with empty values instead).
- Install `@supabase/supabase-js`; set up Supabase CLI migrations
  (`supabase/migrations/`) as the single source of truth for schema —
  every table in `design.md` §2.2 gets created via a migration file, not
  the dashboard UI, so schema history is in git.
- Write the typed Supabase client wrapper in `/lib/db/client.ts` (browser
  client + server client per Next.js's SSR/client split).

**Done when:** a migration creates one throwaway table, the app can
query it from both a server component and a client component, and the
migration is reproducible from a clean database.

## 3. Auth backend: profiles + RLS foundation

Per `design.md` §3.

- Migration for the `profiles` table.
- The one-time seed script that creates the two `auth.users` accounts
  and their matching `profiles` rows with `role` set explicitly
  (`design.md` §3.1) — run manually once against the real project, not
  part of the app's runtime code.
- Write the RLS policy *pattern* (role-gated insert/update, open select)
  as a reusable migration snippet, and apply it to `profiles` itself as
  the first example.

**Done when:** both seeded accounts exist, each with the correct role,
and can be confirmed via a direct query with each account's own session
token.

## 4. Auth frontend: login + route protection

- `/login` page using Supabase Auth's sign-in (no sign-up UI — accounts
  only ever come from the seed script in task 3).
- Session persistence configured for long-lived sessions (`design.md`
  §3.3).
- Next.js middleware redirecting unauthenticated requests to `/login` for
  every other route.
- A `useCurrentProfile()` hook exposing the logged-in account's role to
  client components.

**Done when:** logging in as either seeded account lands on a (still
empty) protected page, staying logged in across a browser restart, and
an unauthenticated request to any other route redirects to `/login`.

## 5. Design system port + app shell

- Port the prototype's CSS custom properties (colors, light/dark via
  `prefers-color-scheme` + `data-theme`, IBM Plex fonts) into global CSS
  per `conventions.md`.
- Build the shared shell: header with the overall-progress ring
  placeholder, the nav rail, and the `Card`/`ProgressRing` components
  from the prototype's markup, now as real components.
- Wire up the route list from `design.md` §5 as empty pages linked from
  the nav (content comes in later tasks).

**Done when:** every route in `design.md` §5 exists, renders the shared
shell, and looks visually equivalent to the prototype's chrome in both
light and dark mode.

## 6. Shared data layer: optimistic mutations + Realtime

The foundational piece from `design.md` §4 — build this before any
feature needs it, since every mutation from task 8 onward depends on it.

- Add TanStack Query (flagged addition, `design.md` §9.6) — or, if you'd
  rather not take the new dependency, a hand-written
  `useOptimisticMutation` hook doing the same job. Decide once, here, not
  per-feature.
- Build the shared pattern: optimistic local update → Supabase write →
  on success no-op → on failure revert + surface an inline retry control
  (`design.md` §7).
- Build a small Realtime subscription helper (`useRealtimeTable`) wrapping
  `supabase-js`'s Postgres Changes channel subscription + cleanup.
- Prove both work against the throwaway table from task 2: two browser
  sessions logged in as the two seeded accounts, one mutates, the other
  sees it live; then simulate a failed write and confirm the retry
  control appears instead of the change silently vanishing.

**Done when:** that proof works end-to-end. Delete the throwaway table
once confirmed.

## 7. Spec content migration

- Port the prototype's `TOPICS`, `RES`, and `aqa()` data into
  `/lib/spec` as typed TypeScript modules (`design.md`'s "content in
  code" principle) — same ids, same structure, per `conventions.md`'s
  naming rules.
- Write the Vitest referential-integrity check from `design.md` §8: every
  subtopic id used anywhere resolves to a real entry in `/lib/spec`.
- Render the topic list (titles, refs, blurbs — no live status yet) on
  `/topic/[topicId]` to confirm the data shape works end-to-end through a
  real page.

**Done when:** all 13 topics render with correct content, and the
integrity test passes (and would fail if a topic id were typo'd).

## 8. Syllabus tracker vertical slice

The reference implementation for "schema → RLS → hook → UI" that later
features repeat. Per `design.md` §6.1 / requirements.md §2.

- Migration + RLS for `subtopic_status` (student-only writes, per
  `design.md` §3.2's example policy).
- `useSetSubtopicStatus` built on task 6's shared mutation pattern.
- `StatusSegmentedControl` component, disabled server-side-verified (not
  just visually) when the logged-in role isn't `student`.
- Wire it into the `/topic/[topicId]` checklist from task 7.

**Done when:** the student account can change a status and see it
persist across reload; the supporter account cannot change it even by
calling the mutation directly (test via browser devtools, not just UI);
both accounts see the same value live via Realtime.

## 9. Status history + supporter flags

Per `design.md` §6.1 / requirements.md §2.

- Migration for `subtopic_status_history`, written alongside every status
  change (extend task 8's hook, same transaction/request).
- "Last touched" date computed from history and shown per subtopic.
- Migration + RLS for `subtopic_flags` (supporter-only writes).
- `SupporterFlag` component: write access gated to the supporter role,
  read access for both, rendered inline in the checklist row.

**Done when:** every status change appears in history with the correct
account attributed; a supporter comment shows up live on the student's
open tab; a student account cannot write a flag.

## 10. Dashboard overview

Per the prototype's `overviewHtml()`, requirements.md's overall product
value.

- Overall progress ring + KPI tiles, computed from `subtopic_status`
  across all topics.
- Topic grid tiles with per-topic progress.
- The "currently studying" focus banner (topic is a manually-chosen
  constant for now, matching the prototype — no "current topic" concept
  exists in the data model yet).

**Done when:** `/` shows live, correct aggregate numbers that update the
moment either account changes a status elsewhere.

## 11. Resource hub

Per `design.md` §6.2 / requirements.md §3.

- Curated links render from `/lib/spec` (already ported in task 7) — no
  new schema needed for these.
- Migration + RLS for `resource_links` (either role writes; delete
  restricted to `created_by = auth.uid()` per `design.md`'s default).
- "Also saved" section on the topic page, visually distinct from the
  curated list, with an add-link form.

**Done when:** either account can add a link and see it appear on the
other's session live; only the account that added a link can delete it.

## 12. Activity trail

Per `design.md` §6.5 / requirements.md §6. Needs at least two kinds of
mutation to already exist to be worth building — hence placed after
tasks 8/9/11.

- Migration for `activity_events`.
- `logActivity()` helper, called from the existing `subtopic_status`,
  `subtopic_flags`, and `resource_links` mutation hooks (retrofit tasks
  8/9/11's hooks to call it).
- Dashboard activity feed component: latest ~20 events, newest first.

**Done when:** performing any of the three actions above produces a
correctly-worded entry in the feed, live on both sessions, attributed to
the right account.

## 13. NEA tracker: schema + CRUD

Per `design.md` §6.3 / requirements.md §4. Marks/section names stay in
`/lib/spec`, not the database.

- Add the six NEA sections' names and marks to `/lib/spec`.
- Migrations + RLS for `nea_state` and `nea_notes` (either role writes).
- `/nea` page: per-section status control, target-date picker, and the
  running notes log (append-only display, newest first — no editing or
  deleting past notes).

**Done when:** either account can set a section's status/date and add a
note; old notes are never overwritten; both sessions see changes live.

## 14. NEA tracker: deadlines + marks estimate

Per `design.md` §6.3 / §9.7.

- One config module holding `NEA_UPCOMING_WINDOW_DAYS = 14` alongside
  (later) `PYTHON_EXEC_TIMEOUT_MS`.
- Marks-worth-complete calculation, joining `/lib/spec`'s marks values
  against live `nea_state` — shown clearly labelled as "marks-worth
  complete," never as a grade.
- Dashboard banner surfacing sections that are upcoming (within the
  window) or overdue.
- Extend task 12's activity trail to log NEA status/note changes.

**Done when:** setting a target date in the past shows the section as
overdue on the dashboard; the marks figure matches a hand-calculated
expectation; NEA edits appear in the activity trail.

## 15. Generalized stepped-exercise interface

Per `design.md` §6.4 / requirements.md §5.5. Build the shared machinery
before either concrete exercise type — this is the deliberate exception
to "don't build for hypothetical futures," so build exactly the interface
both known exercise types need, nothing more.

- The `SteppedExercise<Input, Step>` TypeScript interface.
- The generic `<SteppedTraceForm>` client component: renders one input
  per expected step, runs `isStepCorrect` per step on "Check", highlights
  correct/wrong per cell (matching the prototype's existing trace-table
  styling).
- No real exercises yet — prove it with one trivial fake exercise in a
  test file only.

**Done when:** the fake exercise renders, checks correctly, and has a
Vitest test for its `isStepCorrect`/`computeExpectedSteps` functions.

## 16. Trace-table exercises

Per requirements.md §5.1.

- Port the prototype's three trace-table examples into `/lib/exercises`
  as `SteppedExercise` implementations.
- Wire them into `/practice/theory-of-computation` using
  `<SteppedTraceForm>` from task 15.
- Vitest tests for each example's expected step sequence.

**Done when:** all three exercises are checkable end-to-end in the UI,
matching the prototype's behavior exactly (cell-level correct/wrong).

## 17. FSM engine

Per `design.md` §6.4 / requirements.md §5.2. Logic only, no UI yet.

- A pure function executing an FSM/Mealy transition table symbol-by-symbol
  given an input string, returning the step sequence
  (`{state, output?}[]`) — this is `computeExpectedSteps` for FSMs.
- Port the prototype's two FSM definitions (state/transition data) into
  `/lib/exercises`.
- Vitest tests tracing known inputs against known expected step
  sequences for both machines.

**Done when:** the engine correctly traces both prototype FSM examples
against hand-verified expected outputs, proven by tests alone (no UI).

## 18. FSM exercise UI

Per requirements.md §5.2.

- Port the prototype's SVG state-diagram rendering as a component.
- Wire the FSM engine (task 17) into `<SteppedTraceForm>` (task 15): the
  student enters the state (and output, for the Mealy example) after
  each input symbol, checked step-by-step.
- Add both FSM exercises to `/practice/theory-of-computation`.

**Done when:** both FSM exercises are genuinely step-checkable in the UI
— replacing the prototype's reveal-only answer — matching `design.md`
§6.4's description exactly.

## 19. Glossary drill

Per `design.md` §6.4 / requirements.md §5.3.

- Migration for `glossary_progress`.
- Port the prototype's glossary terms into `/lib/exercises`.
- Flashcard component (flip, "Got it" / "Review again").
- Resurfacing logic: `next_eligible_at` set on mastery, eligible mastered
  terms mixed into the draw at ~1-in-5 frequency.

**Done when:** marking a term "Got it" removes it from the main rotation,
and it reappears in later sessions once 3 days have passed, roughly
1-in-5 draws — confirmed by a Vitest test of the eligibility/mixing logic
with a mocked clock, not just manual observation.

## 20. Python problems: schema + RLS

Per `design.md` §2.2 / §3.2. Schema only — no UI yet, mirrors how the
NEA tables preceded their UI.

- Migrations + RLS for all five tables: `python_problems`,
  `python_test_cases`, `python_submissions`, `python_submission_results`,
  `python_problem_reviews`.
- Confirm the role split directly against the database with each seeded
  account's session: supporter can insert a problem, student cannot;
  student can insert a submission, supporter cannot.

**Done when:** those role-split checks pass, run manually against real
sessions (this is worth doing by hand once, since it's the part most
likely to have a subtle RLS bug before any UI masks it).

## 21. Python problems: authoring + list UI

Per `design.md` §6.7 / requirements.md §8.1.

- `/python/new` (supporter-only, enforced server-side per `design.md`
  §5, not just hidden from nav): form creating a problem plus its test
  cases in one submit.
- `/python` list page: title, due date, and (for now, until task 26)
  a placeholder review-status column.
- Test cases shown in full on the problem — no hidden-case concept, per
  `design.md` §9.1.

**Done when:** the supporter account can create a problem with test
cases; the student account cannot reach `/python/new` even by direct
navigation; the new problem appears in the list for both accounts.

## 22. Python problems: code editor + static detail page

Per `design.md` §6.7.

- Integrate CodeMirror 6 with Python syntax highlighting as a component.
- `/python/[problemId]`: renders the description, test cases, and the
  editor pre-filled with `starter_code` if set — no execution wired up
  yet, this task is purely the page and editor.

**Done when:** the page renders a real problem with a working, syntax
-highlighted, editable code area that does nothing yet on submit.

## 23. Pyodide execution: basic Web Worker

Per `design.md` §6.7. The riskiest new technology in the stack — kept
isolated to its own task before persistence or timeouts are added.

- Web Worker script that loads Pyodide once and keeps it warm.
- Message protocol: main thread posts `{code, input}`, worker returns
  captured stdout or a Python traceback on error.
- `Cross-Origin-Opener-Policy`/`Cross-Origin-Embedder-Policy` headers in
  `next.config.js` (needed later for task 24, cheaper to add now).
- Wire a "Run" button on task 22's page that runs against a single
  hardcoded input and displays raw output/error — no test-case grading,
  no persistence yet.

**Done when:** running a correct program shows its output; running a
program with a bug shows the real Python traceback; Pyodide is not
reloaded on a second run in the same tab.

## 24. Pyodide execution: timeout/interrupt

Per `design.md` §6.7's sequence diagram — the specific mechanism, not a
generic try/catch.

- Set up the `SharedArrayBuffer` + `pyodide.setInterruptBuffer` wiring.
- Main thread starts a timer on each run; if it fires before the worker
  responds, write the interrupt signal into the buffer.
- Handle the resulting `KeyboardInterrupt` in the worker as a distinct
  `timeout` outcome, not a generic error.
- `PYTHON_EXEC_TIMEOUT_MS = 5000` in the shared config module from
  task 14.

**Done when:** submitting `while True: pass` reports "timed out" within
~5 seconds without freezing the tab, and a subsequent normal submission
runs correctly right after (proving the worker/runtime survived the
interrupt rather than needing a reload).

## 25. Python problems: submission persistence + attempt history

Per `design.md` §6.7 / requirements.md §8.3–8.5.

- Extend task 23/24's runner to execute against *every* test case for
  the problem, not one hardcoded input.
- Persist each run as a `python_submissions` row + one
  `python_submission_results` row per test case (student-only writes,
  per task 20's RLS).
- Attempt history list on the problem page: every past submission,
  timestamp, and its per-test-case results, newest first.

**Done when:** a submission is graded correctly against all test cases,
saved permanently (a second visit to the page shows it in history), and
a `timeout`/`error` overall result is stored distinctly from `pass`/
`fail`.

## 26. Python problems: review workflow

Per `design.md` §6.7's derived-status table / requirements.md §8.6.

- "Submit for review" button (student-only) setting
  `submitted_for_review_at`.
- Review form (supporter-only) inserting a `python_problem_reviews` row.
- Derived status computed exactly per `design.md` §6.7's table
  (`not-started` / `attempted` / `submitted-for-review` / `reviewed`) and
  shown on both `/python` (replacing task 21's placeholder column) and
  the problem detail page.

**Done when:** the four-state derived status matches the table in
`design.md` §6.7 for every combination, confirmed with a Vitest test
covering all four conditions directly (not just clicking through the UI).

## 27. Dashboard: Python due-date banner

Per requirements.md §8.1's due-date parity with NEA.

- Extend the dashboard banner from task 14 to also surface
  upcoming/overdue Python problems by `due_date`, reusing the same
  `NEA_UPCOMING_WINDOW_DAYS`-style constant (add a Python-specific one if
  the window should differ — `requirements.md` §10 leaves this open,
  decide here).

**Done when:** a Python problem with a past due date and a non-`reviewed`
status appears in the same overdue banner area as overdue NEA sections.

## 28. Data export

Per `design.md` §6.6 / requirements.md §7. Placed last on purpose — by
now every table in `design.md` §2.2 exists, so the export is complete on
the first attempt rather than needing a revisit once Python was added.

- `/export` route handler querying every table from §2.2 for the
  logged-in account's accessible rows and returning one JSON file.
- "Download my data" button, reachable from the dashboard.

**Done when:** the downloaded JSON contains every subtopic status (with
history), every NEA section's state and notes, every resource link,
every Python problem/submission/review, and glossary progress — spot
-check counts against the database directly.

## 29. End-to-end polish & sign-off

- Write the Playwright flows listed in `design.md` §8 that weren't
  already covered incidentally by earlier tasks' manual "Done when"
  checks: session persistence across a real browser restart, the
  supporter-cannot-write-status check as an automated test (not just the
  manual devtools check from task 8), and the failed-save-shows-retry
  path (simulate by temporarily revoking a policy or mocking the client).
- Walk `requirements.md` top to bottom and confirm each numbered
  requirement has a corresponding done task above — this is the actual
  acceptance check for the whole build, not a formality.
- Re-read `principles.md`'s three non-negotiables against the finished
  app specifically, not against the plan: try to lose data, try to write
  a status as the wrong role, try to fool the FSM/Python checkers.

**Done when:** all of the above hold on the deployed (not just local)
app.

## 30. OCR challenge tables: schema + RLS

Per `design.md` §2.2/§3.2, requirements.md §8.8.

- Migrations for the four new tables: `ocr_challenge_submissions`,
  `ocr_challenge_submission_results`, `ocr_challenge_review_state`,
  `ocr_challenge_reviews` — student-only writes to the first three,
  supporter-only insert to the last, exactly the same pattern as the
  existing `python_*` tables (task 20), minus the column-scoping trigger
  `ocr_challenge_review_state` doesn't need (`design.md` §6.8).
- A migration adding `best_practice_findings text[] not null default '{}'`
  to the existing `python_submissions` table (`design.md` §2.2) — this
  check applies to every submission, not just the new challenge set.
- Confirm the role split directly against the database with each seeded
  account's session, same as task 20: student can insert an
  `ocr_challenge_submission`, supporter cannot; supporter can insert an
  `ocr_challenge_review`, student cannot; student can set
  `ocr_challenge_review_state.submitted_for_review_at` with no other
  column on that row for a student session to abuse (confirm there
  genuinely isn't one, rather than assuming it from the schema alone).

**Done when:** those role-split checks pass, run manually against real
sessions, same rigor as task 20 — schema-only, no UI yet.

## 31. Best-practice / code-quality checker

Per `design.md` §6.7's new bullet, requirements.md §8.10.

- Extend `public/pyodide-worker.js` with a Python-side
  `__check_best_practice(code)` function using the `ast` module: flags a
  submission with no function/class definitions anywhere, non-`snake_case`
  or single-letter identifiers (outside short loop counters), and
  overlong lines.
- Add the `{type: 'check', code}` / `{findings: string[]}` message pair to
  `lib/python/pyodide-protocol.ts` and `lib/python/use-pyodide-worker.ts`.
- Wire it into the *existing* custom-problem flow first
  (`useSubmitPythonCode`/`PythonProblemDetail.tsx`): one `check` call per
  submission, findings persisted into the new `best_practice_findings`
  column and shown as advisory feedback, never affecting `overallResult`.
  Deliberately proved out here, on the flow that already exists end to
  end, before task 35 wires the same checker into the new OCR flow.

**Done when:** submitting a one-liner with a single-letter variable name
and no functions shows both findings; submitting well-structured code
shows none; neither changes whether the submission is marked pass/fail.
Confirmed with a Playwright test against real Python snippets — the
checker's Python-side logic can't be unit-tested in Vitest (no Pyodide
runtime there), per `design.md` §8.

## 32. OCR challenge content: descriptions

Per `design.md` §6.8, requirements.md §8.8. Content only — no test
cases yet (task 34), no UI yet (task 33).

- Create `lib/exercises/ocr-challenges.ts`: the `OcrChallenge` type and
  all 80 entries (`id`, `number`, `title`, `description`, `extensions?`),
  transcribed from OCR's "Coding Challenges Booklet" v3, following
  `conventions.md`'s content-accuracy workflow.
- Extract the one image the booklet contains (the chess piece-movement
  diagram for "Checkmate checker") as a static asset under `public/`,
  referenced via `imageUrl` on that one entry.
- A Vitest structural-validity test: all 80 ids unique, every entry has a
  non-empty title and description, ids follow the `ocr-<slug>` convention.

**Done when:** all 80 titles/descriptions are present and correct against
the source PDF, and the structural-validity test passes.

## 33. OCR challenge list + static detail page

Per `design.md` §6.8, mirrors task 22's "editor + static detail page"
pattern.

- `/python` becomes two visually distinct groups on the same page —
  existing supporter-authored problems, then the fixed OCR set — per the
  curated/personal resource-links precedent (§6.2). Placeholder
  review-status badge for now (real status lands in task 35).
- `/python/ocr/[challengeId]`: renders the challenge's description,
  extensions (if any), image (if any), and a code editor pre-filled with
  `starterCode` if set — no run/submit yet, matching task 22's own scope.

**Done when:** all 80 challenges are reachable and render their correct
content from `/python`; a challenge with no test cases shows no "Run"
affordance at all.

## 34. OCR challenge test cases

Per `design.md` §6.8, requirements.md §8.8. The largest single task in
this list by content volume, not logic — flagged here the same way task
23 flagged Pyodide as "the riskiest," so it isn't mistaken for a
2–4 hour task.

- For each of the ~45–50 challenges identified as genuinely testable via
  a single deterministic stdin/stdout run (`design.md` §6.8), hand-derive
  at least one correct `{input, expectedOutput}` pair directly from the
  challenge's own description — OCR publishes no solutions, so every one
  must be independently worked out and verified, the same rigor already
  applied to the FSM/trace-table exercises' expected answers.
- Add `testCases` to those entries in `lib/exercises/ocr-challenges.ts`.
  Leave every challenge in the non-testable/non-unique-output groups
  (`design.md` §6.8) with `testCases` omitted entirely.

**Done when:** every testable challenge's own worked solution actually
passes its own test case when run through the real execution pipeline
(task 31's checker doesn't apply here — this is about correctness, not
style), and the structural-validity test from task 32 still passes with
the new data.

## 35. OCR challenge execution, grading & review

Per `design.md` §6.8, mirrors tasks 25/26 collapsed into one task since
the execution engine, timeout handling, and review-status derivation are
all being reused unchanged, not rebuilt.

- `lib/db/use-ocr-challenge-submissions.ts` and
  `lib/db/use-ocr-challenge-reviews.ts`, mirroring
  `use-python-submissions.ts`/`use-python-reviews.ts` exactly except for
  the `challenge_id: text` key.
- Wire "Run" (grading against every test case, task 31's best-practice
  check, attempt history) and "Submit for review" + the review form into
  `/python/ocr/[challengeId]`, reusing `deriveReviewStatus()`
  (`lib/exercises/python-review-status.ts`) unchanged, per `design.md`
  §6.8.
- Replace task 33's placeholder review-status badge on `/python`'s OCR
  group with the real derived status.

**Done when:** a testable challenge is graded correctly against all its
test cases and the result is saved permanently; a non-testable challenge
has no "Run" button and its submission goes straight into the
not-started → attempted → submitted-for-review → reviewed progression;
both visible live on the supporter's session — matching task 26's own
done-when, but for the new tables.

## 36. Code submission via file upload

Per `design.md` §6.7, requirements.md §8.9.

- Add an "Upload .py file" control to the shared code-editor area: reads
  the file's text client-side (the browser's File API) and replaces the
  editor's current value, exactly as if typed. No new endpoint, no
  server-side storage.
- Applies to both `/python/[problemId]` and `/python/ocr/[challengeId]` —
  a single shared change, not two.

**Done when:** uploading a `.py` file populates the editor with its exact
contents, editing it afterward works normally, and the resulting
submission is indistinguishable in the database from one that was typed
or pasted.

## 37. End-to-end polish & sign-off (OCR challenge set)

Per `design.md` §8, mirrors task 29 for this feature specifically.

- Walk requirements.md §8.8–§8.10 top to bottom against the finished app,
  the same acceptance-check standard as task 29.
- Spot-check a sample of the 80 imported descriptions and a sample of the
  hand-derived test cases directly against the source PDF, since nothing
  automated can catch a transcription or derivation error.
- Full Playwright coverage for the new flows: the two-group list page, a
  non-testable challenge's manual-review-only path, a testable
  challenge's full grading + review cycle, the best-practice checker on
  both problem sources, and file upload.

**Done when:** all of the above hold, and `steering/tasks.md` reflects
every task in this list checked off.
