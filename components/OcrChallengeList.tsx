'use client';

import Link from 'next/link';
import { Card } from './Card';
import { OCR_CHALLENGES } from '@/lib/exercises/ocr-challenges';

// Real derived status (not-started/attempted/submitted-for-review/
// reviewed) lands in task 35 - placeholder until then, matching how
// PythonProblemList looked before task 26.
export function OcrChallengeList() {
  return (
    <Card>
      <div className="topic-head">
        <div>
          <div className="ref">Py</div>
          <h2>OCR Coding Challenges</h2>
        </div>
      </div>

      <div className="python-list">
        {OCR_CHALLENGES.map((challenge) => (
          <Link
            key={challenge.id}
            href={`/python/ocr/${challenge.id}`}
            className="python-row"
          >
            <div>
              <div className="title">
                {challenge.number}. {challenge.title}
              </div>
              {!challenge.testCases && <div className="due">Manual review only</div>}
            </div>
            <span className="status-badge">Not started</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
