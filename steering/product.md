# Product

## What this is

A study companion website for AQA A-Level Computer Science (7517), built for
[you] and your daughter (Year 12) to track her progress together across the
whole two-year specification. It replaces the single-page prototype in
`reference/prototype.html`, which already proves out the core idea: one
shared, structured view of what's been covered, what's still shaky, and
what's left before the exams and the NEA deadline.

## Who it's for

Exactly two people today: this student and this one parent-collaborator,
working through this one spec side by side. Real accounts were chosen over
a bare shared link (see `tech-stack.md`), which leaves room to add a third
account later — a sibling doing the same course, a tutor — without a
redesign, but that is not a goal being built toward now. This is not a
class tool, not a school rollout, not a public product.

## Core value

1. **One accurate map of the AQA 7517 spec (4.1–4.14)** showing honest,
   self-assessed confidence per sub-topic — not just "covered / not
   covered," but not-started / learning / practising / confident.
2. **A single shared source of truth.** Either person updates it, the other
   sees it immediately. No emailing screenshots of revision progress, no
   "did you do X" text threads.
3. **A curated, short list of trusted external resources per topic**
   (AQA's own spec, Isaac CS, Craig 'n' Dave, PMT, Save My Exams, Seneca,
   Codewars) instead of an open-ended search every time.
4. **Real practice for Unit 2 (Theory of Computation)** — trace tables,
   FSMs, glossary — graded against a correct answer, so "practising"
   produces an actual pass/fail signal, not just a feeling.
5. **A live view of NEA (coursework) progress** against the real AQA mark
   scheme sections, with target dates, so the 20%-of-the-grade project
   doesn't quietly slip.

## What this deliberately does NOT try to be

- **Not a full LMS.** No class rosters, no teacher-facing grading
  rubrics/analytics, no multi-student anything. One narrow, deliberate
  exception: the parent can assign Python practice problems for the
  student to solve, auto-checked against test cases (see
  `requirements.md` §8) — this stays scoped to one parent and one
  student, not general assignment infrastructure for a class.
- **Not a replacement for her teacher, lessons, or the school's own
  resources/past papers.** It's a tracker and drill layered on top of what
  the school already provides, not a substitute curriculum.
- **Not a content-authoring platform or wiki.** The spec content and
  resource links are curated and maintained deliberately by the two of
  you, not opened up as a general knowledge base anyone can extend.
- **Not a general-purpose flashcard/SRS app.** The glossary drill exists to
  serve Unit 2 specifically, not to grow into Anki.
- **Not a public product.** No discovery, no signup flow for strangers, no
  growth mechanics.

## Resolved: NEA section count

Confirmed during the requirements interview (see `requirements.md` §4):
the prototype's **six**-row breakdown (Analysis / Documented Design /
Technical Solution – Completeness / Technical Solution – Techniques Used
/ Testing / Evaluation) is the canonical one, matching AQA's actual mark
scheme. Treat this as settled, accurate content per `principles.md` §2.
