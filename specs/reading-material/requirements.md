# Requirements — Reading Material

Added 2026-09-13. Sibling document to `steering/requirements.md` and
`specs/exam-question-bank/requirements.md` — read `steering/requirements.md`
§11 (topic detail pages) first; this feature adds a third section to that
same page, alongside §11.1 (spec detail) and §11.2 (watch & revise). It is
deliberately **not** a fourth route through §12's "confident" mastery gate
(see §4.5 below) — this is reference material, not an assessment mechanism.

Written as user stories with EARS-style acceptance criteria (`WHEN`/`IF`/
`WHILE`/`WHERE ... THE system SHALL ...`), following the convention
`specs/exam-question-bank/requirements.md` established.

**Scope of this document**: requirements only. No design, no tasks, no
code. Stop here for review before design.md.

## Source data

`reference/book_md/` — 74 markdown files (72 numbered chapters + two
appendices), extracted from _AQA AS and A Level Computer Science_
(Heathcote & Heathcote, PG Online, ISBN 978-1-910523-07-0): 89,122 words,
422 figures. Verified directly against the files themselves, not assumed
from the README's own header:

- `manifest.json` is a flat JSON array of 74 records: `{file, chapter,
title, section, spec_area, level, pdf_pages, words, figures,
has_exercises}`. `chapter` is a number for regular chapters and a string
  (`"Appendix A"`/`"Appendix B"`) for the two appendices — the exact
  quirk `lib/exercises/exam-question-bank.ts` already normalizes for its
  own `chapter` field.
- Every chapter file's own front matter carries 10 fields (`chapter,
title, section, section_title, spec_area, spec_area_title, level,
pdf_pages, figures, source`) — a superset of the manifest's per-record
  fields.
- Body structure is fully uniform across all 74 files: only `#`/`##`
  headings appear anywhere (zero `###`+), every file has exactly one
  `## Exercises` section and exactly three `---` rules (front-matter
  open/close, and the pre-Exercises separator), and pseudocode is fenced
  with a bare ` ``` ` (no language tag).
- 422 image references across all 74 files resolve **1:1** against 422
  files in `figures/` — verified by direct diff, not assumed: zero
  missing, zero orphaned.
- Image markdown is `![<alt text>](figures/<file>.png)`. The dominant alt
  text form is "Figure from page N" (393 of 422), but not universal: 17
  use "Figure N", 4 use "Table N", and 7 are one-off descriptive captions
  ("Figure N: description"). **There is no separate caption line anywhere
  in the source** — when a caption exists, it is inside the image's own
  alt text, never a following `*Figure N*`-style line.
- `has_exercises` is `true` on every one of the 74 records — every
  chapter's markdown ends with an `## Exercises` section.
- Every one of the 13 spec areas (4.1–4.13) is covered by at least one
  chapter (mirrors the exam question bank's own full coverage).
- The book is copyrighted, reproduced here for one student's private
  study — the same constraint already applied to the exam question bank:
  never reachable unauthenticated, never indexed.
- Two known source limitations, surfaced rather than hidden (the same
  spirit already applied via `needsReview`/`marksUnreadable` in the exam
  question bank): OCR noise survives in the prose (joined words, mangled
  symbols — most visibly inside `## Exercises` sections, where
  table-like structures sometimes render as garbled headings and inline
  text); and tables built of drawn symbols (truth tables, FSM notation,
  trace tables) are images, not markdown tables, because column recovery
  from the scan wasn't reliable enough to trust — nothing is missing,
  it's presented as a picture instead of an HTML table.

## 1. Ingestion

### 1.1 Content-in-code, offline build artifact — not a live parse

**User story**: As a maintainer, I want the reading material to behave
like every other fixed content module in this app, not like a special
case that re-parses markdown on every request.

**Acceptance criteria**:

- THE system SHALL ingest `reference/book_md/` via an offline, repeatable
  build step (e.g. `scripts/ingest-reading-material.mjs`), producing a
  checked-in generated artifact (e.g. `lib/generated/reading-content.json`)
  — the same "content in code, not the database" pattern already used by
  `lib/exercises/exam-question-bank.ts` (a committed JSON blob imported by
  a typed normalizer module), not a live per-request or per-build markdown
  parse.
- THE system SHALL NOT read or parse markdown from `reference/book_md/`
  at request time — only the generated artifact is imported by the
  running app.
- WHEN the ingestion step runs, THE system SHALL fail loudly (non-zero
  exit, a clear error message) if the count of image references in the
  source markdown does not exactly match the count of files present in
  `figures/` — the same "don't silently drift" guard the source data's
  verified 422/422 match deserves going forward, not just once at
  authoring time.
- Re-running ingestion SHALL be idempotent (the same source produces the
  same artifact) and SHALL NOT disturb any student's stored read state
  (§4) — read state is keyed by a stable, code-defined id (chapter file
  name / spec area ref), never regenerated by ingestion.
- THE rendered output SHALL strip the YAML front matter entirely — it
  drives the page header and the chapter grouping/ordering, never the
  rendered prose.

### 1.2 Chapter grouping and reading order

**User story**: As a Year 12 student, I want a spec area's chapters in an
order that respects what I've actually been taught, not raw chapter
number order, since a single area's chapters are not contiguous and span
both years.

**Acceptance criteria**:

- THE system SHALL group chapters by `spec_area`, joining to the same
  `Topic.ref` the exam question bank and spec-detail content already key
  on — `lib/spec/spec-content.ts` and `lib/spec/watch-resources.ts` both
  key by `ref`, not `topic.id`; this module SHALL follow the same
  convention.
- THE system SHALL order a spec area's chapters by level first (AS/Year
  12 chapters before A Level/Year 13 chapters), then by ascending chapter
  number within each level — never by raw chapter number alone, since
  e.g. spec area 4.1 runs chapters 1–6 and 8 (Year 12) then jumps to
  67–68 (Year 13, object-oriented programming).
- WHERE a spec area's chapters span both levels, THE system SHALL render
  a visible divider between the Year 12 run and the Year 13 run.
- THE system SHALL respect the existing Year 12/13 level-filter
  convention already established by the exam question bank
  (`specs/exam-question-bank/requirements.md` §2.5): where a student has
  that preference set to Year-12-only, the Year 13 chapters of a reading
  page SHALL collapse or hide rather than padding the page with content
  not yet relevant.
- THE two appendices (Appendix A inside spec area 4.5, Appendix B inside
  4.6) SHALL be ordered last within their spec area and labelled as
  extension material, distinct from the numbered chapters.

## 2. Figures

### 2.1 Position-preserving, in place

**User story**: As a student, I want a diagram to appear exactly where
the text refers to it, not gathered into a gallery or pushed to the end
of the chapter, since the surrounding prose depends on it being there.

**Acceptance criteria**:

- THE system SHALL preserve every figure's exact position in the
  chapter's reading flow, between the same paragraphs it sits between in
  the source markdown.
- THE system SHALL NOT relocate figures into a gallery, an
  end-of-chapter appendix, or any other reordering.
- WHERE a paragraph is split either side of a figure in the source (the
  book's own print layout wrapping text around an image), THE system
  SHALL preserve that split as-is — it SHALL NOT attempt to heuristically
  rejoin paragraphs that were never a single paragraph to begin with.

### 2.2 Auth-gated serving — never from an unauthenticated path

**User story**: As the account holders, we don't want copyrighted book
scans reachable by a guessed URL, even though every other route in the
app is already behind login.

**Acceptance criteria**:

- THE system SHALL serve every figure through a server-side Route Handler
  that performs its own authentication check in code (mirroring
  `app/api/exam-questions/mark/route.ts`'s and `app/export/route.ts`'s
  existing `supabase.auth.getUser()` check) — it SHALL NOT rely on the
  site-wide middleware (`proxy.ts`) to gate it.
- THE system SHALL NOT place any figure under `public/` or any other
  statically-served, middleware-bypassing path. This is a hard
  requirement, verified directly, not a stylistic preference:
  `proxy.ts`'s matcher (`'/((?!_next/static|_next/image|favicon.ico|.*\
\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'`) excludes any URL ending in an
  image extension from auth-gating at all, including one under `/api/` —
  so a figure route whose URL happens to end in `.png` would silently
  bypass the middleware layer regardless of where the underlying file
  lives, unless it checks auth itself.
- IF an unauthenticated request reaches the figure route, THEN THE system
  SHALL reject it (401/redirect), exactly as every other authenticated
  route in this app already does.

### 2.3 Presentation

**User story**: As a student reading on a dark theme, I don't want a
grayscale scan on a white background reading as a hole punched in the
page; and as a student on a phone, I want a dense circuit or trace-table
scan to actually be legible.

**Acceptance criteria**:

- THE system SHALL render every figure on its own light surface with
  padding, regardless of the active theme — a grayscale scan on a white
  ground SHALL NOT sit directly against a dark page background.
- THE system SHALL constrain each figure to the text column's width,
  center it, load it lazily (`loading="lazy"`), and provide a
  click-to-enlarge affordance.
- THE system SHALL render the image's own alt text as its caption,
  directly alongside the image — not derive a separate caption from the
  filename or chapter title, since (per the source data above) no
  chapter in the source ever carries a caption beyond its image's alt
  text.

## 3. The reading page

### 3.1 One page per spec area

**User story**: As a student, I want one place per spec area to read
everything the book covers for it, reachable directly from that area's
own page rather than hunting for it.

**Acceptance criteria**:

- THE system SHALL provide exactly one reading page per spec area (13
  pages total, 4.1–4.13), not a page per subtopic checklist item and not
  a page per chapter.
- THE system SHALL provide a **"Read more"** entry point on the topic
  detail page's own header block (`.topic-head` on `app/(app)/topic/
[topicId]/page.tsx`) — not on the Dashboard's spec-area tile
  (`components/Dashboard.tsx`), whose tile is already a single `<Link>`
  wrapping the whole card with no existing button slot to extend without
  restructuring it.
- THE system SHALL sit behind authentication exactly like every other
  route in this app (§5).

### 3.2 Page header

**User story**: As a student, I want to know how much reading a spec area
represents before I start, and to see the "Mark as read" control right
away rather than scrolling to find it.

**Acceptance criteria**:

- THE reading page SHALL show, in its header: the spec area's code and
  title, its chapter count, an estimated reading time derived from the
  manifest's `words` totals, and the "Mark as read" control (§4.1).
- Because this is its own page rather than a section of the topic detail
  page, THE system SHALL give it its own single top-level heading — it is
  not bound by the topic page's "one `<h2>` per page" convention
  (`tests/e2e/topics.spec.ts`), since that convention exists for the
  topic page specifically, not for every page in the app.

### 3.3 Chapter rendering

**User story**: As a student, I want each chapter clearly separated with
its own title and level, and a way to find the original page if the OCR
text is unclear.

**Acceptance criteria**:

- THE system SHALL render chapters in the order set out in §1.2, each
  with its own anchor, title, level badge, and its `pdf_pages` shown as
  provenance.
- THE system SHALL render every chapter **collapsed by default**
  (matching `TopicSpecDetail.tsx`'s existing `<details>`/`<summary>`
  mechanism exactly — no new JS, server-rendered, keyboard-accessible).
- THE system SHALL provide in-page navigation as a plain jump menu (an
  anchor-link list of chapter titles), not a tab control that hides all
  but one chapter at a time (`ExamChapterTabs`'s pattern) — a reading page
  is read sequentially start to finish, unlike the exam question bank's
  independently-selectable per-chapter question sets.
- THE system SHALL render each chapter's trailing `## Exercises` content
  inside its own collapsed section, presented as static text from the
  book, not as an interactive/gradeable form.
- WHERE the same chapter's spec area already has questions in the exam
  question bank (`specs/exam-question-bank/requirements.md`), THE system
  SHALL link across to that area's exam-questions section rather than
  duplicating an interactive answer form for the same content.

## 4. Mark as read

### 4.1 Area-level toggle

**User story**: As a student, I want to mark a spec area as read once I've
gone through it, and unmark it just as easily if I did that by accident.

**Acceptance criteria**:

- THE reading page SHALL show a "Mark as read" control at the top,
  reflecting the current read state for that spec area.
- THE control SHALL toggle — a student who marks an area read by accident
  SHALL be able to unmark it.
- Read state SHALL be recorded per student, per spec area, with the
  timestamp of the most recent change retained — matching
  `ocr_challenge_review_state`'s existing `text primary key` + nullable
  `timestamptz` toggle shape (no new schema pattern, just a new table of
  that same shape).
- Read state SHALL appear on the Dashboard's spec-area tile
  (`components/Dashboard.tsx`) as a small passive indicator next to the
  existing progress ring — visible without opening the reading page. It
  is not a button there; the Dashboard tile's whole-card `<Link>`
  structure is unchanged.

### 4.2 Per-chapter ticks

**User story**: As a student working through a long spec area over
several sessions, I want to pick up where I left off rather than lose
track of which chapters I've already been through.

**Acceptance criteria**:

- THE reading page SHALL provide a per-chapter read tick, independent of
  the area-level control, for each chapter in that spec area.
- WHEN every chapter in a spec area is ticked read, THE system SHALL
  automatically mark the area itself as read.
- WHEN a student un-marks the area-level "Mark as read" control, THE
  system SHALL NOT clear any chapter's individual tick — the two are
  asymmetric: un-marking the area resets the summary signal only, not the
  detailed per-chapter history.
- THE area-level control SHALL remain independently toggleable even when
  not every chapter is ticked (e.g. a student who read the material
  outside the app) — it is a real, directly-settable toggle that
  ticking-every-chapter also happens to set, not a value purely derived
  from the chapter ticks.

### 4.3 Idempotent under re-ingestion

**User story**: As a maintainer fixing an OCR typo in the source
material, I don't want that content correction to wipe out what a student
has already marked read.

**Acceptance criteria**:

- Read state (area-level and per-chapter) SHALL be keyed on the stable,
  code-defined chapter file name / spec area ref — never on any value
  derived from the ingested content itself, so a later re-ingestion of
  corrected source material never orphans or resets existing read state
  (mirrors §1.1's ingestion-idempotency requirement).

### 4.4 Access

**User story**: As the account holders, only the student's own reading
progress needs to be writable by her, while both accounts should be able
to see it.

**Acceptance criteria**:

- Both accounts (student and supporter) SHALL be able to read the read
  state for every spec area and chapter (§1: roles constrain writes, not
  visibility, exactly as everywhere else in this app).
- Only the student role SHALL be able to write read state — no
  column-scoping guard trigger is needed (mirrors
  `ocr_challenge_review_state`'s pre-due-date shape exactly: a single
  role ever writes either of these tables, so a plain role-check RLS
  policy is sufficient, the same reasoning already applied there and to
  the confident gate's own tables).

### 4.5 No interaction with the confident gate

**User story**: As a student, I don't want marking something read to be
mistaken for having demonstrated I understand it.

**Acceptance criteria**:

- Marking a spec area (or any of its chapters) as read SHALL NOT, on its
  own, change any subtopic's status, and SHALL NOT contribute to, unlock,
  or otherwise interact with the "confident" mastery gate
  (`steering/requirements.md` §12) in any way.
- Read state SHALL remain a wholly separate indicator from the confident
  gate's three routes (quiz, programming-challenge, exam-question) — a
  student may be marked read and not-confident, or confident and
  not-yet-marked-read, with no relationship enforced between the two.

## 5. Access and provenance

**User story**: As the account holders, this copyrighted material must
stay within the bounds of private study use, same as the exam question
bank already does.

**Acceptance criteria**:

- Every reading page and every figure route SHALL sit behind
  authentication, exactly as every other route in this app already does
  (§2.2 restates this for figures specifically, since it is the one part
  of this feature at genuine risk of accidentally bypassing that via
  `public/` or a middleware assumption).
- THE system SHALL mark reading pages non-indexable (e.g. a `noindex`
  meta tag or `robots` directive), matching the "must not be indexed"
  constraint already stated for the exam question bank.
- Each reading page SHALL carry the full book citation (the `source`
  front-matter field) in its footer.

## 6. Explicitly out of scope for this pass

- No re-parsing or "cleaning up" the OCR noise in the source text (joined
  words, mangled symbols) — `pdf_pages` is the escape hatch to the real
  page, exactly as `needsReview`/`pdfPage` already is for the exam
  question bank; this pass presents the text honestly, it does not try
  to fix it.
- No attempt to reconstruct truth tables, FSM notation tables, or trace
  tables as real HTML tables from the scan — they remain figures.
- No cross-linking from the reading page's prose into the confident-gate
  quiz/challenge content, beyond the one explicit link from a chapter's
  Exercises section to that spec area's exam-question-bank section
  (§3.3).
- No search across reading-material content.
- No highlighting, note-taking, or annotation within a reading page.
- No cross-student aggregation of reading progress — this remains a
  single-student tool, as the rest of the app is scoped.

## 7. Open items for design/build phase (not blocking, flagged for later)

- ~~Exact reading-time formula~~ **Resolved at task 60 sign-off**: 200
  words/minute (`lib/spec/reading-content.ts`'s `WORDS_PER_MINUTE`), one
  constant in one place if it needs tuning later — not re-derived from
  real usage data, since none exists yet.
- Whether the ingestion script needs a `--check`-only mode (verify counts
  without regenerating the artifact) for CI, or is only ever run by hand
  when `reference/book_md/` changes. Still open — the script has no such
  mode; it's only ever run by hand today.
- ~~Exact markdown-parsing library choice~~ **Resolved**: `gray-matter`
  (front matter) + `unified`/`remark-parse`/`remark-rehype`/
  `rehype-stringify` (body → HTML via an intermediate hast tree, so a
  custom visitor can rewrite image nodes) — devDependencies only, never
  imported by the running app (`specs/reading-material/design.md` §1).
- ~~Whether the per-chapter tick UI sits inline in each chapter's
  `<details>` header or in the jump-menu list~~ **Resolved differently
  from either option**: it sits inside the chapter's _expanded body_,
  above the prose — a checkbox nested in `<summary>` fights the native
  disclosure-toggle click, and placing it in the body nudges the intended
  flow (open the chapter, read it, then tick it) rather than ticking
  without ever opening it.
- Whether "estimated reading time" is shown per-chapter as well as
  per-area, given the per-chapter tick feature now exists. Still open —
  only the area-level total is shown.
