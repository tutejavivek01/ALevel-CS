'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Topic, ReadingArea, ReadingChapter } from '@/lib/spec';
import { getReadingTimeMinutes } from '@/lib/spec';
import {
  useChapterReadStates,
  useSetChapterRead,
} from '@/lib/db/use-reading-state';
import { Card } from './Card';
import { ReadingChapterBody } from './ReadingChapterBody';
import { ChapterReadTick } from './ChapterReadTick';
import { MarkAsReadToggle } from './MarkAsReadToggle';

const YEAR_13_LEVEL = 'A Level (Year 13)';
// Same key ExamQuestionsSection already uses (requirements.md §1.2 - "the
// existing Year 12/13 level-filter convention already established by the
// exam question bank"): once a student says "show me Year 13" they'd
// want that everywhere, not a second, independent toggle on this page.
const YEAR_13_PREF_KEY = 'exam-include-year-13';

function readYear13Pref(): boolean {
  try {
    return window.localStorage.getItem(YEAR_13_PREF_KEY) === 'true';
  } catch {
    return false;
  }
}

function chapterLabel(chapter: ReadingChapter): string {
  return typeof chapter.chapter === 'string'
    ? chapter.chapter
    : `Chapter ${chapter.chapter}`;
}

// A plain `<a href="#id">` alone doesn't reliably open a same-page
// collapsed <details> on click in every browser (confirmed directly -
// Chromium's native fragment-targeting doesn't kick in here), so a jump
// to a collapsed chapter would otherwise look like nothing happened.
// Open it explicitly, then let the anchor's default hash-navigation
// still run to update the URL and scroll.
function handleJumpClick(id: string) {
  const target = document.getElementById(id);
  if (target instanceof HTMLDetailsElement) target.open = true;
}

// The per-spec-area reading page (specs/reading-material/design.md §3,
// requirements.md §3). This component is the client boundary (like
// ExamQuestionsSection) - the route itself stays a server component that
// only fetches content-in-code data.
export function ReadingPageBody({
  topic,
  area,
  hasExamQuestions,
}: {
  topic: Topic;
  area: ReadingArea;
  hasExamQuestions: boolean;
}) {
  const [includeYear13, setIncludeYear13] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIncludeYear13(readYear13Pref());
  }, []);

  function updateIncludeYear13(value: boolean) {
    setIncludeYear13(value);
    try {
      window.localStorage.setItem(YEAR_13_PREF_KEY, String(value));
    } catch {
      // per-viewer convenience only - never block on this.
    }
  }

  const hasYear13 = area.chapters.some((c) => c.level === YEAR_13_LEVEL);
  const chapters = includeYear13
    ? area.chapters
    : area.chapters.filter((c) => c.level !== YEAR_13_LEVEL);
  const readingMinutes = getReadingTimeMinutes(area, includeYear13);
  const source = area.chapters[0]?.source;

  const allChapterIds = area.chapters.map((c) => c.id);
  const { data: chapterReadStates } = useChapterReadStates(
    topic.ref,
    allChapterIds
  );
  const { setChapterRead } = useSetChapterRead(topic.ref, allChapterIds);

  // Divider position: the first chapter (in reading order) whose level is
  // Year 13, when both levels are present in what's currently shown.
  const firstYear13Index = chapters.findIndex((c) => c.level === YEAR_13_LEVEL);

  return (
    <Card>
      <div className="reading-header">
        <div>
          <div className="ref">§ {area.ref}</div>
          <h1>{area.specAreaTitle}</h1>
          <p className="blurb">
            {chapters.length} chapter{chapters.length === 1 ? '' : 's'} ·{' '}
            {readingMinutes} min read
          </p>
        </div>
        <div className="reading-header-actions">
          <MarkAsReadToggle topicRef={topic.ref} />
          <Link href={`/topic/${topic.id}`} className="link-btn">
            ← Back to {topic.ref}
          </Link>
        </div>
      </div>

      {hasYear13 && (
        <label className="exam-level-filter">
          <input
            type="checkbox"
            checked={includeYear13}
            onChange={(e) => updateIncludeYear13(e.target.checked)}
          />
          Include A Level (Year 13) chapters
        </label>
      )}

      <nav className="reading-toc" aria-label="Chapters">
        {chapters.map((chapter, i) => (
          <span key={chapter.id}>
            {i === firstYear13Index && (
              <span className="reading-year-divider">A Level (Year 13)</span>
            )}
            <a
              href={`#${chapter.id}`}
              onClick={() => handleJumpClick(chapter.id)}
            >
              {chapterLabel(chapter)}
            </a>
          </span>
        ))}
      </nav>

      {chapters.map((chapter, i) => (
        <details className="reading-chapter" id={chapter.id} key={chapter.id}>
          {i === firstYear13Index && (
            <div className="reading-year-divider standalone">
              A Level (Year 13)
            </div>
          )}
          <summary>
            <span className="mono spec-section-ref">
              {chapterLabel(chapter)}
            </span>{' '}
            <span>{chapter.title}</span>
            <span className="reading-chapter-meta">
              {chapter.level} · pages {chapter.pdfPages}
            </span>
          </summary>
          <div className="reading-chapter-body">
            <ChapterReadTick
              chapterId={chapter.id}
              readAt={chapterReadStates?.[chapter.id]}
              onToggle={setChapterRead}
            />
            <ReadingChapterBody html={chapter.bodyHtml} />

            {chapter.exercisesHtml && (
              <details className="reading-exercises">
                <summary>Exercises (from the book)</summary>
                <ReadingChapterBody html={chapter.exercisesHtml} />
                {hasExamQuestions && (
                  <p className="reading-exam-link">
                    <Link href={`/topic/${topic.id}#exam-questions`}>
                      Practice these as marked exam questions →
                    </Link>
                  </p>
                )}
              </details>
            )}
          </div>
        </details>
      ))}

      {source && <p className="reading-citation">{source}</p>}
    </Card>
  );
}
