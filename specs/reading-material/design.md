# Design — Reading Material

Translates `specs/reading-material/requirements.md` into a concrete shape,
on top of `steering/design.md` §6.12 (topic detail pages, which this adds a
third entry point to) and §6.13 (the confident gate, which this deliberately
does **not** touch — req. §4.5). Section numbers below cross-reference that
requirements.md's own `§N` numbering.

## 1. Ingestion (req. §1)

### 1.1 Pipeline shape

A new **devDependency-only** ingestion script,
`scripts/ingest-reading-material.mjs`, following `scripts/migrate.mjs`'s
existing style (a plain Node ESM script, run by hand — `node scripts/
ingest-reading-material.mjs`). It reads `reference/book_md/manifest.json`
and every chapter/appendix `.md` file, and writes one checked-in artifact:
`lib/generated/reading-content.json`. `lib/spec/reading-content.ts` imports
that JSON directly (Next.js/TypeScript import JSON natively — same pattern
as `lib/exercises/exam-question-bank.ts`) and re-exports a typed surface.
**The running app never parses markdown** — the parsing dependencies below
are devDependencies used only by the ingestion script, not shipped to the
server or client bundle at all. This is a purer instance of "content in
code" than the exam question bank's own JSON-import pattern: even the
parsing step never runs at app runtime, only at authoring time.

New devDependencies: `gray-matter` (front matter), `unified` +
`remark-parse` + `remark-rehype` + `rehype-stringify` (markdown → HTML,
via an intermediate hast tree so a custom visitor can rewrite image nodes
— see §1.3) + `unist-util-visit`.

### 1.2 Per-file processing

For each of the 74 files (order and grouping driven by `manifest.json`,
per req. §1.2):

1. `gray-matter` strips and parses the front matter (`chapter, title,
section, section_title, spec_area, spec_area_title, level, pdf_pages,
figures, source`).
2. The body is split on the **last** `## Exercises` heading (confirmed by
   exploration: exactly one per file, always the final section) into
   `mainBody` and `exercisesBody`.
3. Each half runs through the same `unified` pipeline
   (`remark-parse` → `remark-rehype` → `rehype-stringify`), producing
   `bodyHtml` / `exercisesHtml` — sanitized, pre-rendered HTML strings.
4. A custom rehype visitor (§1.3) rewrites every `<img>` node before
   stringifying, so the artifact never contains a `figures/...` relative
   path.

Output shape (`lib/generated/reading-content.json`, re-typed by
`lib/spec/reading-content.ts`):

```ts
export type ReadingChapter = {
  id: string; // filename stem, e.g. 'ch23-logic-gates' - stable,
  // code-defined, used as chapter_read_state's key
  chapter: number | string; // string for 'Appendix A'/'Appendix B'
  title: string;
  sectionTitle: string;
  level: 'AS / A Level (Year 12)' | 'A Level (Year 13)';
  pdfPages: string;
  words: number;
  source: string;
  bodyHtml: string; // pre-rendered, images rewritten + wrapped (§1.3)
  exercisesHtml: string; // same treatment, kept separate (req. §3.3)
};
export type ReadingArea = {
  ref: string; // '4.1' etc - matches Topic.ref
  specAreaTitle: string;
  chapters: ReadingChapter[]; // already ordered per req. §1.2:
  // year-then-chapter-number, appendices last
};

export const READING_CONTENT: ReadingArea[];
export function getReadingContentForTopic(topic: {
  ref: string;
}): ReadingArea | undefined;
export function getReadingTimeMinutes(
  area: ReadingArea,
  includeYear13: boolean
): number;
```

`getReadingContentForTopic` keys by `ref`, matching `spec-content.ts`/
`watch-resources.ts`'s existing convention exactly (confirmed by
exploration, not `topic.id`).

### 1.3 Image rewriting (req. §2.1–§2.3)

The rehype visitor, run once per `<img>` node during ingestion:

- Rewrites `src` from `figures/chNN-pPPP-NN.png` to
  `/api/reading-material/figures/chNN-pPPP-NN.png` (§2).
- Wraps the image in `<figure class="reading-figure"><div
class="reading-figure-frame"><img loading="lazy" .../></div><figcaption>
{alt text}</figcaption></figure>` — the frame div is what gets the
  "light surface with padding regardless of theme" CSS treatment (req.
  §2.3); the `<figcaption>` is the image's own alt text verbatim, since
  (confirmed by exploration) no chapter in the source ever carries a
  caption beyond that.
- Verified at ingestion time (not just documented as a hope): the script
  counts every `figures/...` reference it rewrites across all 74 files and
  asserts that count is exactly 422 and that every referenced file exists
  on disk under `reference/book_md/figures/` — **fails loudly (non-zero
  exit) if either check fails** (req. §1.1's "don't silently drift" guard).

### 1.4 Idempotency and re-ingestion safety (req. §1.1, §4.3)

Re-running the script overwrites `lib/generated/reading-content.json`
deterministically from the same source — no state, no incremental mode.
Read state (§4) is keyed on `ReadingChapter.id` / `ReadingArea.ref`, both
stable and independent of the generated artifact's content, so a
re-ingestion that fixes an OCR typo never touches `chapter_read_state`/
`topic_read_state` rows.

## 2. Figures route (req. §2.2)

`app/api/reading-material/figures/[filename]/route.ts` — GET only.

1. **Auth check in code** — `createClient()` (server client) +
   `supabase.auth.getUser()`, reject with 401 if no session. This is not
   optional defense-in-depth here the way it is on `/export` — it is the
   **only** gate, because `proxy.ts`'s middleware matcher explicitly
   excludes any URL ending in an image extension
   (`.*\.(?:svg|png|jpg|jpeg|gif|webp)$`) from auth-gating at all,
   including a URL under `/api/`. Verified directly, not assumed.
2. **Path-traversal guard** — resolve `path.join(FIGURES_DIR, filename)`
   and confirm the resolved absolute path still starts with `FIGURES_DIR`
   before ever touching the filesystem; 400 if not. This is a plain
   existence/containment check, not a filename regex — simpler and more
   robust against a naming-convention edge case the regex didn't
   anticipate.
3. Read the file (`fs.readFile`) from `reference/book_md/figures/
<filename>` and return it with `Content-Type: image/png` and
   `Cache-Control: private, max-age=31536000, immutable` (private because
   this is authenticated content — a shared/CDN cache must not serve it to
   a different, unauthenticated request; immutable because a given
   filename's bytes never change, only ingestion's own artifact is
   re-derived).
4. 404 if the resolved file doesn't exist.

**Deployment note**: `reference/book_md/figures/` must ship with the
production server, not just the local dev filesystem — add
`outputFileTracingIncludes` in `next.config.ts` for this route so the
build includes those 422 files in the deployed server bundle. (`reference/
book_md/` itself also needs to be committed to the repo for this to work
anywhere but a local machine — flagged as a decision for the user, not
assumed here.)

## 3. The reading page (req. §3)

New route: `app/(app)/topic/[topicId]/reading/page.tsx` (server
component). Redirects to `notFound()` if the topic has no
`getReadingContentForTopic` entry (shouldn't happen — every topic has ≥1
chapter — but mirrors the topic page's own `getTopicById` guard).

Renders:

- **Header** (§3.2): area ref + title, chapter count, `getReadingTimeMinutes`
  (a simple words-per-minute constant, e.g. 200 wpm — req. §7 flags the
  exact constant as not yet tuned), and `<MarkAsReadToggle topicRef=.../>`
  (client component, §4).
- **Jump menu** — a plain `<nav className="reading-toc">` of anchor links
  (`#${chapter.id}`), one per chapter in reading order, with a visible
  divider between the Year 12 and Year 13 runs where both exist (req.
  §1.2) — not `ExamChapterTabs`'s tab-switching pattern, since this page
  is read sequentially, not selected-one-at-a-time.
- **Chapters**, each a `<details className="reading-chapter">` (collapsed
  by default, req. §3.3), containing:
  - Anchor (`id={chapter.id}`), title, level badge, `pdfPages` provenance.
  - `<ChapterReadTick chapterId={chapter.id} />` (client component, §4.2).
  - `<ReadingChapterBody html={chapter.bodyHtml} />` — a small client
    component that renders the pre-built HTML via
    `dangerouslySetInnerHTML` (safe here: content originates from our own
    ingestion of trusted source material, never from user input) and
    attaches one delegated click listener for `.reading-figure img` that
    opens the clicked image, enlarged, inside the existing
    `components/Modal.tsx` (reused as-is — no new lightbox mechanism).
  - A second, separately-collapsed `<details className="reading-exercises">`
    for `chapter.exercisesHtml`, labelled "Exercises (from the book)".
    Where `getExamChaptersForTopic(topic.ref)` (the exam question bank's
    own lookup) returns a non-empty list for this spec area, this section
    also shows a plain link to that topic's `#exam-questions` anchor on
    the topic detail page — "Practice these as marked exam questions →" —
    rather than any interactive form of its own (req. §3.3's explicit
    "link across, don't duplicate").
- **Footer**: the `source` citation (req. §5), repeated per chapter
  originally but shown once at the page level since every chapter in one
  spec area's page shares the same book citation.

`<title>`/metadata: `robots: 'noindex'` (req. §5).

## 4. Mark as read (req. §4)

### 4.1 Schema

Two new tables, following `ocr_challenge_review_state`'s exact
pre-due-date shape — confirmed by exploration to be this schema's closest
precedent for "one row per code-defined item, a nullable `timestamptz`
toggle, single-role RLS, no column-scoping trigger needed since only one
role ever writes it." This app has exactly one student account, so
(matching that precedent) neither table is scoped by `student_id` — the
row _is_ the single student's state for that item:

```sql
-- One row per spec area. read_at is a real, directly-settable toggle
-- (req. §4.2) - not purely derived from chapter_read_state, even though
-- ticking every chapter also sets it (§4.2's aggregation rule).
topic_read_state (
  topic_ref  text primary key,   -- Topic.ref, e.g. '4.4' - not a FK
  read_at    timestamptz,
  updated_by uuid not null references profiles(id)
)

-- One row per chapter. chapter_id is ReadingChapter.id (the code-defined
-- filename stem) - not a FK, same convention as every other content id
-- in this schema (subtopic_id, challenge_id, exam question_id...).
chapter_read_state (
  chapter_id text primary key,
  read_at    timestamptz,
  updated_by uuid not null references profiles(id)
)
```

RLS (both tables, identical): `select` open to `authenticated`; `insert`/
`update` restricted to `is_role('student')`. No `delete` policy. No
column-scoping trigger — only the student role ever writes either table,
same reasoning already applied to `ocr_challenge_review_state` pre-§due-
date and to the confident gate's own tables.

### 4.2 Hooks and aggregation (req. §4.2)

`lib/db/use-reading-state.ts`:

```ts
export function useTopicReadState(topicRef: string): { data: { read_at: string | null } | undefined, ... };
export function useChapterReadStates(topicRef: string): { data: Record<chapterId, string | null>, ... };
export function useSetTopicRead(topicRef: string): mutation (read: boolean) => void;
export function useSetChapterRead(topicRef: string): mutation ({chapterId, read: boolean}) => void;
```

`useSetChapterRead`'s `onSuccess` checks whether every chapter in
`getReadingContentForTopic(topicRef)` now has a non-null `read_at`
(reading the just-updated cache, optimistically merged — matching
`useOptimisticMutation`'s existing update-then-invalidate pattern used
elsewhere in this app) and, if so, also fires `useSetTopicRead(true)` —
implementing req. §4.2's "ticking every chapter automatically marks the
area" rule client-side, in the mutation layer, not as a database trigger
(consistent with this schema's existing preference for client-side
aggregation logic over DB triggers wherever only one role ever writes the
rows involved). `useSetTopicRead(false)` (un-marking the area) never
touches `chapter_read_state` — the asymmetry req. §4.2 requires falls out
naturally from the two mutations being entirely independent one-way
writes.

### 4.3 UI

- `components/MarkAsReadToggle.tsx` — the reading page's header control
  (§3), a simple button bound to `useTopicReadState`/`useSetTopicRead`.
- `components/ChapterReadTick.tsx` — a small inline checkbox/tick per
  chapter, bound to `useChapterReadStates`/`useSetChapterRead`.
- **Dashboard indicator** — `components/Dashboard.tsx`'s tile gains a
  small passive glyph (not a button — the tile is already a single
  `<Link>`) next to the existing `ProgressRing`, sourced from
  `useTopicReadState`. No restructuring of the tile's link-wraps-everything
  shape.
- **"Read more" entry point** — `.topic-head` on `app/(app)/topic/
[topicId]/page.tsx` gains a second flex child (a plain `<Link>` to
  `/topic/[topicId]/reading`) alongside the existing title block — the
  same slot `.checklist-head`'s "Test knowledge"/"History" row already
  established as this app's per-area action-button convention.

### 4.4 No gate interaction (req. §4.5)

Nothing in `useMasteryGateStatus` (`lib/db/use-mastery-attempts.ts`)
changes. `topic_read_state`/`chapter_read_state` are never read by any
gate-status computation — a deliberate, verifiable absence, not an
oversight to catch in review.

## 5. Access and provenance (req. §5)

- The reading page route and the figures route both require
  authentication (§2, and the app's existing middleware for the page
  route itself).
- `export const metadata = { robots: { index: false, follow: false } }`
  on the reading page.
- The two new tables are added to `EXPORTED_TABLES` in
  `app/export/route.ts` and `expectedTables` in `tests/e2e/
data-export.spec.ts` (req. §7's data-export completeness convention,
  matching every other new table this session and last).

## 6. Testing

- **Vitest**: a structural-integrity test for `READING_CONTENT` (mirroring
  `__tests__/exam-question-bank.test.ts`) — every one of the 13 topics has
  at least one chapter; total word count matches `manifest.json`'s sum;
  chapter ordering is year-then-number for a known multi-year topic (e.g.
  `programming`/4.1: chapters 1–6, 8, then 67–68); appendices ordered last
  within their topic; every `bodyHtml`/`exercisesHtml` string contains zero
  remaining `figures/` relative-path references (confirms the ingestion
  rewrite ran, not just that it exists in code); `getReadingTimeMinutes`
  is a pure, directly unit-testable function.
- **Playwright**: the figures route 401s an unauthenticated request and
  404s a path-traversal attempt (`../../../etc/passwd`-shaped filename),
  and serves a real image for an authenticated one; the reading page
  renders chapters in the documented order with a Year 12/13 divider;
  "Mark as read" toggles and persists across reload; ticking every
  chapter in a topic automatically marks the topic read; un-marking the
  topic leaves chapter ticks untouched; the Dashboard tile shows the read
  indicator without needing the reading page open.

## 7. Env / build

- New **devDependencies**: `gray-matter`, `unified`, `remark-parse`,
  `remark-rehype`, `rehype-stringify`, `unist-util-visit` — used only by
  `scripts/ingest-reading-material.mjs`, never imported by the Next.js app
  itself.
- `next.config.ts`: `outputFileTracingIncludes` for the figures route,
  covering `reference/book_md/figures/**`, so the 422 source images ship
  with the production server bundle (§2's deployment note).
- No new server-only secret/API key — unlike the exam question bank, this
  feature introduces no third-party network dependency at all.
