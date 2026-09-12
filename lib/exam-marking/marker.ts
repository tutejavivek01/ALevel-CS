import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

// Server-side only AI marking (specs/exam-question-bank/design.md §3,
// requirements.md §4). This module never runs in the browser - it's only
// ever imported from app/api/exam-questions/mark/route.ts, so
// ANTHROPIC_API_KEY (server-only env var) never reaches the client.
//
// Structured Outputs, not prose parsed after the fact (requirements.md
// §4.3): the schema itself constrains the model's response, so a
// malformed result is a request-level failure to handle (§4.5), not
// something to defensively re-parse.
export const MarkingResultSchema = z.object({
  awarded: z.number(),
  max: z.number(),
  credited: z.array(z.string()),
  missed: z.array(z.string()),
  model_answer: z.string(),
  misconceptions: z.array(z.string()),
  confidence: z.number(),
  // Not in the requirements doc's literal field list, but needed to carry
  // out §4.4's "say the answer is unmarkable rather than guess" rule
  // structurally, distinct from a genuine 0/max score.
  unmarkable: z.boolean(),
});
export type MarkingResult = z.infer<typeof MarkingResultSchema>;

export type MarkingRequest = {
  chapterTitle: string;
  specArea: string;
  stem?: string;
  partText: string;
  marks: number | null; // null when the source's own allocation is unreadable (req. §2.6/§4.2)
  siblingParts: { part: string; text: string }[];
  answer: string;
  needsReview: boolean;
};

export type MarkingOutcome =
  | { status: 'marked'; result: MarkingResult }
  | { status: 'failed'; reason: string };

const MARKING_SYSTEM_PROMPT = `You are marking a student's answer to an AQA A-Level Computer Science
exam-style question, to the standard a real AQA examiner would use.

Rules:
- Mark strictly to the stated mark allocation. Do not inflate marks.
- Only award credit for content the student actually wrote - never for
  something implied, assumed, or "they probably meant".
- Credit valid alternative phrasings of a correct point; do not require
  one canonical wording.
- If the question genuinely depends on a diagram, table, or figure that
  is not reproduced in the text you were given, set unmarkable to true,
  set awarded to 0, and explain why in "missed" rather than guessing at
  what the figure might show.
- Respond with the structured fields only - awarded, max, credited,
  missed, model_answer, misconceptions, confidence, unmarkable.`;

function buildPrompt(request: MarkingRequest): string {
  const siblingText = request.siblingParts.length
    ? `\nOther parts of the same question (for context only, not to be marked here):\n${request.siblingParts
        .map((p) => `(${p.part}) ${p.text}`)
        .join('\n')}`
    : '';
  const marksLine =
    request.marks === null
      ? "This part's mark allocation is unknown (unreadable in the source) - use your own best-effort judgement of a reasonable allocation."
      : `This part is worth ${request.marks} mark(s).`;
  const reviewNote = request.needsReview
    ? '\nNote: this question is flagged as referencing a diagram/table/figure that could not be reproduced from the source. If the missing figure is required to mark this part, mark it unmarkable.'
    : '';

  return `Chapter: ${request.chapterTitle} (spec area ${request.specArea})
${request.stem ? `Question stem: ${request.stem}\n` : ''}Part being marked: ${request.partText}
${marksLine}${siblingText}${reviewNote}

Student's answer:
${request.answer}`;
}

function stubMark(request: MarkingRequest): MarkingOutcome {
  // Deterministic test-mode marker (specs/exam-question-bank/design.md
  // §6) - lets the full submit -> persist -> mark -> display pipeline be
  // exercised in Playwright without a live API call or its cost. Enabled
  // explicitly via EXAM_MARKING_STUB=true, never implicitly.
  const max = request.marks ?? 1;
  const trimmed = request.answer.trim();
  const awarded = trimmed.length === 0 ? 0 : max;
  return {
    status: 'marked',
    result: {
      awarded,
      max,
      credited: awarded > 0 ? ['(stub) answer accepted'] : [],
      missed: awarded > 0 ? [] : ['(stub) no answer given'],
      model_answer: '(stub marker - no real model answer)',
      misconceptions: [],
      confidence: 1,
      unmarkable: false,
    },
  };
}

export async function markExamAnswer(
  request: MarkingRequest
): Promise<MarkingOutcome> {
  if (process.env.EXAM_MARKING_STUB === 'true') {
    return stubMark(request);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      status: 'failed',
      reason: 'Marking is not configured (no API key set).',
    };
  }

  try {
    const client = new Anthropic();
    const message = await client.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 2048,
      system: MARKING_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildPrompt(request) }],
      output_config: { format: zodOutputFormat(MarkingResultSchema) },
    });

    if (!message.parsed_output) {
      return {
        status: 'failed',
        reason: 'Marking response did not match the expected schema.',
      };
    }
    return { status: 'marked', result: message.parsed_output };
  } catch (err) {
    // Most-specific-first, matching the claude-api skill's guidance -
    // rate limit / auth / bad request are distinguishable failure modes,
    // even though every one of them lands as the same 'failed' outcome
    // here (requirements.md §4.5 doesn't require the student to see the
    // difference, only that nothing is lost and a retry is possible).
    if (err instanceof Anthropic.RateLimitError) {
      return {
        status: 'failed',
        reason: 'Marking is rate-limited right now - try again shortly.',
      };
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return {
        status: 'failed',
        reason: 'Marking is misconfigured (authentication failed).',
      };
    }
    if (err instanceof Anthropic.APIError) {
      return {
        status: 'failed',
        reason: `Marking service error: ${err.message}`,
      };
    }
    return {
      status: 'failed',
      reason: err instanceof Error ? err.message : 'Unknown marking error',
    };
  }
}
