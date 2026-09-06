import { NEA_SECTIONS, type NeaSection } from './spec/nea';
import { getNeaSectionState, type NeaStateMap } from './db/use-nea-state';
import { NEA_UPCOMING_WINDOW_DAYS } from './config';

// A floor, not an interpolated estimate: only `complete` sections count.
// Deliberately labelled "marks-worth complete" wherever shown, never as
// a predicted grade (requirements.md §4).
export function neaMarksWorthComplete(stateMap: NeaStateMap): number {
  let complete = 0;
  for (const section of NEA_SECTIONS) {
    if (getNeaSectionState(stateMap, section.id).status === 'complete') {
      complete += section.marks;
    }
  }
  return complete;
}

export type NeaDeadline = {
  section: NeaSection;
  status: 'upcoming' | 'overdue';
  targetDate: string;
};

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

// requirements.md §4: sections with a target date that isn't complete
// yet, either overdue (date has passed) or upcoming (within the window).
export function getNeaDeadlines(
  stateMap: NeaStateMap,
  today: Date = new Date()
): NeaDeadline[] {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const deadlines: NeaDeadline[] = [];

  for (const section of NEA_SECTIONS) {
    const state = getNeaSectionState(stateMap, section.id);
    if (state.status === 'complete' || !state.target_date) continue;

    const [year, month, day] = state.target_date.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    const diffDays = daysBetween(todayMidnight, target);

    if (diffDays < 0) {
      deadlines.push({ section, status: 'overdue', targetDate: state.target_date });
    } else if (diffDays <= NEA_UPCOMING_WINDOW_DAYS) {
      deadlines.push({ section, status: 'upcoming', targetDate: state.target_date });
    }
  }

  return deadlines;
}
