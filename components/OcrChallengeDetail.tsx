'use client';

import { useState } from 'react';
import { Card } from './Card';
import { PythonEditor } from './PythonEditor';
import type { OcrChallenge } from '@/lib/exercises/ocr-challenges';

type Props = {
  challenge: OcrChallenge;
};

// Static for now (task 33) - no run/submit yet, matching task 22's own
// scope for the parent-authored problem detail page. Execution,
// grading, and review workflow land in task 35.
export function OcrChallengeDetail({ challenge }: Props) {
  const [code, setCode] = useState(challenge.starterCode ?? '');

  return (
    <Card>
      <div className="topic-head">
        <div>
          <div className="ref">Py · #{challenge.number}</div>
          <h2>{challenge.title}</h2>
          {!challenge.testCases && (
            <span className="unit-badge">Manual review only - no automated tests</span>
          )}
        </div>
      </div>

      <p className="blurb" style={{ whiteSpace: 'pre-wrap' }}>
        {challenge.description}
      </p>

      {/* No challenge currently sets imageUrl (see ocr-challenges.ts's
          header comment on "Checkmate checker") - rendering for it isn't
          built here yet, to avoid carrying unused, unexercised UI. */}

      {challenge.extensions && challenge.extensions.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginTop: 20 }}>
            Extensions (optional)
          </h3>
          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {challenge.extensions.map((extension, index) => (
              <li key={index} style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
                {extension}
              </li>
            ))}
          </ul>
        </>
      )}

      <h3 className="section-title" style={{ marginTop: 20 }}>
        Your code
      </h3>
      <PythonEditor value={code} onChange={setCode} />

      <div className="ex-actions">
        <button className="btn2" disabled title="Execution lands in task 35">
          Run
        </button>
      </div>
    </Card>
  );
}
