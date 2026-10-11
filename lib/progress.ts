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

// Chapter-level progress: a chapter (topic) counts once it has been marked
// complete after passing its test (topic_completion). Replaces the
// subtopic-confident measure for the dashboard.
export type ChapterProgress = {
  pct: number;
  completed: number;
  total: number;
};

export function chapterProgress(
  completion: Record<string, string>
): ChapterProgress {
  const total = TOPICS.length;
  const completed = TOPICS.filter((topic) => completion[topic.id]).length;
  return {
    pct: total ? Math.round((completed / total) * 100) : 0,
    completed,
    total,
  };
}
