import { createClient } from './supabase-browser';

// A failed write isn't an event that happened, so callers only invoke
// this after their real mutation already succeeded (design.md §6.5). A
// failure here is logged but never surfaces to the user or fails the
// caller's mutation - the activity trail is an enrichment, not the
// source of truth for what changed.
export async function logActivity(params: {
  eventType: string;
  summary: string;
  targetRef?: string;
}) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('activity_events').insert({
      actor_id: user.id,
      event_type: params.eventType,
      summary: params.summary,
      target_ref: params.targetRef ?? null,
    });
    if (error) throw error;
  } catch (error) {
    console.error('logActivity failed', error);
  }
}
