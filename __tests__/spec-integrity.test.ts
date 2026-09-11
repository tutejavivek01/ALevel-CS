import { describe, expect, test } from 'vitest';
import { TOPICS } from '../lib/spec/topics';
import {
  ALL_SUBTOPIC_IDS,
  isKnownSubtopicId,
  subtopicId,
} from '../lib/spec/subtopics';
import { SPEC_CONTENT, getSpecContentForTopic } from '../lib/spec/spec-content';
import {
  WATCH_RESOURCES,
  getWatchResourcesForTopic,
} from '../lib/spec/watch-resources';

// design.md §8: a standalone check that every subtopic id resolves to a
// real /lib/spec entry - the database can't enforce this (subtopic_id is
// a plain text key, not a foreign key, per design.md §2.2), so this test
// is what would actually catch a typo'd topic/subtopic reference.
describe('spec content integrity', () => {
  test('covers all 13 AQA 7517 topics (4.1-4.13), in order', () => {
    expect(TOPICS).toHaveLength(13);
    const refs = TOPICS.map((t) => t.ref);
    expect(refs).toEqual(Array.from({ length: 13 }, (_, i) => `4.${i + 1}`));
  });

  test('every topic id is unique', () => {
    const ids = TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every topic has at least one checklist item', () => {
    for (const topic of TOPICS) {
      expect(topic.items.length).toBeGreaterThan(0);
    }
  });

  test('every derived subtopic id is unique across the whole dataset', () => {
    expect(new Set(ALL_SUBTOPIC_IDS).size).toBe(ALL_SUBTOPIC_IDS.length);
  });

  test('isKnownSubtopicId accepts every real id and rejects made-up ones', () => {
    for (const id of ALL_SUBTOPIC_IDS) {
      expect(isKnownSubtopicId(id)).toBe(true);
    }

    // These would only pass if a topic id got typo'd to match by
    // accident - the whole point of this check.
    expect(isKnownSubtopicId('not-a-real-topic__0')).toBe(false);
    expect(isKnownSubtopicId(subtopicId('programming', 9999))).toBe(false);
    expect(isKnownSubtopicId(subtopicId('programing', 0))).toBe(false);
  });
});

// design.md §6.12 / requirements.md §11.1: the full AQA spec detail shown
// on each topic page. Structural + anti-thinning checks - a transcription
// error is caught by the manual spot-check in task 46, not here.
describe('spec detail content (SPEC_CONTENT)', () => {
  test('covers all 13 topics 4.1-4.13, in the same order as TOPICS', () => {
    expect(SPEC_CONTENT.map((c) => c.ref)).toEqual(TOPICS.map((t) => t.ref));
  });

  test('every topic resolves and has at least one section', () => {
    for (const topic of TOPICS) {
      const content = getSpecContentForTopic(topic);
      expect(content, topic.ref).toBeDefined();
      expect(content!.sections.length, topic.ref).toBeGreaterThan(0);
    }
  });

  test('every section ref is prefixed by its owning topic ref', () => {
    for (const content of SPEC_CONTENT) {
      for (const section of content.sections) {
        expect(section.ref.startsWith(`${content.ref}.`), section.ref).toBe(
          true
        );
      }
    }
  });

  test('every section has a title and real content (detail or points)', () => {
    for (const content of SPEC_CONTENT) {
      for (const section of content.sections) {
        expect(section.title.trim().length, section.ref).toBeGreaterThan(0);
        const hasDetail = (section.detail ?? '').trim().length > 0;
        const hasPoints = (section.points ?? []).length > 0;
        expect(hasDetail || hasPoints, section.ref).toBe(true);
        for (const point of section.points ?? []) {
          expect(point.text.trim().length, section.ref).toBeGreaterThan(0);
        }
      }
    }
  });

  test('each topic carries substantial content, not just labels', () => {
    for (const content of SPEC_CONTENT) {
      const chars = content.sections.reduce(
        (sum, s) =>
          sum +
          (s.detail?.length ?? 0) +
          (s.points ?? []).reduce((n, p) => n + p.text.length, 0),
        0
      );
      // Every real AQA section runs to hundreds of words; this floor only
      // trips if a section was gutted back to a one-line checklist label.
      expect(chars, content.ref).toBeGreaterThan(400);
    }
  });
});

// design.md §6.12 / requirements.md §11.2: the per-topic "watch & revise"
// starting points. The load-bearing check is the last one - no fabricated
// specific-video URLs.
describe('watch & revise resources (WATCH_RESOURCES)', () => {
  test('covers all 13 topics 4.1-4.13, in the same order as TOPICS', () => {
    expect(WATCH_RESOURCES.map((c) => c.ref)).toEqual(TOPICS.map((t) => t.ref));
  });

  test('every topic resolves and has at least one resource', () => {
    for (const topic of TOPICS) {
      const entry = getWatchResourcesForTopic(topic);
      expect(entry, topic.ref).toBeDefined();
      expect(entry!.resources.length, topic.ref).toBeGreaterThan(0);
    }
  });

  test('every resource has a name, an https url, and a valid kind', () => {
    for (const entry of WATCH_RESOURCES) {
      for (const resource of entry.resources) {
        expect(resource.name.trim().length, entry.ref).toBeGreaterThan(0);
        expect(resource.url.startsWith('https://'), resource.url).toBe(true);
        expect(['watch', 'revise'], entry.ref).toContain(resource.kind);
      }
    }
  });

  test('no resource url is a fabricated specific-video link', () => {
    const videoUrl = /watch\?v=|youtu\.be\/|\/shorts\/|\/embed\//;
    for (const entry of WATCH_RESOURCES) {
      for (const resource of entry.resources) {
        expect(videoUrl.test(resource.url), resource.url).toBe(false);
      }
    }
  });
});
