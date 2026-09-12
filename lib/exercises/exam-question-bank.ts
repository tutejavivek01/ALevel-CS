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
  part: string;
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

function normalizeQuestion(q: RawQuestion): ExamQuestion {
  return {
    id: q.id,
    number: q.number,
    pdfPage: q.pdf_page,
    sourceExam: q.source_exam ?? null,
    stem: q.stem,
    text: q.text,
    parts: q.parts?.map((p) => ({
      part: p.part,
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
