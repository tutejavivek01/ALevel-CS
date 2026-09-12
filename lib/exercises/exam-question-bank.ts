// Typed, content-in-code surface over the OCR-extracted exam question
// bank (specs/exam-question-bank/design.md §1, requirements.md §1.1).
// Imports reference/aqa_cs_question_bank.json directly - Next.js/
// TypeScript import JSON natively, no loader needed - and normalises its
// two real structural quirks (verified by direct parse, not assumed):
// appendices are flat chapter-shaped objects, not nested under a
// `.chapters` array the way `sections[i].chapters` is; and a part can be
// missing its `marks` key entirely (not just null).
//
// No question/chapter content is ever written to the database - only
// mutable state (exam_question_attempts) is, keyed by each question's
// stable `id`. See lib/spec/topics.ts / ocr-challenges.ts for the same
// pattern elsewhere in this app.

import raw from '../../reference/aqa_cs_question_bank.json';

export type ExamQuestionPart = {
  part: string; // display label, e.g. "i" - not always unique within a question, see partKey
  partKey: string; // stable, collision-free identity: same as `part` unless the
  // source repeats a label within one question (a real OCR-extraction
  // quirk - e.g. ch8-q1's two parts are both literally labelled "i"),
  // in which case every occurrence of that label is suffixed "-1"/"-2"/...
  // so React keys, the DB `part` column, and attempt lookups never collide.
  text: string;
  marks?: number; // absent (not null) when the source's mark allocation for this part was unreadable
  marks_unreadable?: boolean;
};

export type ExamQuestion = {
  id: string;
  number: number;
  pdfPage: number;
  sourceExam: string | null;
  stem?: string;
  text?: string;
  parts?: ExamQuestionPart[];
  marks: number;
  marksPartial: boolean;
  marksUnreadable: boolean;
  hasFigure: boolean;
  needsReview: boolean;
};

export type ExamChapter = {
  chapter: number | string; // string for 'Appendix A' / 'Appendix B'
  title: string;
  specArea: string; // '4.1' etc - joins to Topic.ref
  specAreaTitle: string;
  level: string;
  questions: ExamQuestion[];
};

type RawPart = {
  part: string;
  text: string;
  marks?: number | null;
  marks_unreadable?: boolean;
};

type RawQuestion = {
  id: string;
  number: number;
  pdf_page: number;
  source_exam?: string | null;
  stem?: string;
  text?: string;
  parts?: RawPart[];
  marks?: number;
  marks_partial?: boolean;
  marks_unreadable?: boolean;
  has_figure?: boolean;
  needs_review?: boolean;
};

type RawChapter = {
  chapter: number | string;
  title: string;
  spec_area: string;
  spec_area_title: string;
  level: string;
  questions: RawQuestion[];
};

type RawBank = {
  sections: { section: number; title: string; chapters: RawChapter[] }[];
  appendices: RawChapter[];
};

// Suffix every occurrence of a label with its 1-based occurrence number
// ("i" -> "i-1", "i-2", ...) whenever a question repeats a part label -
// left untouched ("i") when the label is already unique in this question.
function partKeysFor(parts: RawPart[]): string[] {
  const counts = new Map<string, number>();
  for (const p of parts) counts.set(p.part, (counts.get(p.part) ?? 0) + 1);
  const seen = new Map<string, number>();
  return parts.map((p) => {
    if ((counts.get(p.part) ?? 0) <= 1) return p.part;
    const occurrence = (seen.get(p.part) ?? 0) + 1;
    seen.set(p.part, occurrence);
    return `${p.part}-${occurrence}`;
  });
}

function normalizeQuestion(q: RawQuestion): ExamQuestion {
  const partKeys = q.parts ? partKeysFor(q.parts) : undefined;
  return {
    id: q.id,
    number: q.number,
    pdfPage: q.pdf_page,
    sourceExam: q.source_exam ?? null,
    stem: q.stem,
    text: q.text,
    parts: q.parts?.map((p, i) => ({
      part: p.part,
      partKey: partKeys![i],
      text: p.text,
      marks: p.marks ?? undefined,
      marks_unreadable: p.marks_unreadable,
    })),
    marks: q.marks ?? 0,
    marksPartial: q.marks_partial ?? false,
    marksUnreadable: q.marks_unreadable ?? false,
    hasFigure: q.has_figure ?? false,
    needsReview: q.needs_review ?? false,
  };
}

function normalizeChapter(c: RawChapter): ExamChapter {
  return {
    chapter: c.chapter,
    title: c.title,
    specArea: c.spec_area,
    specAreaTitle: c.spec_area_title,
    level: c.level,
    questions: c.questions.map(normalizeQuestion),
  };
}

const bank = raw as RawBank;

// Flattened: every section's chapters, plus the two (flat, un-nested)
// appendices, as one ordered list.
export const EXAM_CHAPTERS: ExamChapter[] = [
  ...bank.sections.flatMap((section) => section.chapters.map(normalizeChapter)),
  ...bank.appendices.map(normalizeChapter),
];

export function getExamChaptersForTopic(topicRef: string): ExamChapter[] {
  return EXAM_CHAPTERS.filter((chapter) => chapter.specArea === topicRef);
}

export function getExamQuestionById(id: string): ExamQuestion | undefined {
  for (const chapter of EXAM_CHAPTERS) {
    const found = chapter.questions.find((q) => q.id === id);
    if (found) return found;
  }
  return undefined;
}

// The chapter (with its topic-joining spec area) a given question id
// belongs to - used to denormalise topic_id onto exam_question_attempts
// at insert time (design.md §2) without a second lookup at read time.
export function getChapterForQuestionId(id: string): ExamChapter | undefined {
  return EXAM_CHAPTERS.find((chapter) =>
    chapter.questions.some((q) => q.id === id)
  );
}
