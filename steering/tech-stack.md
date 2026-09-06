# Tech Stack

## Decisions (confirmed 2026-09-05)

| Question | Decision |
|---|---|
| Hosting | Vercel-style host (git-push deploy, serverless functions available) |
| Auth | Full account system — real login, not just a shared private link |
| Database | Managed cloud database |
| Devices | Must work well as a responsive web app on phone/tablet and desktop |

## Proposed concrete stack

- **Framework: Next.js (App Router) + TypeScript, deployed on Vercel.**
  Directly matches the hosting decision — one project gives server-rendered
  pages and API routes together, with no separate backend service to run
  or maintain. This is the most well-trodden path for this shape of app.

- **Database + Auth: Supabase** (managed Postgres + built-in Auth +
  Realtime).
  One provider covers both the "managed cloud DB" and "full auth system"
  decisions without wiring together two separate services. Postgres gives
  real relational structure to data shaped like "13 topics × N subtopics ×
  2 people" — a better fit than a document store. Row-level security
  enforces "you can only write your own progress" at the database layer,
  not just in application code, which directly supports the
  never-silently-overwritten principle. Supabase Realtime replaces the
  prototype's `onSnapshot`-based live sync with the same live-update feel.

- **Styling: carry forward the prototype's existing CSS custom-property
  design system as-is** (light/dark theming, IBM Plex Sans/Mono,
  status-color tokens) rather than introducing Tailwind or a component
  library. It already works, is accessible, and there's no reason to
  re-derive it. Detail in `conventions.md`.

- **Testing: Vitest** for unit tests — especially the trace-table and FSM
  grading logic, which is exactly the code principles.md calls out as
  needing to be genuinely correct, not decorative. **Playwright** for the
  handful of end-to-end flows where a silent failure would violate a
  principle: a status change survives a reload, an NEA field save
  survives a reload, an exercise correctly marks right/wrong input.

## Addition (2026-09-05): Pyodide for Python practice problems

The parent-assigned Python problems feature (`requirements.md` §8) runs
student-submitted code client-side via **Pyodide** (CPython compiled to
WebAssembly), inside a **Web Worker** so a runaway loop can be interrupted
with a hard timeout instead of freezing the page. Chosen over a
server-side judge API or a self-hosted sandboxed runner specifically to
avoid taking on execution of untrusted code as server-side infrastructure
— the browser's own sandbox is the security boundary, and there's nothing
extra to operate or secure. Trade-off accepted: a one-time ~10MB+ download
the first time the Python Practice section is opened.

## Addition (2026-09-06): TanStack Query for the shared mutation pattern

Decided in task 6 (design.md §4/§9.6, as flagged): every mutating hook
across the app needs the same optimistic-update → write → rollback-and
-surface-retry-on-failure shape (principles.md §1). TanStack Query's
`useMutation` (`onMutate`/`onError`/`onSettled`) gives that shape directly
rather than hand-rolling it once per feature, and its query cache is also
what `useRealtimeTable` invalidates into when the *other* account's
change arrives. Small dependency, but it's doing real, repeated work.

## Open follow-ups (flagging, not blocking)

- You chose a full account system over a shared link. Worth confirming:
  should the auth/roles layer be built to support a third person later
  (e.g. a tutor with read-only access, a sibling doing the same course),
  or is "exactly two accounts, permanently" fine to design around now?
  This changes how much abstraction the auth layer needs today.
- No offline/PWA requirement was requested — confirmed responsive web is
  sufficient, so this stack doesn't need to plan for offline-first data
  access.
