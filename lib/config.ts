// Shared tunable constants - kept in one place per design.md §6.3/§9.7
// so each is a one-line change if wrong in practice, rather than a magic
// number scattered inline.

// requirements.md §4: a section is "upcoming" if its target date falls
// within this many days and it isn't yet complete.
export const NEA_UPCOMING_WINDOW_DAYS = 14;

// requirements.md §8.1/§10, task 27: a separate constant from
// NEA_UPCOMING_WINDOW_DAYS (same value for now) rather than reusing it
// directly - Python due dates and NEA target dates are conceptually
// different deadlines, and this keeps each independently tunable
// without the other's name implying a scope it doesn't have.
export const PYTHON_DUE_UPCOMING_WINDOW_DAYS = 14;

// requirements.md §8.4 / design.md §6.7: how long a submission may run
// before the main thread writes SIGINT into Pyodide's interrupt buffer.
export const PYTHON_EXEC_TIMEOUT_MS = 5000;

// requirements.md §5.3 / design.md §6.4: a mastered glossary term
// becomes eligible to resurface after this many days...
export const GLOSSARY_RESURFACE_DAYS = 3;
// ...and once eligible, is mixed into the draw at roughly this
// probability rather than replacing the main rotation entirely.
export const GLOSSARY_RESURFACE_PROBABILITY = 0.2; // ~1-in-5
