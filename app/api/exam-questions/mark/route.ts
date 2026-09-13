import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import {
  getExamQuestionById,
  getChapterForQuestionId,
} from '@/lib/exercises/exam-question-bank';
import { markExamAnswer } from '@/lib/exam-marking/marker';

// Server-side only (specs/exam-question-bank/design.md §3,
// requirements.md §4.1) - the marking API key never reaches the client,
// and question/part content is looked up here from the code-defined bank
// rather than trusted from the request body, so a tampered request can't
// feed the marker fabricated context.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  let body: { questionId?: string; part?: string; answer?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
  const { questionId, answer } = body;
  const part = body.part ?? '';
  if (!questionId || typeof answer !== 'string') {
    return NextResponse.json(
      { error: 'questionId and answer are required' },
      { status: 400 }
    );
  }

  // requirements.md §4.5 - an answer too short to meaningfully mark is
  // declined before spending an API call, not silently marked as 0.
  if (answer.trim().length < 3) {
    return NextResponse.json(
      { error: 'Answer is too short to mark. Write a bit more and try again.' },
      { status: 400 }
    );
  }

  const question = getExamQuestionById(questionId);
  const chapter = getChapterForQuestionId(questionId);
  if (!question || !chapter) {
    return NextResponse.json({ error: 'Unknown question' }, { status: 404 });
  }
  // Matched on partKey (the collision-free identity), not the raw display
  // label - some questions in the source bank repeat a label (e.g. two
  // parts both literally "i"), see exam-question-bank.ts's partKeysFor.
  const partContent = part
    ? question.parts?.find((p) => p.partKey === part)
    : undefined;
  if (part && !partContent) {
    return NextResponse.json({ error: 'Unknown part' }, { status: 404 });
  }

  const partText = partContent?.text ?? question.text ?? question.stem ?? '';
  const marks = partContent
    ? (partContent.marks ?? null)
    : question.marks || null;
  const siblingParts = (question.parts ?? [])
    .filter((p) => p.partKey !== part)
    .map((p) => ({ part: p.part, text: p.text }));

  const normalizedAnswer = answer.trim();

  // requirements.md §4.6 - reuse a prior successfully-marked identical
  // answer to the same part instead of calling the marker again.
  const { data: priorMatch } = await supabase
    .from('exam_question_attempts')
    .select('*')
    .eq('student_id', user.id)
    .eq('question_id', questionId)
    .eq('part', part)
    .eq('marking_status', 'marked')
    .eq('answer', normalizedAnswer)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // requirements.md §4.5 - persist the answer before marking is even
  // attempted, so a marking failure of any kind never loses it.
  const { data: inserted, error: insertError } = await supabase
    .from('exam_question_attempts')
    .insert({
      question_id: questionId,
      part,
      topic_id: chapter.specArea,
      student_id: user.id,
      answer: normalizedAnswer,
      marking_status: 'pending',
    })
    .select()
    .single();
  if (insertError || !inserted) {
    return NextResponse.json(
      { error: insertError?.message ?? 'Could not save the answer' },
      { status: 500 }
    );
  }

  async function finish(update: Record<string, unknown>) {
    const { data: updated, error: updateError } = await supabase
      .from('exam_question_attempts')
      .update(update)
      .eq('id', inserted.id)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json(updated);
  }

  if (priorMatch) {
    return finish({
      marking_status: 'marked',
      awarded: priorMatch.awarded,
      max: priorMatch.max,
      credited: priorMatch.credited,
      missed: priorMatch.missed,
      model_answer: priorMatch.model_answer,
      misconceptions: priorMatch.misconceptions,
      confidence: priorMatch.confidence,
      marked_at: new Date().toISOString(),
    });
  }

  const outcome = await markExamAnswer({
    chapterTitle: chapter.title,
    specArea: chapter.specArea,
    stem: question.stem,
    partText,
    marks,
    siblingParts,
    answer: normalizedAnswer,
    needsReview: question.needsReview,
  });

  if (outcome.status === 'failed') {
    // requirements.md §4.5 - the marker's specific reason (rate limit /
    // auth / schema / generic) is persisted so the UI can show it, rather
    // than being computed and then silently discarded.
    return finish({ marking_status: 'failed', failure_reason: outcome.reason });
  }

  if (outcome.result.unmarkable) {
    return finish({
      marking_status: 'unmarkable',
      missed: outcome.result.missed,
      confidence: outcome.result.confidence,
      marked_at: new Date().toISOString(),
    });
  }

  return finish({
    marking_status: 'marked',
    awarded: outcome.result.awarded,
    max: outcome.result.max,
    credited: outcome.result.credited,
    missed: outcome.result.missed,
    model_answer: outcome.result.model_answer,
    misconceptions: outcome.result.misconceptions,
    confidence: outcome.result.confidence,
    marked_at: new Date().toISOString(),
  });
}
