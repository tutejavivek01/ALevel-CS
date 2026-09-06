# Conventions

Based on the stack proposed in `tech-stack.md` (Next.js + TypeScript +
Supabase). Revisit this file if that stack changes.

## Language & framework

- TypeScript throughout, strict mode. No plain `.js` in application code —
  the spec content shape (topics, subtopics, NEA sections, exercise
  definitions) and the exercise-grading logic both benefit from types that
  fail at compile time rather than silently at runtime.
- Next.js App Router conventions: server components by default; client
  components only where interaction requires it (status toggles,
  trace-table inputs, flashcards, the FSM checker).

## Folder structure

Starting point — adjust once the project exists and real needs surface:

```
/app                   route-driven pages (overview, topic/[id], nea, unit2-practice)
/components            shared UI (progress ring, checklist row, resource link, card)
/lib/spec              the 14-topic AQA content — canonical, checked against the real spec (see principles.md)
/lib/exercises         trace-table / FSM / glossary exercise definitions + grading logic, unit-tested
/lib/db                Supabase client + typed queries — no raw SQL scattered through components
/steering              this folder
```

## Naming

- Topic, subtopic, and NEA-section IDs stay as kebab-case slugs matching
  the prototype's existing scheme (`programming`, `data-structures`,
  `tech-complete`, etc.). Migrate these IDs directly rather than inventing
  a second scheme, so any progress data carried over maps cleanly.
- The two status vocabularies already established by the prototype are
  canonical — don't introduce a third for a new feature without a specific
  reason:
  - Subtopic status: `not-started` / `learning` / `practising` / `confident`
  - NEA section status: `not-started` / `in-progress` / `drafted` / `complete`

## Styling

- Keep the prototype's CSS custom-property design system: `--bg`,
  `--surface`, `--accent`, and the semantic status colors (`--good`,
  `--warn`, `--learn`, `--muted`), with light/dark handled via
  `prefers-color-scheme` plus a `data-theme` override. Port it into
  global CSS / CSS modules — don't rewrite it in a utility framework.
- IBM Plex Sans (body copy) and IBM Plex Mono (data, spec references,
  code) stay as the typefaces.

## Testing

- Vitest for anything with a right answer: the trace-table checker, the
  FSM step function, progress-percentage calculations, NEA total-marks
  calculation. These are pure functions — test them as functions, no
  rendering required.
- Playwright for the few flows where a silent failure would break a
  principle: a status change survives a reload; an NEA field save
  survives a reload; an exercise marks correct input as correct and wrong
  input as wrong.
- Don't write snapshot tests for their own sake. Test behavior (a click
  changes a status, a correct answer shows correct), not markup.

## Content-accuracy workflow

Any edit to `/lib/spec` (topic titles, subtopic checklist items, NEA
section names/marks) should cite or link the specific AQA 7517 spec
section it came from in the commit or PR description. Per
`principles.md`, this content is the thing the whole product is
accountable for getting right — treat it accordingly, not as ordinary
data.
