import type { ExamChapter } from './exam-question-bank';
import type { ExamQuestionAttempt } from '@/lib/db/use-exam-question-attempts';

// Pure progress/gate computations (specs/exam-question-bank/design.md
// §4, requirements.md §5) - no Supabase, no network, Vitest-testable
// directly against fixed fixtures.

export type TopicExamProgress = {
  partsAttempted: number;
  totalParts: number;
  marksAvailable: number;
  marksAwarded: number;
  lastAttemptAt: string | null;
  topMisconceptions: { text: string; count: number }[];
};

// Every answerable unit in a topic's chapters: one per part, or one for
// a question with no parts (part = '').
function allParts(
  chapters: ExamChapter[]
): { questionId: string; part: string; marks: number | null }[] {
  const parts: { questionId: string; part: string; marks: number | null }[] =
    [];
  for (const chapter of chapters) {
    for (const question of chapter.questions) {
      if (question.parts && question.parts.length > 0) {
        for (const part of question.parts) {
          parts.push({
            questionId: question.id,
            part: part.partKey,
            marks: part.marks ?? null,
          });
        }
      } else {
        parts.push({
          questionId: question.id,
          part: '',
          marks: question.marks || null,
        });
      }
    }
  }
  return parts;
}

export function computeTopicExamProgress(
  chapters: ExamChapter[],
  latestAttemptsByPart: Record<string, ExamQuestionAttempt>
): TopicExamProgress {
  const parts = allParts(chapters);
  const marksAvailable = parts.reduce((sum, p) => sum + (p.marks ?? 0), 0);

  let partsAttempted = 0;
  let marksAwarded = 0;
  let lastAttemptAt: string | null = null;
  const misconceptionCounts = new Map<string, number>();

  for (const part of parts) {
    const attempt = latestAttemptsByPart[`${part.questionId}:${part.part}`];
    if (!attempt) continue;
    partsAttempted++;
    if (!lastAttemptAt || attempt.created_at > lastAttemptAt) {
      lastAttemptAt = attempt.created_at;
    }
    if (attempt.marking_status === 'marked') {
      marksAwarded += attempt.awarded ?? 0;
      for (const m of attempt.misconceptions ?? []) {
        misconceptionCounts.set(m, (misconceptionCounts.get(m) ?? 0) + 1);
      }
    }
  }

  const topMisconceptions = [...misconceptionCounts.entries()]
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    partsAttempted,
    totalParts: parts.length,
    marksAvailable,
    marksAwarded,
    lastAttemptAt,
    topMisconceptions,
  };
}

export type ExamGateResult = {
  passed: boolean;
  coveragePct: number;
  qualityPct: number;
};

// requirements.md §5.2 - the exam-question route's mastery-gate
// threshold: attempt parts covering >=50% of the topic's available
// marks, and average >=70% of marks awarded across those attempted
// parts. Only a genuinely completed 'marked' result counts toward
// either figure - unmarkable/failed/pending attempts count toward
// neither the coverage nor the quality numerator/denominator.
export const EXAM_GATE_COVERAGE_THRESHOLD = 0.5;
export const EXAM_GATE_QUALITY_THRESHOLD = 0.7;

export function computeExamGateStatus(
  chapters: ExamChapter[],
  latestAttemptsByPart: Record<string, ExamQuestionAttempt>
): ExamGateResult {
  const parts = allParts(chapters);

  let attemptedMarks = 0;
  let awardedMarks = 0;

  for (const part of parts) {
    const attempt = latestAttemptsByPart[`${part.questionId}:${part.part}`];
    if (!attempt || attempt.marking_status !== 'marked') continue;
    const max = attempt.max ?? part.marks ?? 0;
    attemptedMarks += max;
    awardedMarks += attempt.awarded ?? 0;
  }

  const marksAvailable = parts.reduce((sum, p) => sum + (p.marks ?? 0), 0);
  const coveragePct = marksAvailable > 0 ? attemptedMarks / marksAvailable : 0;
  const qualityPct = attemptedMarks > 0 ? awardedMarks / attemptedMarks : 0;
  const passed =
    coveragePct >= EXAM_GATE_COVERAGE_THRESHOLD &&
    qualityPct >= EXAM_GATE_QUALITY_THRESHOLD;

  return { passed, coveragePct, qualityPct };
}
