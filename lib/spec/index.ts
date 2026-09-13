export { TOPICS, type Topic } from './topics';
export { RES, aqa, type Resource } from './resources';
export {
  subtopicId,
  isKnownSubtopicId,
  getSubtopicLabel,
  ALL_SUBTOPIC_IDS,
} from './subtopics';
export {
  NEA_SECTIONS,
  NEA_TOTAL_MARKS,
  getNeaSectionById,
  type NeaSection,
} from './nea';
export {
  SPEC_CONTENT,
  getSpecContentForTopic,
  type SpecPoint,
  type SpecSection,
  type TopicSpecContent,
} from './spec-content';
export {
  WATCH_RESOURCES,
  getWatchResourcesForTopic,
  type WatchResource,
  type TopicWatchResources,
} from './watch-resources';
export {
  READING_CONTENT,
  getReadingContentForTopic,
  getReadingTimeMinutes,
  type ReadingChapter,
  type ReadingArea,
} from './reading-content';

import { TOPICS, type Topic } from './topics';

export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find((topic) => topic.id === id);
}
