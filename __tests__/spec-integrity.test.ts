import { describe, expect, test } from 'vitest';
import { TOPICS } from '../lib/spec/topics';
import {
  ALL_SUBTOPIC_IDS,
  isKnownSubtopicId,
  subtopicId,
} from '../lib/spec/subtopics';

// design.md §8: a standalone check that every subtopic id resolves to a
// real /lib/spec entry - the database can't enforce this (subtopic_id is
// a plain text key, not a foreign key, per design.md §2.2), so this test
// is what would actually catch a typo'd topic/subtopic reference.
describe('spec content integrity', () => {
  test('covers all 13 AQA 7517 topics (4.1-4.13), in order', () => {
    expect(TOPICS).toHaveLength(13);
    const refs = TOPICS.map((t) => t.ref);
    expect(refs).toEqual(
      Array.from({ length: 13 }, (_, i) => `4.${i + 1}`)
    );
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
