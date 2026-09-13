'use client';

import { useTopicReadState, useSetTopicRead } from '@/lib/db/use-reading-state';

// The area-level "Mark as read" control (specs/reading-material/design.md
// §4.3, requirements.md §4.1) - a real toggle, not a display of derived
// chapter-tick state.
export function MarkAsReadToggle({ topicRef }: { topicRef: string }) {
  const { data: state, isLoading } = useTopicReadState(topicRef);
  const setRead = useSetTopicRead(topicRef);
  const isRead = Boolean(state?.read_at);

  return (
    <button
      type="button"
      className={`btn2 ${isRead ? 'alt' : ''}`}
      disabled={isLoading || setRead.isPending}
      onClick={() => setRead.mutate(!isRead)}
    >
      {isRead ? '✓ Marked as read' : 'Mark as read'}
    </button>
  );
}
