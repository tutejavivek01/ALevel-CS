import { TOPICS, type Topic } from './spec/topics';
import { subtopicId } from './spec/subtopics';
import type { SubtopicStatusMap } from './db/use-subtopic-status';

export type TopicProgress = {
  pct: number;
  confident: number;
  started: number;
  total: number;
};

export function topicProgress(
  topic: Topic,
  statuses: SubtopicStatusMap
): TopicProgress {
  const total = topic.items.length;
  let confident = 0;
  let started = 0;

  topic.items.forEach((_, index) => {
    const status = statuses[subtopicId(topic.id, index)] ?? 'not-started';
    if (status === 'confident') confident++;
    if (status !== 'not-started') started++;
  });

  return {
    pct: total ? Math.round((confident / total) * 100) : 0,
    confident,
    started,
    total,
  };
}

export type OverallProgress = {
  pct: number;
  confident: number;
  total: number;
};

export function overallProgress(statuses: SubtopicStatusMap): OverallProgress {
  let total = 0;
  let confident = 0;

  for (const topic of TOPICS) {
    total += topic.items.length;
    confident += topicProgress(topic, statuses).confident;
  }

  return {
    pct: total ? Math.round((confident / total) * 100) : 0,
    confident,
    total,
  };
}
