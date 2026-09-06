'use client';

import { useState } from 'react';
import { GLOSSARY_TERMS } from '@/lib/exercises/glossary';
import { markMastered, markNotMastered, pickNextTerm } from '@/lib/exercises/glossary-drill';
import { useGlossaryProgress, useSetGlossaryProgress } from '@/lib/db/use-glossary-progress';

export function GlossaryDrill() {
  const { data: progress } = useGlossaryProgress();
  const setProgress = useSetGlossaryProgress();
  // Deliberately deterministic, not pickNextTerm() - a random initial
  // pick would run once during SSR and again during client hydration
  // with a different result, causing a hydration mismatch. Every card
  // after this one is chosen client-side only, from a button handler,
  // using whatever progress is actually current by then.
  const [currentTerm, setCurrentTerm] = useState(GLOSSARY_TERMS[0]);
  const [flipped, setFlipped] = useState(false);

  function next() {
    setCurrentTerm(pickNextTerm(GLOSSARY_TERMS, progress ?? {}, new Date()));
    setFlipped(false);
  }

  function handleGotIt() {
    const result = markMastered(new Date());
    setProgress.mutate({
      termId: currentTerm.id,
      mastered: result.mastered,
      nextEligibleAt: result.nextEligibleAt,
    });
    next();
  }

  function handleReviewAgain() {
    const result = markNotMastered();
    setProgress.mutate({
      termId: currentTerm.id,
      mastered: result.mastered,
      nextEligibleAt: result.nextEligibleAt,
    });
    next();
  }

  const masteredCount = Object.values(progress ?? {}).filter((p) => p.mastered).length;

  return (
    <div className="flash">
      <div className="flash-progress">
        {masteredCount} / {GLOSSARY_TERMS.length} mastered
      </div>
      <div className="flash-card" onClick={() => setFlipped((f) => !f)}>
        <span className="tag">{flipped ? 'Definition' : 'Term'}</span>
        {flipped ? currentTerm.definition : currentTerm.term}
      </div>
      <div className="flash-actions">
        <button className="btn2 alt" onClick={handleReviewAgain}>
          Review again
        </button>
        <button className="btn2" onClick={handleGotIt}>
          Got it
        </button>
      </div>
    </div>
  );
}
