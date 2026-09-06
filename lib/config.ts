// Shared tunable constants - kept in one place per design.md §6.3/§9.7
// so each is a one-line change if wrong in practice, rather than a magic
// number scattered inline.

// requirements.md §4: a section is "upcoming" if its target date falls
// within this many days and it isn't yet complete.
export const NEA_UPCOMING_WINDOW_DAYS = 14;

// requirements.md §8.4 / design.md §6.7 - set when task 24 builds the
// Pyodide execution timeout.
// export const PYTHON_EXEC_TIMEOUT_MS = 5000;
