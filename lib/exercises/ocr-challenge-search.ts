import type { OcrChallenge } from './ocr-challenges';

// requirements.md §8.14 - a find-as-you-type convenience over the fixed
// 80-challenge set (§8.8), not a search feature: a plain case-insensitive
// substring match against the booklet number, title, or description, with
// no ranking or tokenising. Kept pure and split out of the
// verbatim-content ocr-challenges.ts module (the same way
// ocr-challenge-deadlines.ts keeps its logic separate) so __tests__ can
// cover the match rules without rendering the list.
export function filterOcrChallenges(
  challenges: OcrChallenge[],
  query: string
): OcrChallenge[] {
  const q = query.trim().toLowerCase();
  if (!q) return challenges;
  return challenges.filter(
    (challenge) =>
      challenge.title.toLowerCase().includes(q) ||
      // Substring, not equality: "4" matches challenges 4, 14, 40-49.
      String(challenge.number).includes(q) ||
      challenge.description.toLowerCase().includes(q)
  );
}
