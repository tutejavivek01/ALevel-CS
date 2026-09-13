import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';

// Every table in design.md §2.2 - both accounts share one dataset, so
// this isn't filtered by account (design.md §6.6: "both accounts export
// the same complete dataset"). Kept as one flat list, not derived from
// anything, so a future new table is a one-line addition here rather
// than something that could be silently missed.
const EXPORTED_TABLES = [
  'profiles',
  'subtopic_status',
  'subtopic_status_history',
  'subtopic_flags',
  'nea_state',
  'nea_notes',
  'resource_links',
  'glossary_progress',
  'python_problems',
  'python_test_cases',
  'python_submissions',
  'python_submission_results',
  'python_problem_reviews',
  'ocr_challenge_submissions',
  'ocr_challenge_submission_results',
  'ocr_challenge_review_state',
  'ocr_challenge_reviews',
  'ocr_challenge_code_versions',
  'ocr_challenge_version_comments',
  'mastery_attempts',
  'mastery_attempt_items',
  'exam_question_attempts',
  'topic_read_state',
  'chapter_read_state',
  'activity_events',
] as const;

// proxy.ts already redirects an unauthenticated request before it
// reaches here, but this checks again explicitly rather than trusting
// that alone - same "enforce it at the boundary, not just the UI"
// standard as every RLS policy.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const entries = await Promise.all(
    EXPORTED_TABLES.map(async (table) => {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      return [table, data] as const;
    })
  );

  const exportData = Object.fromEntries(entries);
  const filename = `study-data-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
