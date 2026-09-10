'use client';

import { useState } from 'react';
import { Card } from './Card';
import { OCR_CHALLENGES } from '@/lib/exercises/ocr-challenges';
import { filterOcrChallenges } from '@/lib/exercises/ocr-challenge-search';
import { useOcrChallengeReviewStatuses } from '@/lib/db/use-ocr-challenge-review-statuses';
import { useOcrChallengeDueDates } from '@/lib/db/use-ocr-challenge-reviews';
import { OcrChallengeRow } from './OcrChallengeRow';

export function OcrChallengeList() {
  const { data: reviewStatuses } = useOcrChallengeReviewStatuses();
  const { data: dueDates } = useOcrChallengeDueDates();
  const [query, setQuery] = useState('');

  const visible = filterOcrChallenges(OCR_CHALLENGES, query);

  return (
    <Card>
      <div className="topic-head">
        <div>
          <div className="ref">Py</div>
          <h2>OCR Coding Challenges</h2>
        </div>
      </div>

      <input
        type="search"
        className="python-search"
        aria-label="Search challenges"
        placeholder="Search challenges…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {visible.length === 0 ? (
        <p className="empty-note">No challenges match “{query.trim()}”.</p>
      ) : (
        <div className="python-list">
          {visible.map((challenge) => (
            <OcrChallengeRow
              key={challenge.id}
              challenge={challenge}
              status={reviewStatuses?.[challenge.id] ?? 'not-started'}
              dueDate={dueDates?.[challenge.id] ?? null}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
