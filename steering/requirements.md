# Requirements

Derived from the interview on 2026-09-05. Read alongside `product.md`
(scope), `principles.md` (non-negotiables), and `tech-stack.md` /
`conventions.md` (implementation). Where a decision below trades off
against a principle or a stack choice, the reasoning is included so a
later change can be made deliberately rather than by drift.

## 1. Actors & roles

Exactly two roles, both backed by real Supabase Auth accounts. No
provision for a third role/account for now (confirmed) — the data model
should not be blocked from adding one later, but nothing should be built
in anticipation of it.

- **Student** — owns her own self-assessment. Only the student can set
  subtopic confidence status. She can also: add shared resource links,
  edit NEA fields, attempt all practice exercises, use the glossary drill.
- **Supporter** (parent) — can see everything the student sees, but
  **cannot** set subtopic confidence status directly. Instead the
  supporter can attach a short text comment to a subtopic ("flag"),
  visible inline next to that subtopic's status control. The supporter can
  also edit NEA fields, add shared resource links, and attempt practice
  exercises themselves.

There is **one shared progress record**, not two per-user records — both
accounts read and write the same underlying data (subtopic statuses, NEA
state, flags, glossary mastery). Roles constrain *which fields* an
account can write, not which data it can see. This mirrors the
prototype's single shared document, just with field-level permission
instead of anyone-writes-anything.

Sessions are long-lived (weeks/months) on both accounts — this is a
private tool on personal devices, not a shared kiosk, so session
friction is treated as pure cost with no security benefit worth trading
for it.

## 2. Syllabus tracker (4.1–4.13)

- Per-subtopic status: `not-started` / `learning` / `practising` /
  `confident`, student-writable only, as today.
- **Status history is tracked**, not just current value: every status
  change is recorded with a timestamp and which account made it. This
  enables:
  - a "last touched" date shown per subtopic,
  - a rough trend view of progress over the two-year course.
  - This was deliberately chosen over current-value-only because it's
    cheap to capture from day one and effectively impossible to
    reconstruct later if skipped.
- **No automatic decay or staleness flagging.** A subtopic marked
  `confident` stays `confident` indefinitely regardless of how long ago
  that was. (History is still recorded per above — it's just not acted
  on automatically. A future feature could read the history to build a
  staleness view without needing new data.)
- **Supporter flags**: a short text comment attachable to any subtopic by
  the supporter account, shown inline. No separate notification channel —
  visibility is via the activity trail (§6) and the inline comment itself.
- **Concurrency**: last write wins, with both accounts' views live-updated
  via Supabase Realtime. No conflict detection/merge UI — with exactly two
  known collaborators, the odds and cost of a genuine simultaneous
  collision on the same control are low enough that resolving it isn't
  worth the complexity.
- Subtopic checklist content (topic titles, item text) is fixed,
  code-maintained reference data — not user-editable in the app. See
  `principles.md` §2 and `conventions.md`'s content-accuracy workflow.

## 3. Resource hub

Two distinct link lists per topic, kept visually separate so the
curated/trusted set never gets diluted:

- **Curated links** (AQA spec, Isaac CS, Craig 'n' Dave, PMT, Save My
  Exams, Seneca, Codewars, etc.) — fixed, code-maintained, ported directly
  from the prototype's `RES` table.
- **Shared personal links** — either account can add a link to a topic
  in-app (e.g. a URL + short label). Visible to both accounts, editable
  only by whoever added it (or deletable by either — TBD in design, not
  a requirements-level decision). Not merged into the curated list, not
  moderated or reviewed.

## 4. NEA tracker (§4.14)

Six sections, matching AQA's actual mark scheme (confirmed against the
prototype's breakdown, not the "five" originally recalled):

| Section | Marks |
|---|---|
| Analysis | 9 |
| Documented Design | 12 |
| Technical Solution — Completeness | 15 |
| Technical Solution — Techniques Used | 27 |
| Testing | 8 |
| Evaluation | 4 |

(Total 75. `product.md`'s open question on this is now resolved — see
that file's changelog note.)

- Per-section fields: status (`not-started` / `in-progress` / `drafted` /
  `complete`), target date, and notes. All fields editable by **either**
  role — unlike subtopic confidence, NEA progress is a jointly-managed
  project, not a pure self-assessment.
- **Notes are a running log**, not a single overwritten field: each note
  is timestamped and attributed to the account that wrote it, and old
  notes are kept (e.g. "still deciding on the project idea" →
  "started analysis" stays visible as history), not replaced.
- **Deadline surfacing**: the dashboard proactively shows NEA sections
  that are upcoming or overdue against their target date:
  - *Upcoming*: target date within the next 14 days and status is not
    `complete`.
  - *Overdue*: target date has passed and status is not `complete`.
  - (Thresholds are a starting proposal, not sacred — adjust if 14 days
    turns out to be noisy or too quiet in practice.)
- **Weighted completion estimate**: shown as e.g. "≥ 24/75 marks-worth
  complete." Only sections with status `complete` count toward the
  numerator — `drafted`/`in-progress` sections count as 0. This is
  deliberately a floor, not an interpolated estimate, and must be labelled
  as "marks-worth of sections complete," never as a predicted grade —
  directly to avoid the false-precision problem the non-estimate option
  was weighed against.

## 5. Unit 2 (Theory of Computation) practice

### 5.1 Trace tables
Unchanged in spirit from the prototype: student fills in per-step
expected values, checked cell-by-cell against a real computed answer.
Preserve this mechanism as-is (principles.md §3 already treats it as
correct).

### 5.2 Finite state machines — now genuinely checkable
Replace the prototype's "reveal a written answer" pattern with a
**step-through trace**: for a given input string, the student enters the
resulting state after each symbol is consumed (and the output, for Mealy
machines), and each step is checked against the actual FSM definition —
not just the final state. This tests the trace skill itself, matching how
trace-table exercises already work, rather than letting a correct final
answer mask an incorrect method (or vice versa).

### 5.3 Glossary drill
"Got it" no longer removes a term from rotation permanently. Mastered
terms move to a lighter rotation and **resurface for spaced review**:
proposed starting rule — a mastered term is eligible to reappear once at
least 3 days have passed since it was last shown, and when eligible, is
interleaved into the main deck at roughly 1-in-5 card frequency. This is
a simple heuristic, not a full spaced-repetition/Leitner system — cheap
enough to tune later if 3 days / 1-in-5 turns out wrong in practice.

### 5.4 Exercise content pipeline
Exercise definitions (trace tables, FSM machines, glossary terms) live as
structured data files in the repo (per `conventions.md`'s
`/lib/exercises`), not in the database and not behind an in-app authoring
UI. Adding a new question is a normal code change: edit/add a data entry,
open a PR, get it reviewed for correctness (per the content-accuracy
workflow), merge, auto-deploy. This gives "add a question without
touching application logic" without building a CMS, which would conflict
with product.md's "not a content-authoring platform" non-goal.

### 5.5 Exercise system architecture — generalized now
Although only Unit 2 has exercises today, the exercise/checker
architecture is built generically from the start: a common interface
covering "a sequence of expected steps + a way to check a student's step
against it" that trace-tables and FSM-traces both already implement, so a
future unit's exercises (e.g. Fundamentals of Algorithms) can plug into
the same checker/UI machinery without a rewrite. This is a deliberate
exception to principles.md's usual "don't build for hypothetical futures"
— chosen explicitly rather than defaulted into, because the two exercise
types already need the same shape of interface today, so generalizing
costs little extra now versus refactoring two bespoke implementations
apart later. Scope discipline still applies: build the two Unit 2
exercise types fully; build the shared interface they both already need;
do **not** pre-build UI or content for units that have no exercises yet.

## 6. Activity trail

A simple, human-readable feed (dashboard-level, most-recent-first) built
from the same history already being recorded for status changes,
supporter flags, and NEA field edits. Purpose: make the supporter's
flags/comments and the joint NEA edits visibly attributed and timestamped
("Dad flagged 4.2 Stacks, 3 days ago") — otherwise a two-role permission
model provides no visible benefit over a single shared account. Not a
full audit-log UI; a short recent-activity list is sufficient.

## 7. Data export

A simple export action (e.g. "download my data as JSON") covering the
full shared progress record: subtopic statuses + history, NEA sections +
notes log, flags, glossary mastery state. This is independent of
whatever the database provider's own backup story is — cheap insurance
that directly backs principles.md §1 ("data is never silently lost"), by
ensuring recoverability doesn't depend solely on trusting one vendor.

## 8. Python practice problems (parent-assigned)

Added 2026-09-05. This is a deliberate, narrow exception to `product.md`'s
"no assignment-setting" non-goal — scoped to one parent assigning Python
problems to one student, not general classroom/assignment infrastructure.
See `product.md`'s non-goals section for the accompanying caveat.

### 8.1 Problem definition
Parent-authored, consisting of:
- Title and a plain-text description/spec of what the program should do.
- One or more **test cases**, each an input (stdin, may be empty) and
  expected output (stdout). Validation is test-case based, as chosen in
  the interview: every submission is automatically run against all of a
  problem's test cases and marked pass/fail per case.
- Optional due date, following the same upcoming/overdue surfacing
  pattern already used for NEA target dates (§4), but per-problem rather
  than per-project-section.
- Optional starter code the student's editor is pre-filled with — see
  open item in §10.

(A second, fixed source of problems — an exam board's published
challenge set — is also available; see §8.8.)

(As of §8.11, this ad hoc source itself is retired from the visible
product surface — the OCR set is now the sole source presented to
users. §8.1–§8.7 remain here as the historical description of the
retained-but-hidden data model.)

### 8.2 Execution model
Code runs entirely **client-side via Pyodide** (a WebAssembly Python
interpreter) inside the student's browser. No server ever executes
untrusted code, so there is no server-side sandboxing infrastructure to
build or secure — this was chosen explicitly over a third-party judge API
or a self-hosted sandboxed runner, either of which would add an external
dependency or real security-sensitive infrastructure disproportionate to
a two-person tool.

- Execution **must run inside a Web Worker**, not the main thread — this
  is what makes the hard timeout in §8.4 actually interruptible without
  freezing the page.
- No additional module/import allow-list is needed beyond what Pyodide's
  WebAssembly sandbox already prevents (no real filesystem or network
  access from submitted code) — an assumption following directly from
  the execution model, not a separately interviewed decision.

### 8.3 Validation & feedback
- Each submission runs against every test case for its problem; the
  result is pass/fail per case, with actual-vs-expected output shown for
  any failing case.
- Runtime and syntax errors are shown as the real Python error/traceback
  the interpreter raises. This is deliberate — genuine feedback over a
  cleaned-up or decorative message, consistent with `principles.md` §3's
  standard for practice exercises generally.

### 8.4 Timeout handling
A hard execution timeout (a few seconds) is enforced on every run,
reported to the student as a distinct outcome from a normal error or a
failing test case (**"timed out"**, not "wrong answer" or "crashed") —
an unconstrained loop must never be able to hang the page, and a timeout
says nothing about correctness the way a wrong answer does.

### 8.5 Attempt history
Every submission (code + timestamp + per-test-case result) is stored and
never overwritten, consistent with `principles.md` §1 and the
history-tracking already used for subtopic status (§2). This lets the
parent see the trajectory of attempts on a hard problem, not just the
final one.

### 8.6 Review workflow
Each problem carries a review status, separate from its test-case
pass/fail results — proposed states: `not-started` / `attempted` (at
least one submission exists) / `submitted-for-review` (student marks it
ready) / `reviewed` (parent has responded). The parent can attach a
feedback comment to a problem, reusing the same supporter-comment
mechanic already defined for subtopic flags (§2) — one consistent
"leave a note" pattern across the app rather than two different ones.

### 8.7 Relationship to the rest of the app
- Lives in its own standalone **"Python Practice"** section, not attached
  to specific 4.x spec topics, per the interview.
- Does **not** affect subtopic confidence status in the syllabus tracker,
  automatically or via a suggested nudge — kept as a fully separate
  signal, preserving the student's self-assessment as the sole authority
  over that status (§1, §2).

### 8.8 Fixed OCR challenge set

Added 2026-09-09. In addition to problems the supporter authors ad hoc
(§8.1–§8.7), the Python Practice section also offers a **fixed,
exam-board-published set**: all 80 challenges from OCR's "Coding
Challenges Booklet" (GCSE/A Level Computer Science, v3, ocr.org.uk). This
is fixed, code-reviewed reference content, not parent-authored — it
follows the same "content in code, not the database" pattern already used
for the 13 spec topics, the 6 NEA sections, and every existing Unit 2
exercise (trace tables, FSM machines, glossary terms), rather than going
through the supporter's problem-authoring form. The two problem sources
coexist in the same Python Practice list, visually distinguished — the
same "two distinct lists, kept visually separate" treatment already used
for curated vs. personal resource links (§3). Nothing about the existing
supporter-authored flow changes; this adds a second, fixed source
alongside it. **Superseded by §8.11**: the supporter-authored source
is subsequently retired from the visible product surface, so Python
Practice now shows a single list (the OCR set only) rather than two.

- All 80 challenges are imported with their full description text.
  Where a challenge lists optional "Extensions," they're shown as
  stretch-goal notes within the same problem, not spun out into
  separate gradable challenges. The booklet's one diagram (a chess
  piece-movement illustration for "Checkmate checker") is **not**
  reproduced as an image asset, updated from the original plan here: no
  PDF image-extraction tool was available in the build environment, so
  standard chess piece movement is spelled out as text in that
  challenge's description instead (documented in
  `lib/exercises/ocr-challenges.ts`'s header comment) — arguably more
  usable for deriving test cases than a cropped image would have been
  anyway.
- OCR's booklet explicitly does not publish solutions ("there are many
  ways in which these problems could be solved") and recommends A-Level
  solutions include a GUI. Neither changes this app's execution model:
  every problem still runs headless via the existing Pyodide/stdin-stdout
  pipeline (§8.2) regardless of level, and every test case for the
  auto-gradable subset below has to be hand-derived from the problem
  description and verified for correctness during build — the same rigor
  already applied to the FSM and trace-table exercises' expected answers.
- Not every challenge can be meaningfully auto-graded in this execution
  model. Of the 80, **22** ended up with real test cases and
  auto-grading exactly like a parent-authored problem — updated from
  the original "roughly 45–50" estimate once the actual derivation work
  was done: OCR's prose leaves the exact input/output format
  unspecified for most challenges (e.g. "makes a table" or "spell out a
  number"), and exact-match grading against a format this app invented
  would unfairly fail a correct solution that reasonably chose a
  different one — exactly the "genuinely checkable, not decorative" bar
  `principles.md` §3 sets. The 22 are the ones where a single,
  unambiguous contract could be stated plainly (see each one's "For
  this app:" paragraph in `lib/exercises/ocr-challenges.ts`). The rest
  are **description-only, manual-review problems** (no test cases, no
  "Run" grading — code goes straight to the existing review workflow,
  §8.6, same as any problem with zero test cases already behaves
  today):
  - Challenges that cannot run at all in a browser/Pyodide sandbox with no
    display and no real network access — anything requiring a GUI, an
    animation or graphical output (fireworks, the Mandelbrot set, Conway's
    Game of Life, a semaphore animation), live web scraping or network
    calls (the page-scraper and "Beautiful soup" challenges), or
    video/GIF processing.
  - Challenges whose correct output isn't unique or exactly matchable even
    though they're otherwise deterministic and CLI-shaped — e.g. a random
    password generator, Goldbach's conjecture (multiple valid prime pairs
    sum to the same target), or a "minimum transfers" problem with more
    than one valid solution. Checking a *property* of the output (e.g. "is
    prime and sums to N") instead of an exact string match is a deliberate
    non-goal for this pass (see §9/§10) — a possible future extension, not
    built now.
- The fixed set's mutable state (a student's submissions, test-case
  results, code-quality check results, review status) is keyed to a
  code-defined challenge id rather than a supporter-created database row,
  so it needs its own progress-tracking schema at the design stage — not a
  reuse of the parent-authored `python_problems`/`python_test_cases`
  tables, which assume every problem is a row someone inserted. This
  mirrors how `subtopic_status` already keys off a code-defined
  `subtopic_id` slug rather than a foreign key.

### 8.9 Code submission via file upload

Added 2026-09-09. In addition to typing/pasting code directly into the
editor (unchanged), a student can attach a local `.py` file, whose
contents are read into the same editor — there's no separate
upload-and-submit path and no server-side file storage; the uploaded text
becomes the editor's content exactly as if it had been typed or pasted,
then flows through the existing Run/Submit pipeline unchanged. Scoped to a
single file, matching how every booklet challenge is a single
self-contained script — not a multi-file project or zip upload.

### 8.10 Best-practice / code-quality check

Added 2026-09-09. Every submission (for any problem, parent-authored or
from the fixed set) is also checked against a small set of Python
best-practice rules, shown as separate, clearly-labelled feedback
alongside the pass/fail test-case results — it never changes whether a
submission counts as `pass`/`fail`/`timeout`/`error` (§8.3–§8.4). This is
deliberately advisory, matching how a real code review separates "does it
work" from "is it well written."

Checked via a small custom rule-set built on Python's own `ast` module
(already available in the same Pyodide runtime that executes submissions —
no extra download), not a third-party linter: this Pyodide build's package
set doesn't include pyflakes/pylint/flake8/pycodestyle, so using one of
those would mean fetching it from PyPI over the network at submission
time — the same kind of external runtime dependency this app deliberately
avoided by self-hosting Pyodide's own assets (tech-stack.md, task 23). The
initial rule set prioritises what the interview identified as most
important for this app's audience:

- **Decomposition & functions**: flags a submission with no function (or
  class) definitions at all — OCR's own booklet introduction encourages
  "use of OOP methodologies," and nearly every challenge naturally
  decomposes into functions.
- **Naming & readability**: flags non-`snake_case` function/variable
  names, single-letter identifiers outside short loop counters, and
  excessively long lines.

Error-handling/robustness checks (e.g. bare `except:`, unvalidated
`input()`) and anti-pattern checks (magic numbers, duplicated code, unused
variables/imports) were considered and explicitly deferred — not because
they're less valid, but to keep the first version's rule set small and its
false-positive rate low. Either can be added later as an incremental
change to the same rule-set module, not a redesign (§10).

### 8.11 Retiring the ad hoc ("custom") problem source

Added 2026-09-09. Superseding §8.1–§8.7's "parent-authored" framing:
that ad hoc problem-creation flow is retired from the visible Python
Practice surface. Only the fixed OCR challenge set (§8.8) is shown to
either account going forward — no "create a problem" entry point, and
the ad hoc list no longer appears alongside the OCR list. §8.8's opening
paragraph's "two distinct lists, visually separate" framing is superseded
by this note: Python Practice now presents a single list.

This is a removal from the *product surface*, not a data-destructive
change: existing custom problems, their test cases, submissions, and
reviews already in the database are retained rather than deleted,
preserving `principles.md` §1's no-silent-data-loss guarantee and leaving
the door open to reintroduce the feature later without a migration.
Exactly how "hidden but retained" is implemented (route removed vs.
simply unlinked from navigation, whether the creation form stays in the
codebase unused) is a design-time decision (§10), not a requirements-level
one — mirroring how §8.8's own visual-treatment question was deferred to
design.

### 8.12 Saved code versions (OCR challenges)

Added 2026-09-09. In addition to the existing Run (test-case grading,
§8.2–§8.4) and Submit-for-review (§8.6) actions, a student can explicitly
**Save** their current code on any OCR challenge at any time —
including challenges with no test cases (§8.8's manual-review-only
subset, which today has no way to persist code at all) and code that
doesn't run cleanly yet. Each Save creates a new, permanent **version**: a
snapshot of the code at that moment, never overwritten — the same
append-only principle already used for attempt history (§8.5) and status
history (§2). Save is deliberately independent of Run: saving never
requires the code to compile or pass, so a student mid-attempt can
checkpoint partial work. Whether a Run should *also* implicitly create a
Save version (so a graded attempt is never lost even if the student
never clicks Save) is a design-time question, not decided here (§10).

- Every version records: the code itself, who saved it, when, and — if
  the code doesn't run cleanly when saved — the resulting Python
  error/traceback, shown the same honest, uncleaned way runtime errors
  are already displayed elsewhere (§8.3). A version whose code runs
  cleanly simply has no error recorded.
- **Both accounts can see the full version history, including the actual
  code of every version** — not just result metadata the way today's
  attempt history does. This closes a real gap: today's attempt history
  shows only a pass/fail badge and a timestamp, never the code text
  itself, so a supporter reviewing a student's work can't actually read
  what they wrote.
- The supporter can leave a **comment on any individual saved version**,
  not just on the challenge as a whole — an evolution of the existing
  supporter-review mechanic (§8.6/§8.8): instead of one feedback thread
  tied to the whole challenge, feedback attaches to the specific attempt
  it responds to (e.g. "this version's loop handles the edge case at
  n=0 better than your last one"). Whether the challenge-level `reviewed`
  status (§8.6's four-state model) now means "every version has a
  comment" or keeps its current "at least one comment exists anywhere"
  meaning is a design-time decision (§10).
- Scoped to the OCR flow only, since it's now the sole visible problem
  source (§8.11).

### 8.13 Due dates on OCR challenges

Added 2026-09-09. Either account — student or supporter — can set or
change a due date on any OCR challenge. This is a genuine departure from
every other piece of OCR mutable state (§8.8/§8.12), which is strictly
student-writes/supporter-reviews: a due date is **jointly editable by
both roles**, the same joint-ownership model already used for NEA section
fields (§4) rather than a one-way "parent assigns" relationship. This
reflects that with a fixed, exam-board-published challenge set, neither
account "owns" a given challenge the way a supporter owned a
custom-authored problem's due date (§8.1). There is exactly one shared
due date per challenge, not a separate one per account — consistent with
§1's "one shared progress record" principle and how the rest of OCR
challenge state (§8.8) already works.

- A challenge with no due date set shows no deadline indicator.
- A challenge whose due date is upcoming is shown neutrally, reusing the
  same upcoming/overdue surfacing pattern already established for NEA
  sections (§4) and the (now-retired, §8.11) parent-authored Python
  problems (§8.1) — not a new pattern.
- A challenge whose due date has passed **and is not yet `reviewed`**
  (§8.6/§8.12's status model) is flagged with a visually distinct color —
  mirroring NEA's "status is not complete" condition (§4) so a challenge
  the supporter already reviewed doesn't keep nagging as overdue.
- Added 2026-09-10. The due date can be set or changed straight from the
  `/python` list row, not only from the challenge's own detail page — the
  per-row deadline indicator doubles as an inline editable control, so
  assigning dates across several challenges at once doesn't mean opening
  each one. Still one shared date per challenge, still jointly editable by
  either role.
- Whether this also feeds the existing dashboard overdue banner
  (currently populated from NEA sections and parent-authored Python
  problems) alongside the on-challenge flag is a design-time decision
  (§10) — the requirements-level need is just that overdue is visually
  distinguishable somewhere the student/supporter will see it.

### 8.14 Filtering the OCR challenge list

Added 2026-09-10. The `/python` list of all 80 challenges (§8.8) gets a
plain text box at the top that narrows the list as you type: a challenge
stays visible if what you typed appears, case-insensitively, anywhere in
its booklet number, title, or description. An empty box shows all 80; a
query that matches nothing shows a short "nothing matches" note rather
than a blank card. No category facets, no saved filters, no ranking — a
find-as-you-type convenience over a fixed, known set, not a search
surface over open-ended content.

## 9. Explicitly out of scope for this pass

Carried over from `product.md`'s non-goals, restated as requirements-level
exclusions so they aren't accidentally reintroduced during design:

- No in-app authoring/editing UI for the curated resource list or the
  spec checklist content itself — both stay code-maintained.
- No mark/grade prediction beyond the single labelled NEA
  marks-worth-complete figure in §4.
- No support for a third account/role.
- No offline mode / PWA installability.
- No full audit log beyond the lightweight activity trail in §6.
- No file/network I/O in Python practice problems — Pyodide's browser
  sandbox doesn't provide real filesystem/network access, so problems
  are scoped to pure stdin/stdout logic (§8).
- No general-purpose classroom/multi-student assignment features — §8
  remains one parent assigning problems to one student, not a rubric or
  grading system for a class.
- Property/pattern-based auto-grading (checking a computed property of a
  submission's output rather than an exact string match) — deferred per
  §8.8; the handful of otherwise-CLI-shaped OCR challenges with
  non-unique correct output are treated as manual-review-only instead.
- Per-account (student vs. supporter) separate due dates, or separate
  version/comment histories, on an OCR challenge — there is exactly one
  shared due date and one shared version history per challenge, not a
  per-account copy (§1, §8.12, §8.13).

## 10. Open items for design/build phase (not blocking, flagged for later)

- Exact deletion permission for shared personal resource links (added-by
  only, or either account) — noted in §3 as a design-time decision.
- Whether the 14-day "upcoming NEA" and 3-day/1-in-5 glossary-resurfacing
  thresholds need to be configurable or are fine hardcoded.
- Whether flag comments (§2) support any resolution state (e.g.
  "acknowledged/dismissed") or persist indefinitely once added.
- Whether Python problems need starter code / a pre-filled stub, or
  students always start from a blank editor (§8.1).
- Whether `submitted-for-review` (§8.6) is a manual student action, or
  triggered automatically once all test cases first pass.
- Whether per-problem due-date thresholds should reuse the NEA's 14-day
  "upcoming" window or use a shorter one suited to smaller practice
  tasks (§8.1).
- Whether the deferred best-practice rules (error handling,
  anti-patterns) or property-based grading (§8.8/§8.10) get added in a
  later pass.
- Exact visual treatment distinguishing the fixed OCR set from
  parent-authored problems in the `/python` list (badge vs. section
  grouping, etc.) — a design-time decision, not a requirements-level one.
- Whether OCR's listed "Extensions" ever become their own gradable
  sub-challenges rather than stretch-goal notes.
- Exactly how "hidden but retained" is implemented for the custom
  problem source — route removal vs. unlinking, whether the creation
  form/tests stay in the codebase unused (§8.11).
- Whether a Run should also implicitly create a Save version (§8.12).
- Whether `reviewed` status now requires a comment on every version, or
  keeps its current "any comment anywhere" meaning (§8.12).
- Where saved-version code is displayed in the UI (inline expandable
  list vs. a separate view) and whether a diff between versions is
  worth showing (§8.12).
- Whether the OCR due-date flag also feeds the existing dashboard
  overdue banner, and whether it reuses the 14-day "upcoming" window
  already used elsewhere (§4/§8.1) or a different one (§8.13).
