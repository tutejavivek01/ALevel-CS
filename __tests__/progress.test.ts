import { describe, expect, test } from 'vitest';
import {
  chapterProgress,
  overallProgress,
  topicProgress,
} from '../lib/progress';
import { TOPICS } from '../lib/spec/topics';
import { subtopicId } from '../lib/spec/subtopics';
import type { SubtopicStatusMap } from '../lib/db/use-subtopic-status';

const programming = TOPICS.find((t) => t.id === 'programming')!;

describe('topicProgress', () => {
  test('all not-started (empty map) is 0%', () => {
    const result = topicProgress(programming, {});
    expect(result).toEqual({
      pct: 0,
      confident: 0,
      started: 0,
      total: programming.items.length,
    });
  });

  test('counts confident and started separately', () => {
    const statuses: SubtopicStatusMap = {
      [subtopicId('programming', 0)]: 'confident',
      [subtopicId('programming', 1)]: 'confident',
      [subtopicId('programming', 2)]: 'learning',
    };
    const result = topicProgress(programming, statuses);
    expect(result.confident).toBe(2);
    expect(result.started).toBe(3);
    expect(result.pct).toBe(Math.round((2 / programming.items.length) * 100));
  });

  test('statuses for other topics are ignored', () => {
    const statuses: SubtopicStatusMap = {
      [subtopicId('data-structures', 0)]: 'confident',
    };
    const result = topicProgress(programming, statuses);
    expect(result.confident).toBe(0);
  });
});

describe('overallProgress', () => {
  test('empty map is 0%', () => {
    const result = overallProgress({});
    expect(result.pct).toBe(0);
    expect(result.confident).toBe(0);
    expect(result.total).toBe(
      TOPICS.reduce((sum, t) => sum + t.items.length, 0)
    );
  });

  test('marking every subtopic in every topic confident is 100%', () => {
    const statuses: SubtopicStatusMap = {};
    for (const topic of TOPICS) {
      topic.items.forEach((_, index) => {
        statuses[subtopicId(topic.id, index)] = 'confident';
      });
    }
    const result = overallProgress(statuses);
    expect(result.pct).toBe(100);
    expect(result.confident).toBe(result.total);
  });
});

describe('chapterProgress', () => {
  test('no completions is 0%', () => {
    expect(chapterProgress({})).toEqual({
      pct: 0,
      completed: 0,
      total: TOPICS.length,
    });
  });

  test('counts only known topics that are completed', () => {
    const result = chapterProgress({
      programming: '2026-01-01T00:00:00Z',
      'not-a-topic': '2026-01-01T00:00:00Z',
    });
    expect(result.completed).toBe(1);
    expect(result.pct).toBe(Math.round((1 / TOPICS.length) * 100));
  });

  test('every topic completed is 100%', () => {
    const completion: Record<string, string> = {};
    for (const topic of TOPICS) completion[topic.id] = '2026-01-01T00:00:00Z';
    expect(chapterProgress(completion).pct).toBe(100);
  });
});
