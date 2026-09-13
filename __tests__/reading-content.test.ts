import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { TOPICS } from '../lib/spec/topics';
import {
  READING_CONTENT,
  getReadingContentForTopic,
  getReadingTimeMinutes,
} from '../lib/spec/reading-content';

// specs/reading-material/design.md §1, requirements.md §1 - the generated
// artifact (lib/generated/reading-content.json) is produced offline by
// scripts/ingest-reading-material.mjs; these tests guard against a future
// re-ingestion silently dropping content or reintroducing an un-rewritten
// image path, without needing to re-run the ingestion script itself.

const manifest = JSON.parse(
  readFileSync(
    path.join(__dirname, '..', 'reference', 'book_md', 'manifest.json'),
    'utf8'
  )
) as {
  spec_area: string;
  words: number;
  figures: number;
  chapter: number | string;
  level: string;
}[];

describe('reading content (READING_CONTENT)', () => {
  test('every topic has at least one chapter', () => {
    for (const topic of TOPICS) {
      const area = getReadingContentForTopic(topic);
      expect(area, topic.ref).toBeDefined();
      expect(area!.chapters.length, topic.ref).toBeGreaterThan(0);
    }
  });

  test('total word count matches the source manifest exactly', () => {
    const totalWords = READING_CONTENT.flatMap((a) => a.chapters).reduce(
      (sum, c) => sum + c.words,
      0
    );
    const manifestWords = manifest.reduce((sum, r) => sum + r.words, 0);
    expect(totalWords).toBe(manifestWords);
  });

  test('total chapter count matches the manifest (74)', () => {
    const total = READING_CONTENT.reduce(
      (sum, a) => sum + a.chapters.length,
      0
    );
    expect(total).toBe(manifest.length);
    expect(total).toBe(74);
  });

  test("programming (4.1)'s chapters are ordered year-then-number: 1-6, 8, then 67-68", () => {
    const area = getReadingContentForTopic({ ref: '4.1' });
    expect(area?.chapters.map((c) => c.chapter)).toEqual([
      1, 2, 3, 4, 5, 6, 8, 67, 68,
    ]);
  });

  test('appendices are ordered last within their topic, regardless of their own level', () => {
    const dataRepresentation = getReadingContentForTopic({ ref: '4.5' });
    const chapters = dataRepresentation!.chapters;
    const appendixIndex = chapters.findIndex(
      (c) => typeof c.chapter === 'string'
    );
    expect(appendixIndex).toBeGreaterThan(-1);
    expect(appendixIndex).toBe(chapters.length - 1);
  });

  test('no generated HTML contains an un-rewritten figures/ relative path', () => {
    for (const area of READING_CONTENT) {
      for (const chapter of area.chapters) {
        expect(chapter.bodyHtml, chapter.id).not.toMatch(/src="figures\//);
        expect(chapter.exercisesHtml, chapter.id).not.toMatch(/src="figures\//);
      }
    }
  });

  test('every image is rewritten to the auth-gated figures route (422 total)', () => {
    const count = READING_CONTENT.flatMap((a) => a.chapters).reduce(
      (sum, c) =>
        sum +
        (c.bodyHtml.match(/\/api\/reading-material\/figures\//g)?.length ?? 0) +
        (c.exercisesHtml.match(/\/api\/reading-material\/figures\//g)?.length ??
          0),
      0
    );
    expect(count).toBe(422);
  });

  test('every chapter id is unique', () => {
    const ids = READING_CONTENT.flatMap((a) => a.chapters).map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getReadingTimeMinutes', () => {
  test('sums words at 200 words/minute, rounded, minimum 1', () => {
    const fixture = {
      ref: '4.x',
      specAreaTitle: 'Fixture',
      chapters: [
        {
          id: 'a',
          chapter: 1,
          title: 'A',
          sectionTitle: 'S',
          level: 'AS / A Level (Year 12)' as const,
          pdfPages: '1',
          words: 400,
          source: '',
          bodyHtml: '',
          exercisesHtml: '',
        },
        {
          id: 'b',
          chapter: 2,
          title: 'B',
          sectionTitle: 'S',
          level: 'A Level (Year 13)' as const,
          pdfPages: '2',
          words: 600,
          source: '',
          bodyHtml: '',
          exercisesHtml: '',
        },
      ],
    };
    expect(getReadingTimeMinutes(fixture, true)).toBe(5); // 1000/200
    expect(getReadingTimeMinutes(fixture, false)).toBe(2); // 400/200
  });

  test('never returns 0, even for a tiny area', () => {
    const fixture = {
      ref: '4.x',
      specAreaTitle: 'Fixture',
      chapters: [
        {
          id: 'a',
          chapter: 1,
          title: 'A',
          sectionTitle: 'S',
          level: 'AS / A Level (Year 12)' as const,
          pdfPages: '1',
          words: 10,
          source: '',
          bodyHtml: '',
          exercisesHtml: '',
        },
      ],
    };
    expect(getReadingTimeMinutes(fixture, true)).toBe(1);
  });
});
