'use client';

import { useState } from 'react';

// One chapter's read tick (specs/reading-material/design.md §4.3,
// requirements.md §4.2) - the read-state map and mutation are owned by
// the parent (ReadingPageBody), which already fetches both for every
// chapter on the page at once rather than one query per chapter.
//
// Deliberately placed inside the chapter's expanded body, not its
// <summary> - a checkbox nested in a <summary> fights the native
// click-to-toggle-disclosure behaviour there. Placing it in the body
// also nudges the actual intended flow: open the chapter, read it, then
// tick it, rather than ticking without ever opening it.
export function ChapterReadTick({
  chapterId,
  readAt,
  onToggle,
}: {
  chapterId: string;
  readAt: string | null | undefined;
  onToggle: (chapterId: string, read: boolean) => void;
}) {
  // A local override for the instant between the click and the
  // optimistic mutation's cache write landing - useOptimisticMutation's
  // onMutate awaits cancelQueries first, so there's a real (if brief) gap
  // where a plain `checked={Boolean(readAt)}` would still reflect the old
  // value and React would visibly snap the checkbox back before the
  // optimistic update arrives. Cleared once readAt actually catches up.
  const [pending, setPending] = useState<boolean | null>(null);
  // React's documented "adjust state when a prop changes" pattern
  // (calling setState directly during render, not in an effect - see
  // https://react.dev/learn/you-might-not-need-an-effect): once the real
  // readAt value catches up with what was optimistically expected, drop
  // the local override on this same render rather than one render late.
  const [prevReadAt, setPrevReadAt] = useState(readAt);
  if (readAt !== prevReadAt) {
    setPrevReadAt(readAt);
    if (pending !== null && Boolean(readAt) === pending) setPending(null);
  }
  const isRead = pending ?? Boolean(readAt);

  function handleChange(checked: boolean) {
    setPending(checked);
    onToggle(chapterId, checked);
  }

  return (
    <label className="reading-chapter-tick">
      <input
        type="checkbox"
        checked={isRead}
        onChange={(e) => handleChange(e.target.checked)}
      />
      Mark this chapter read
    </label>
  );
}
