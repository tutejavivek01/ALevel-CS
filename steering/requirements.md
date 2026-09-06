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
