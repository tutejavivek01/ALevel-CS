import type { GlossaryTerm } from './glossary';
import { GLOSSARY_RESURFACE_DAYS, GLOSSARY_RESURFACE_PROBABILITY } from '@/lib/config';

export type GlossaryProgress = {
  mastered: boolean;
  nextEligibleAt: string | null; // ISO timestamp
};

export type GlossaryProgressMap = Record<string, GlossaryProgress>;

// Set on marking a term "Got it" (requirements.md §5.3, design.md §6.4).
export function markMastered(now: Date): GlossaryProgress {
  const nextEligibleAt = new Date(now);
  nextEligibleAt.setDate(nextEligibleAt.getDate() + GLOSSARY_RESURFACE_DAYS);
  return { mastered: true, nextEligibleAt: nextEligibleAt.toISOString() };
}

// "Review again" - explicitly not mastered, stays in the main rotation.
export function markNotMastered(): GlossaryProgress {
  return { mastered: false, nextEligibleAt: null };
}

export function isEligibleToResurface(progress: GlossaryProgress | undefined, now: Date): boolean {
  if (!progress?.mastered || !progress.nextEligibleAt) return false;
  return new Date(progress.nextEligibleAt).getTime() <= now.getTime();
}

// Picks the next flashcard: the main rotation is every not-yet-mastered
// term; a mastered term only re-enters the deck once its cooldown has
// passed, and even then only at ~1-in-5 frequency (a probability check on
// each draw, not a fixed queue position) rather than displacing the main
// rotation, per requirements.md §5.3.
export function pickNextTerm(
  terms: GlossaryTerm[],
  progress: GlossaryProgressMap,
  now: Date,
  random: () => number = Math.random
): GlossaryTerm {
  const unmastered = terms.filter((t) => !progress[t.id]?.mastered);
  const eligibleMastered = terms.filter((t) => isEligibleToResurface(progress[t.id], now));

  if (eligibleMastered.length > 0 && unmastered.length > 0) {
    const drawEligible = random() < GLOSSARY_RESURFACE_PROBABILITY;
    const pool = drawEligible ? eligibleMastered : unmastered;
    return pool[Math.floor(random() * pool.length)];
  }

  // No unmastered terms left (everything's been "Got it" at least once):
  // draw from whichever pool actually has something in it, rather than
  // going silent because the main rotation is empty.
  const pool = unmastered.length > 0 ? unmastered : eligibleMastered.length > 0 ? eligibleMastered : terms;
  return pool[Math.floor(random() * pool.length)];
}
