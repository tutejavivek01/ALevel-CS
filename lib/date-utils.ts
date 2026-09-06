const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Whole days between two Date instants, truncated toward zero - used by
// both the NEA and Python due-date banners (lib/nea-progress.ts,
// lib/python-deadlines.ts) to compare a target date against "today" at
// midnight.
export function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}
