# Principles — non-negotiable constraints

These three hold regardless of stack, deadline pressure, or how small a
change looks. If a feature spec conflicts with one of these, the principle
wins and the spec gets reworked.

## 1. Progress data is never silently lost or overwritten

- Two people can open this at once. A write from one must not silently
  clobber a concurrent write from the other — the failure mode to design
  against is "I marked this confident this morning and it's gone tonight,"
  with no error and no explanation.
- The UI must not claim success ("Synced") until the write is actually
  durable. The prototype's debounced-save-then-generic-error-state
  (`Could not sync`) is a reasonable starting shape, but sync failures must
  stay visible and retryable in the real build — never swallowed.
- No bulk-overwrite or "reset progress" action without explicit
  confirmation, and there should be a way to recover from an accidental
  one (versioned history, soft-delete, or at minimum backups) — not just
  "don't do that."
- Prefer merge-safe, field-level writes over whole-document overwrites
  anywhere concurrent editing is realistic (subtopic status, NEA notes,
  target dates).

## 2. Syllabus content must stay accurate to the real AQA 7517 spec

- The 14 spec section titles, sub-topic checklist items, and NEA
  mark-scheme rows are reference data that must trace back to the actual
  AQA specification document — not paraphrased from memory, not drifted
  from the prototype without re-checking.
- Any change to this content must be checked against the source AQA spec
  before shipping, not assumed correct because it matches what's already
  there.
- Mark allocations and section names for the NEA must match AQA's actual
  mark scheme exactly (see the open question in `product.md` about the
  five-vs-six NEA section count — that has to be resolved against AQA's
  real document, not decided by preference).

## 3. Practice exercises must be genuinely checkable, not decorative

- Trace-table exercises must validate each cell against a real, computed
  expected value. The prototype already does this correctly — preserve
  the mechanism, don't regress to "show the answer and trust the student."
- FSM exercises in the prototype only reveal a written answer on request,
  with no automated check. **This does not meet the bar** and must become
  interactive in the real build — e.g. the student traces the input and
  the app validates the resulting state (and output sequence, for Mealy
  machines), rather than asking them to self-grade against prose.
- Glossary flashcards' "Got it" is inherently self-reported, which is
  acceptable for a flashcard format — but self-report and verified-correct
  are different kinds of signal. Don't let a flashcard "Got it" silently
  count the same as a checked-correct answer elsewhere in the app.

## Proposed addition (flagging for your decision, not yet adopted)

Given this stores a minor's personal study data: no third-party analytics
or tracking scripts, and no sharing of her data with any service beyond
what's strictly needed to run the app (hosting + database). Let me know if
you want this promoted to a fourth non-negotiable or left as a general
default.
