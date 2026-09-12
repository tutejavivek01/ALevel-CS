# Requirements — Exam Question Bank

Added 2026-09-12. This is a sibling document to `steering/requirements.md`,
not a replacement for it — read `steering/requirements.md` §12 ("Confident"
mastery gate) first; this feature is that gate's **third route**, alongside
the existing quiz route (§12.2) and programming-challenge route (§12.3).
It also builds on §11 (topic detail pages), which is where its UI attaches.

Written as user stories with EARS-style acceptance criteria (`WHEN`/`IF`/
`WHILE`/`WHERE ... THE system SHALL ...`), per explicit request — this is a
new documentation convention for this project; `steering/requirements.md`'s
prose-and-bullets style is unchanged elsewhere. This file lives at
`specs/exam-question-bank/requirements.md` rather than as another numbered
`steering/requirements.md` section, also per explicit instruction: future
large, separately-reviewed features may follow this `specs/<feature>/`
pattern rather than growing the single steering file indefinitely.

**Scope of this document**: requirements only. No design, no tasks, no
code. Stop here for review before design.md.

## Source data

`reference/aqa_cs_question_bank.json` — 177 questions, 404 parts, 789
marks, OCR-extracted from *AQA AS and A Level Computer Science* (Heathcote
& Heathcote, PG Online, ISBN 978-1-910523-07-0). Verified directly against
the file (not assumed from its own header):

- Every one of the 13 AQA topics (4.1–4.13) has at least one question;
  coverage ranges from 4 questions/15 marks (4.13) to 23 questions/72 marks
  (4.4) or 19 questions/103 marks (4.9).
- 73 of 177 questions (41%) are `needs_review: true` — a diagram, table, or
  circuit that OCR couldn't reproduce; the question text itself is intact.
- Mark-allocation gaps exist at two granularities: ~25 questions carry
  `marks_partial`/`marks_unreadable` at the question level, and **100
  individual parts** across the bank have no `marks` key at all (not just
  `null`) — a UI "marks unknown" state is needed per-part, not only
  per-question.
- Every question has a stable `id` (e.g. `ch1-q2`, `appA-q1`) — 100%
  present, confirmed unique.
- Every quiz-eligible topic except `big-data` (4.11, 1 chapter) spans
  **multiple book chapters** — up to 10 for `networking` (4.9), 9 for
  `programming` (4.1) and `computation` (4.4).
- Two appendices (`Appendix A`, `Appendix B`) are flat chapter-shaped
  objects, not nested under a `.chapters` array the way `sections[i]
  .chapters` is — a real structural quirk to account for when reading the
  file, not a documentation error.
- The book contains no answers; the only ground truth is the question text
  and its AQA mark allocation.
- The content is copyrighted. This is a private study site for one
  student; the bank must never be reachable by an unauthenticated request
  or served from a public, statically-indexable path.

## 1. Ingestion

### 1.1 Content-in-code, not a database table

**User story**: As a maintainer, I want the question bank to live in the
repo as typed, version-controlled content — the same pattern as every
other fixed dataset in this app (`topics.ts`, `ocr-challenges.ts`,
`spec-content.ts`) — so that re-shipping a corrected extraction is a normal
code change, not a data migration.

**Acceptance criteria**:
- THE system SHALL import `reference/aqa_cs_question_bank.json` at build
  time through a typed TypeScript module (e.g. `lib/exercises/exam-
  question-bank.ts`) rather than loading it at runtime from an external
  URL or an API route.
- THE system SHALL NOT store question text, parts, or mark allocations as
  rows in the database. Only mutable state — attempts, answers, marking
  results — is persisted there (§3, §4).
- WHERE the seed JSON is replaced with a corrected or extended extraction,
  THE system SHALL continue to resolve every existing attempt record
  correctly, because attempts key on each question's stable `id` string
  (§1.3), not on array position or content hash.

### 1.2 Spec-area join and chapter grouping

**User story**: As a student, I want a topic's exam questions organized by
the book's own chapters, not dumped in one undifferentiated list, so that
a topic spanning ten chapters (e.g. 4.9 Networking) is still navigable.

**Acceptance criteria**:
- THE system SHALL join each question to a topic via its `spec_area` field
  matching that topic's `ref` (`lib/spec/topics.ts`).
- WHERE a topic's `spec_area` spans more than one chapter, THE system
  SHALL present each chapter as its own filterable sub-tab within that
  topic's exam-questions section (confirmed: chapter-as-sub-tab, not a
  single flat list and not pagination — the decision reached after
  reviewing the real per-topic chapter counts above).
- WHEN a topic has exactly one chapter for its `spec_area` (only `big-data`
  4.11 today), THE system SHALL render it without a redundant single-tab
  control.
- THE system SHALL label each sub-tab with the chapter's own title (e.g.
  "Chapter 3: Data types"), not just its number.

### 1.3 Stable ids and re-ingestion safety

**User story**: As a maintainer, I want to re-ingest a corrected question
bank without silently orphaning a student's past attempts.

**Acceptance criteria**:
- THE system SHALL treat each question's `id` field as the permanent,
  stable foreign key for every attempt record — the same "code-defined
  text id, not a database foreign key, checked by structural tests rather
  than a DB constraint" pattern already used for `subtopic_id`/
  `challenge_id`/`term_id` elsewhere in this app.
- IF a re-ingested seed file removes or renumbers a question id that has
  existing attempts, THEN THE system SHALL still display those attempts in
  history (with the question/part text as it was captured at attempt
  time, per §3.1's snapshot requirement) even though the id no longer
  resolves to a current question.
- WHEN the seed file is updated, THE system SHALL NOT require any database
  migration purely to reflect the content change (only a code deploy).

### 1.4 Access control

**User story**: As the two account holders, we want this copyrighted
content protected the same way everything else in this app already is —
never leaked to an anonymous visitor or a search engine.

**Acceptance criteria**:
- THE system SHALL NOT expose the question bank JSON, or any individual
  question/part text, from a route excluded from the existing
  authentication middleware (every route except `/login` already requires
  a session — this feature SHALL NOT add a new unauthenticated exception).
- THE system SHALL NOT place the question bank file, or any per-question
  asset derived from it, under `public/` or any other statically-served,
  unauthenticated path.
- THE system SHALL NOT return question content from the AI-marking route
  handler (§4.1) to any request lacking a valid session.

## 2. Presentation

### 2.1 "Exam questions" section on the topic page

**User story**: As a student, I want to see, at a glance, how much of a
topic's exam-question bank I've engaged with and how well.

**Acceptance criteria**:
- THE topic detail page (`steering/requirements.md` §11) SHALL show an
  "Exam questions" section listing: the topic's total question count,
  total marks available (labelled as a lower bound where any question's
  marks are partial/unreadable — see §2.6), marks awarded so far (from the
  latest attempt per part, §5.2), and the chapter-grouped question list
  (§1.2).
- WHEN the student has not yet attempted any part of a topic, THE system
  SHALL show marks-awarded as 0 without implying anything has failed.

### 2.2 Question view

**User story**: As a student, I want to answer a real exam question in a
form that mirrors how AQA actually presents it — stem, then each
mark-weighted part — with room to write proportional to what the part is
worth.

**Acceptance criteria**:
- WHEN a question has a `stem`, THE system SHALL render it above its parts;
  WHEN a question has no parts (a single `text` field instead), THE system
  SHALL render it as one answerable unit.
- THE system SHALL show each part's own mark allocation next to its answer
  field.
- THE system SHALL size each part's answer field (e.g. textarea rows)
  proportionally to its mark allocation, so a 1-mark part gets a short
  field and a 6-mark part gets a substantially larger one.
- WHERE a part's marks are unknown (§2.6), THE system SHALL still render
  an answer field, sized to a sensible default, without claiming a mark
  value that doesn't exist.

### 2.3 Provenance

**User story**: As a student, I want to know when a question is lifted
from a real past paper, since that's a signal of its authenticity and
difficulty.

**Acceptance criteria**:
- WHERE a question has a `source_exam` value, THE system SHALL display it
  visibly alongside the question (e.g. "AQA Comp 1 Qu 5 June 2010").
- WHERE `source_exam` is absent, THE system SHALL show no provenance line
  (not a placeholder like "Source: unknown").

### 2.4 `needs_review` questions

**User story**: As a student, I want to attempt a question even when its
printed diagram wasn't recovered, as long as I know that's the case and
can go check the real page if I need to.

**Acceptance criteria**:
- WHERE a question has `needs_review: true`, THE system SHALL show a
  visible notice ("This question references a diagram/table not
  reproduced here — see page N of the source") and a link/reference to
  its `pdf_page`.
- THE system SHALL still allow the question to be attempted and submitted
  normally — it SHALL NOT be filtered out or gated behind an
  acknowledgement step (decided: attemptable-with-notice, since the
  question text is intact for the large majority of these and filtering
  41% of the bank by default is a disproportionate usability cost).
- WHEN a `needs_review` question's marking genuinely depends on content
  that isn't visible in text (the missing figure), THE AI marker SHALL say
  the part is unmarkable rather than guess (§4.4) — the honesty burden is
  on the marker, not on gating the student's access to the question.

### 2.5 Level filter

**User story**: As a Year 12 student, I don't want Year 13 exam questions
cluttering my practice before I've covered that content.

**Acceptance criteria**:
- THE system SHALL filter the exam-questions list by `level`
  (`"AS / A Level (Year 12)"` vs `"A Level (Year 13)"`), defaulting to
  Year 12 only.
- THE system SHALL provide a control to include Year 13 questions, and
  SHALL remember that choice for the student across visits (exact
  persistence mechanism — a lightweight per-account preference vs. a
  client-only setting — is left to design, flagged in §7).

### 2.6 Honest mark totals

**User story**: As a student or supporter, I don't want to mistake an OCR
artifact for a real fact about how many marks a topic is worth.

**Acceptance criteria**:
- THE system SHALL derive every displayed mark total (per question, per
  chapter, per topic) from readable marks only.
- WHERE any question contributing to a total has `marks_partial` or
  `marks_unreadable` set, THE system SHALL label that total as a lower
  bound (e.g. "≥ 72 marks"), not present it as exact.
- WHERE an individual part has no `marks` value, THE system SHALL exclude
  it from mark-total arithmetic entirely rather than treating it as zero
  (zero would imply "worth nothing," which is false — it means "unknown").

## 3. Answering

### 3.1 Per-part, independently submittable answers

**User story**: As a student, I want to answer and submit one part of a
multi-part question without being forced to complete every part in the
same sitting.

**Acceptance criteria**:
- THE system SHALL treat each part (or the whole question, where it has no
  parts) as the independently submittable unit — not the question as a
  whole.
- WHEN the student submits one part, THE system SHALL NOT require the
  other parts of the same question to be answered first or at the same
  time.
- WHEN an attempt is recorded (§3.4), THE system SHALL snapshot the exact
  question/part text and mark allocation as they were at submission time,
  so a later content correction (§1.3) never rewrites history.

### 3.2 Draft autosave

**User story**: As a student, I don't want to lose a half-written answer
because I navigated away or closed the modal.

**Acceptance criteria**:
- WHILE the student is typing an answer that hasn't been submitted, THE
  system SHALL autosave the draft.
- WHEN the student returns to the same part later (same session or a
  future one), THE system SHALL restore the autosaved draft.
- THE system SHALL NOT trigger AI marking (§4) from an autosave — only an
  explicit submit does that (§3.3).

### 3.3 Explicit submit triggers marking

**User story**: As a student, I want to control exactly when my answer is
sent off to be marked, rather than have it happen silently while I'm still
drafting.

**Acceptance criteria**:
- WHEN the student performs an explicit submit action on a part, THE
  system SHALL persist the submitted answer immediately, before the
  marking call is attempted (so the answer is never lost regardless of
  what marking does next — §4.5).
- THE system SHALL then request AI marking for that part (§4).

### 3.4 Re-attempts are retained, never overwritten

**User story**: As a student, I want to try a part again after seeing my
first mark, and as a supporter, I want to see the whole trajectory, not
just the latest attempt.

**Acceptance criteria**:
- WHEN a student submits a part that already has a prior attempt, THE
  system SHALL create a new attempt record rather than overwriting the
  previous one.
- THE system SHALL retain every attempt (including ones that scored 0 or
  were marked unmarkable) permanently, visible in history (§5.3).
- WHEN computing "marks awarded so far" for a part or topic (§2.1, §5.1,
  §5.2), THE system SHALL use the **latest** attempt per part, not sum or
  average across all attempts on that part.

## 4. AI marking

### 4.1 Server-side only

**User story**: As the account holders, we don't want our AI provider
credential ever reachable from a browser.

**Acceptance criteria**:
- THE system SHALL perform marking exclusively in a server-side Next.js
  Route Handler (mirroring the existing pattern in `app/export/route.ts`,
  the app's only prior route handler).
- THE system SHALL NOT send the marking API key to the client in any form
  (response body, header, or bundled environment variable) — it is read
  only from a server-only environment variable, added to `.env.example`
  alongside the existing Supabase variables.
- THE system SHALL reject a marking request from an unauthenticated
  session (§1.4).

### 4.2 Marking model and request context

**User story**: As a student, I want my answer marked with enough context
that the grading is actually meaningful, not just pattern-matched against
the raw answer text alone.

**Acceptance criteria**:
- THE marking request SHALL use Claude (model: `claude-opus-5` — the
  provider and tier explicitly named for this feature; a cheaper model is
  a cost lever to revisit later, not a default to reach for now).
- THE marking request SHALL include: the chapter title, the spec area
  (topic ref), the full question stem, the specific part's text, that
  part's mark allocation, the text of any sibling parts needed to
  interpret this one in context, and the student's submitted answer.
- WHERE a part's marks are unknown (§2.6), THE system SHALL tell the
  marker that explicitly rather than omitting the field silently.

### 4.3 Structured response contract

**User story**: As a maintainer, I want the marking result to be a
reliable data structure I can store and render, not prose I have to
re-parse and hope stays consistent.

**Acceptance criteria**:
- THE system SHALL request the marking response as a schema-validated
  structured output (Anthropic Structured Outputs / equivalent JSON-schema
  enforcement) — never free-form prose parsed after the fact.
- THE response schema SHALL be:
  ```
  {
    awarded: number,        // marks actually credited, 0..max
    max: number,             // the part's mark allocation (or the marker's
                              // best-effort figure where the source's own
                              // allocation is unknown)
    credited: string[],      // point(s) the answer got credit for
    missed: string[],        // point(s) a full-mark answer would have
                              // included but this one didn't
    model_answer: string,    // what a full-mark answer looks like
    misconceptions: string[],// specific misunderstandings evident in the
                              // answer, if any (may be empty)
    confidence: number       // the marker's own confidence in this mark,
                              // 0..1
  }
  ```
- IF the model returns a response that fails schema validation, THEN THE
  system SHALL treat it as a marking failure (§4.5), never store a
  malformed result, and never surface a guessed/partial parse to the
  student as if it were a real mark.

### 4.4 Marking standards

**User story**: As a student, I want marks that reflect genuine AQA
standards — credited for what I actually wrote, not inflated, and not
awarded for things I didn't say.

**Acceptance criteria**:
- THE marking prompt SHALL instruct the model to mark to AQA's standard
  for the stated mark allocation — matching `principles.md` §3's
  "genuinely checkable, not decorative" bar for every other practice
  mechanism in this app.
- THE marking prompt SHALL instruct the model to credit valid alternative
  phrasings of a correct point, not just one canonical wording.
- THE marking prompt SHALL instruct the model not to inflate marks and not
  to award credit for content the student did not actually write.
- WHERE a question's correct marking genuinely depends on a figure the
  student cannot see (a `needs_review` question, §2.4), THE marking
  prompt SHALL instruct the model to say the answer is unmarkable rather
  than guess, and THE system SHALL surface that outcome to the student
  plainly (not as a 0/max score, which would misrepresent "unmarkable" as
  "wrong").

### 4.5 Failure handling

**User story**: As a student, I never want a marking hiccup to cost me my
submitted answer.

**Acceptance criteria**:
- THE system SHALL persist the submitted answer before attempting to mark
  it (§3.3) — a marking failure of any kind SHALL NOT lose or corrupt the
  stored answer.
- IF the marking API is unreachable or returns a server error, THEN THE
  system SHALL record the attempt with a distinct "marking failed —
  retryable" outcome, distinguishable from a genuine 0-mark answer, and
  SHALL offer the student a way to request marking again for that same
  attempt without re-typing the answer.
- IF the marking API returns a rate-limit response, THEN THE system SHALL
  handle it distinctly from a hard failure (e.g. a "try again shortly"
  message) rather than presenting it as a generic error.
- IF the model's response fails schema validation (§4.3), THEN THE system
  SHALL treat it the same as an API failure — retryable, answer preserved.
- IF the submitted answer is empty or below a minimal length threshold,
  THEN THE system SHALL decline to send it for marking at all and SHALL
  tell the student why, rather than spending an API call on an answer that
  cannot be meaningfully marked.

### 4.6 Cost control

**User story**: As the account holders, we don't want to pay for marking
the same answer twice.

**Acceptance criteria**:
- WHEN a student submits a part with an answer that is byte-identical
  (after trivial normalisation — trimmed whitespace) to a previous
  successfully-marked attempt on that same part, THE system SHALL reuse
  the stored marking result for the new attempt record rather than
  issuing a new marking API call.
- THE system SHALL still create a new attempt record for a resubmission
  (§3.4), even when its result is reused from cache — a resubmission is a
  real, recorded event, just not a billable one.
- THE system SHALL NOT reuse a cached result across different students,
  different parts, or non-identical answer text.

## 5. Progress and the confident gate

### 5.1 Per-topic progress summary

**User story**: As a student or supporter, I want a clear picture of where
real exam-answer practice is strong and where it isn't, not just a raw
attempt count.

**Acceptance criteria**:
- THE system SHALL show, per topic: parts attempted (count and % of the
  topic's total parts), marks awarded vs. marks available (§2.1, using
  the latest attempt per part per §3.4), and the date of the most recent
  attempt.
- THE system SHALL surface the misconception tags that recur most often
  across the student's attempts for that topic, as a simple frequency
  count over the `misconceptions[]` values already recorded (exact-string
  grouping; clustering near-duplicate phrasings is a future refinement,
  not required now).

### 5.2 Exam questions as a third route to Confident

**User story**: As a student, I want strong exam-question performance to
count toward Confident, on top of the existing quiz and challenge routes
— but only if I've engaged with enough of the topic and answered it well,
not just dabbled.

**Acceptance criteria**:
- THE system SHALL treat passing the exam-question threshold for a topic
  as satisfying that topic's mastery gate (`steering/requirements.md`
  §12) in exactly the same way passing the quiz or the 2 programming
  challenges does — any one of the three routes unlocks `confident` for
  that topic; they are not combined or additive requirements.
- THE threshold SHALL require both of the following, computed from the
  latest attempt per part (§3.4):
  - **Coverage**: the student has attempted parts covering at least 50%
    of the topic's total available marks (§2.6's honest-total rule
    applies — "available marks" means readable marks only).
  - **Quality**: across the attempted parts counted for coverage, at
    least 70% of their combined available marks have been awarded.
- THE system SHALL NOT count a part whose marking outcome was "unmarkable"
  (§4.4) or "marking failed" (§4.5) toward either the coverage or the
  quality figure — only a genuinely completed marking result counts.
- Rationale for 50%/70% (not asserted without argument, per the brief):
  a coverage floor exists specifically because attempting one easy
  question must not unlock a topic — the student has to engage with
  roughly half the topic's worth of marks. The quality bar is set below
  the quiz route's 80% because free-text, AI-graded answers are a
  stricter form of evidence than multiple-choice recall even at a lower
  nominal percentage (guessing a short-answer exam response is much
  harder than guessing among MC options) — the two thresholds are not
  directly comparable on the same scale.

### 5.3 Unified attempt history

**User story**: As a student or supporter, I want one place to see every
kind of mastery-gate attempt for a topic, not three separate views to
check.

**Acceptance criteria**:
- THE "History" entry point (`steering/requirements.md` §12.6) SHALL show
  quiz attempts, programming-challenge attempts, and exam-question
  attempts for a topic together, ordered by time, not as separate tabs or
  separate modals per route.
- Each exam-question history entry SHALL show: the question/part
  attempted, the answer submitted, the marking result (or the
  failure/unmarkable outcome), and the timestamp — the same level of
  detail already shown for saved OCR-challenge code versions
  (`steering/design.md` §6.10).

## 6. Explicitly out of scope for this pass

- No answer key beyond what AQA's own mark scheme implies through the
  AI marker — the source book has no published answers, and none are
  fabricated.
- No editing or deleting a submitted answer or its marking result after
  the fact — history is append-only, matching every other attempt-history
  mechanism in this app.
- No clustering/semantic de-duplication of `misconceptions[]` tags for
  the "weakest sub-areas" view (§5.1) — exact-string frequency only.
- No re-verification of a `needs_review` question's missing figure via
  image generation, OCR retry, or any other automated recovery — the
  figure is genuinely absent from the source material; the notice-and-
  link treatment (§2.4) is the permanent behaviour, not an interim one.
- No cross-student aggregation or leaderboard — this remains a
  single-student tool exactly as the rest of the app is scoped.

## 7. Open items for design/build phase (not blocking, flagged for later)

- Whether the Year 12/13 level-filter preference (§2.5) persists as a
  small per-account database field or a client-only setting.
- Whether Anthropic prompt caching (a separate mechanism from the
  answer-dedup cache in §4.6) is worth adding on the stable
  system-instructions/question-context portion of the marking prompt,
  once real usage volume makes the saving meaningful.
- Exact UI treatment for a `needs_review` question's source-page link —
  a plain page-number citation vs. a link to a hosted scan (the source
  book itself is not otherwise reproduced in the app, per copyright,
  §1.4) — likely just the citation, but not yet decided.
- Whether the exam-question route's coverage/quality thresholds (§5.2)
  need per-topic tuning once real attempt data exists, rather than one
  fixed 50%/70% pair for all 13 topics.
- Which model tier is used for marking long-term (§4.2 names Claude
  Opus 5 as the starting choice; cost/quality tuning is a later pass, not
  a decision for this document).
