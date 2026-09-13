// Typed, content-in-code surface over the generated reading-material
// artifact (specs/reading-material/design.md §1) - imports
// lib/generated/reading-content.json directly (Next.js/TypeScript import
// JSON natively), produced offline by scripts/ingest-reading-material.mjs
// from reference/book_md/. The running app never parses markdown itself -
// only this generated artifact is ever read at runtime.
import raw from '../generated/reading-content.json';

export type ReadingChapter = {
  id: string; // filename stem, e.g. 'ch23-logic-gates' - stable,
  // code-defined, used as chapter_read_state's key
  chapter: number | string; // string for 'Appendix A'/'Appendix B'
  title: string;
  sectionTitle: string;
  level: 'AS / A Level (Year 12)' | 'A Level (Year 13)';
  pdfPages: string;
  words: number;
  source: string;
  bodyHtml: string; // pre-rendered, images rewritten + wrapped (design.md §1.3)
  exercisesHtml: string; // same treatment, kept separate (requirements.md §3.3)
};

export type ReadingArea = {
  ref: string; // '4.1' etc - matches Topic.ref
  specAreaTitle: string;
  chapters: ReadingChapter[]; // already ordered per requirements.md §1.2:
  // year-then-chapter-number, appendices last
};

export const READING_CONTENT: ReadingArea[] = raw as ReadingArea[];

const YEAR_13_LEVEL = 'A Level (Year 13)';

export function getReadingContentForTopic(topic: {
  ref: string;
}): ReadingArea | undefined {
  return READING_CONTENT.find((area) => area.ref === topic.ref);
}

// requirements.md §3.2 - a simple words-per-minute estimate (design.md §7
// flags the exact constant as not yet tuned). includeYear13 mirrors the
// exam question bank's own level-filter convention: when false, Year 13
// chapters don't count toward the estimate either, matching what's
// actually visible on the page at that moment.
const WORDS_PER_MINUTE = 200;

export function getReadingTimeMinutes(
  area: ReadingArea,
  includeYear13: boolean
): number {
  const words = area.chapters
    .filter((chapter) => includeYear13 || chapter.level !== YEAR_13_LEVEL)
    .reduce((sum, chapter) => sum + chapter.words, 0);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
