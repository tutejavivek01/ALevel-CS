# Design — Exam Question Bank

Translates `specs/exam-question-bank/requirements.md` into a concrete
shape, on top of `steering/design.md` §6.13 (the mastery gate this is the
third route for). Section numbers below cross-reference that
requirements.md's own `§N` numbering.

## 1. Content — content-in-code, no DB rows for question text (req. §1.1)

`lib/exercises/exam-question-bank.ts` imports
`reference/aqa_cs_question_bank.json` directly (Next.js/TypeScript import
JSON natively — no loader, no build step) and re-exports it through a
typed surface that accounts for the file's two real structural quirks
(verified by direct parse, not assumed from the schema description):
appendices are flat chapter-shaped objects, not nested under a `.chapters`
array the way `sections[i].chapters` is; and a part can be missing its
`marks` key entirely (not just `null`).

```ts
export type ExamQuestionPart = {
  part: string;
  text: string;
  marks?: number;          // absent, not null, when unreadable
  marks_unreadable?: boolean;
};
export type ExamQuestion = {
  id: string;               // stable, e.g. 'ch1-q2', 'appA-q1'
  number: number;
  pdfPage: number;
  sourceExam?: string;
  stem?: string;
  text?: string;             // present instead of stem+parts, single-part
  parts?: ExamQuestionPart[];
  marks: number;             // sum of readable marks
  marksPartial?: boolean;
  marksUnreadable?: boolean;
  hasFigure?: boolean;
  needsReview: boolean;
};
export type ExamChapter = {
  chapter: number | string;  // string for 'Appendix A' / 'Appendix B'
  title: string;
  specArea: string;          // '4.1' - joins to Topic.ref
  level: 'AS / A Level (Year 12)' | 'A Level (Year 13)';
  questions: ExamQuestion[];
};

export const EXAM_CHAPTERS: ExamChapter[];  // flattened: sections + appendices
export function getExamChaptersForTopic(topicRef: string): ExamChapter[];
export function getExamQuestionById(id: string): ExamQuestion | undefined;
```

`getExamChaptersForTopic` is the join point behind requirements.md §1.2 —
it does the `chapter.specArea === topic.ref` filter once, so every UI
consumer (the topic page's tab list, the progress summary, the confident-
gate threshold check) shares one implementation rather than re-filtering
the raw JSON in three places.

## 2. Schema — the one deliberate exception to "attempts are pure inserts"

Every other attempt-history table in this schema (`ocr_challenge_
submissions`, `mastery_attempts`, §6.13) is insert-only: the whole row is
known at the moment it's created. This feature can't do that, because
requirements.md §4.5 requires the submitted answer to be durable *before*
marking is even attempted, and marking is an asynchronous external call
that can fail after the row would otherwise need to exist. So this is a
two-phase write — insert, then update the same row — and the schema/RLS
have to allow it explicitly:

```sql
-- One row per submitted answer to one part (or a whole question with no
-- parts). question_id/part are code-defined refs into
-- lib/exercises/exam-question-bank.ts, not foreign keys. topic_id is
-- denormalised from the question's spec_area at insert time so every
-- query (progress, gate threshold) filters by topic without re-deriving
-- it from the content module on every read.
exam_question_attempts (
  id              bigserial primary key,
  question_id     text not null,
  part            text not null default '',  -- '' for a no-parts question
  topic_id        text not null,
  student_id      uuid not null references profiles(id),
  answer          text not null,
  marking_status  text not null default 'pending'
                    check (marking_status in ('pending','marked','unmarkable','failed')),
  awarded         int,
  max             int,
  credited        text[],
  missed          text[],
  model_answer    text,
  misconceptions  text[],
  confidence      numeric,
  created_at      timestamptz not null default now(),
  marked_at       timestamptz
)
```

RLS:
- `insert`: `is_role('student')`, `with check (student_id = auth.uid())`.
- `update`: `using (student_id = auth.uid()) with check (student_id =
  auth.uid())` — an **owner check, not a role-scoping trigger**. This is
  simpler than `guard_ocr_challenge_review_state_supporter_write` because
  that trigger exists to let two *different* roles co-own separate columns
  of one row; here the same student is the only party who ever updates her
  own row (moving it from `pending` to a terminal `marking_status`), so a
  plain ownership check is enough — no column-scoping needed.
- `select`: open to both roles (§5.3 — the supporter reads history, never
  attempts).
- No `delete` policy — a `failed` row stays visible as a real, honest part
  of history (requirements.md §4.5), never silently removed.

This is the one place in the whole schema where an attempt row is
mutated after creation — call it out plainly in code review as the
deliberate exception it is, not a drift from the append-only convention.

## 3. Marking route (req. §4)

`app/api/exam-questions/mark/route.ts` — a Next.js Route Handler, POST
only. Request body: `{ questionId: string; part: string; answer: string }`.

Server-side flow, in order:

1. **Auth check** — `createClient()` (server client), reject with 401 if
   no session (req. §1.4/§4.1).
2. **Look up question/part content from the code-defined bank on the
   server** (`getExamQuestionById`), never trust client-supplied question
   text — this both prevents a tampered request from feeding the marker
   fabricated context and means the client payload can stay tiny.
3. **Answer-dedup check** (req. §4.6) — query
   `exam_question_attempts` for the same `student_id`/`question_id`/`part`
   with `marking_status = 'marked'` and a normalised (trimmed) answer
   match. If found, skip straight to step 6 with the cached result instead
   of calling Claude.
4. **Insert** the attempt row immediately, `marking_status: 'pending'` —
   this is the durability point requirements.md §4.5 requires; everything
   after this can fail without losing the student's answer.
5. **Call Claude** (`claude-opus-5`, per `specs/exam-question-bank/
   requirements.md` §4.2) with Structured Outputs
   (`output_config.format`) constraining the response to the exact
   `{awarded, max, credited, missed, model_answer, misconceptions,
   confidence}` shape from requirements.md §4.3. System/user content
   assembles: chapter title, spec area, stem, this part's text and mark
   allocation (or an explicit "marks unknown" note per §2.6/§4.2), sibling
   parts for context, and the student's answer — plus the marking-standard
   instructions from requirements.md §4.4 (AQA-standard, credit valid
   alternative phrasing, never inflate, never credit unwritten content,
   and — for a `needsReview` question whose marking genuinely depends on
   the missing figure — say so and return `awarded: 0` alongside an
   explicit unmarkable signal rather than guessing).
6. **Update** the row: on a valid structured response, `marking_status:
   'marked'` + the result fields + `marked_at`; on an explicit
   figure-dependent-unmarkable response, `marking_status: 'unmarkable'`;
   on any API failure (typed exception chain — rate limit vs. auth vs.
   connection vs. generic, per the claude-api skill's guidance) or a
   response that fails schema validation, `marking_status: 'failed'`.
7. Return the final row to the client. The client's retry action for a
   `failed` row (req. §4.5) re-POSTs the same `questionId`/`part`/`answer`
   — it does not need a separate "retry" endpoint.

Reused, not reinvented: the auth pattern from `app/export/route.ts`
(the app's only prior route handler), and the "typed exception chain,
most-specific-first" error handling the claude-api skill documents.

## 4. Progress and gate-threshold computation (req. §5)

`lib/exercises/exam-question-progress.ts` — pure functions, Vitest-
testable without touching Supabase or the network (matches
`conventions.md`'s "Vitest for anything with a right answer"):

```ts
export type TopicExamProgress = {
  partsAttempted: number;
  totalParts: number;
  marksAvailable: number;   // readable marks only, per req. §2.6
  marksAwarded: number;     // from the latest attempt per part
  lastAttemptAt: string | null;
  topMisconceptions: { text: string; count: number }[];
};
export function computeTopicExamProgress(
  chapters: ExamChapter[],              // getExamChaptersForTopic(topic)
  latestAttemptsByPart: Record<string, ExamQuestionAttempt>  // key: `${questionId}:${part}`
): TopicExamProgress;

export type ExamGateResult = { passed: boolean; coveragePct: number; qualityPct: number };
export function computeExamGateStatus(
  chapters: ExamChapter[],
  latestAttemptsByPart: Record<string, ExamQuestionAttempt>
): ExamGateResult;
// coverage = marks-of-attempted-parts / marks-available (readable only)
// quality  = marks-awarded / marks-of-attempted-parts
// passed   = coverage >= 0.5 && quality >= 0.7 (req. §5.2)
// a part whose latest attempt is 'unmarkable' or 'failed' counts toward
// neither numerator nor denominator - only a completed 'marked' result
// counts, per req. §5.2's explicit exclusion.
```

`lib/db/use-exam-question-attempts.ts` supplies `latestAttemptsByPart` (one
query per topic, `select distinct on (question_id, part) * order by
question_id, part, created_at desc` — latest row per part) to both the
progress summary (§2.1) and `useMasteryGateStatus` (`steering/design.md`
§6.13), which now checks: a passing `mastery_attempts` row **or**
`computeExamGateStatus(...).passed` for the topic — either satisfies the
gate (requirements.md §5.2: the three routes are alternatives, not
additive).

## 5. UI components

All under `components/`, following the existing per-feature naming
(`OcrChallenge*`, `Topic*`):

- **`ExamQuestionsSection.tsx`** — the topic-page section (req. §2.1):
  progress summary (§4 above), then `ExamChapterTabs`. The Year 12/13
  level filter (req. §2.5) is resolved as a client-only `localStorage`
  preference, global across topics rather than per-topic (a student who
  says "show Year 13" would want that everywhere) - the other option §7
  left open (a per-account DB field) wasn't worth a schema for a single
  boolean with no cross-device requirement.
- **`ExamChapterTabs.tsx`** — one tab per chapter for the topic (req.
  §1.2/§2.1); renders nothing but a heading when there's exactly one
  chapter (the `big-data`/4.11 case) rather than a redundant single tab.
- **`ExamQuestionView.tsx`** — stem, then each part: mark allocation,
  a `needsReview` notice + `pdfPage` citation where set (req. §2.4), an
  answer `<textarea>` sized by that part's marks (req. §2.2), the level
  badge, `sourceExam` provenance where present (req. §2.3).
- **`ExamAnswerForm.tsx`** — one part's answer field + submit button.
  Autosave (req. §3.2) uses `localStorage` keyed by `` `exam-draft:
  ${questionId}:${part}` `` — a per-viewer convenience, not shared state,
  so `localStorage` is the right tool here (unlike the shared attempt
  history itself, which must be a real DB row).
- **`ExamAnswerResult.tsx`** — renders a `marked` row's `awarded/max`,
  `credited`/`missed` lists, `model_answer`, and confidence; a `pending`
  row shows a spinner; a `failed` row shows a retry control (req. §4.5,
  same "inline retry, never silently vanish" shape as
  `use-optimistic-mutation.ts`'s pattern elsewhere in this app); an
  `unmarkable` row says so plainly, distinct from a 0-mark answer.

## 6. Testing

- **Vitest**: a structural-integrity test for `EXAM_CHAPTERS` (mirroring
  `__tests__/spec-integrity.test.ts` / `ocr-challenges.test.ts`) — every
  question has a unique `id`; every chapter's `specArea` resolves to a
  real `Topic.ref`; the computed totals (177 questions, 789 marks, 73
  `needsReview`) match the source file exactly, so a future re-ingestion
  that silently drops questions is caught. `computeTopicExamProgress`/
  `computeExamGateStatus` get direct unit tests with fixed fixtures
  (empty attempts, partial coverage, coverage-but-not-quality, both met) —
  the 50%/70% boundary conditions especially.
- **Playwright**: the marking route needs a way to run without a real
  Anthropic API key in CI — inject a test-mode marking function (a thin
  seam the route handler calls through, swapped for a deterministic stub
  under `NODE_ENV=test`/a dedicated env flag) so the full submit → persist
  → mark → display flow is exercisable without a live API call or its
  cost; a small number of tests behind a "real API key present" guard can
  additionally hit the real endpoint once, for confidence the wiring
  itself works. Cover: an answer is persisted even when marking is mocked
  to fail; a resubmitted identical answer doesn't trigger a second mock
  call; a `needsReview` question is still attemptable and shows its
  notice; the level filter defaults to Year 12 and hides Year 13
  questions until toggled.

## 7. Env

New server-only var, added to `.env.example` alongside the existing
Supabase ones: `ANTHROPIC_API_KEY=`. Never read on the client; only inside
`app/api/exam-questions/mark/route.ts`.
