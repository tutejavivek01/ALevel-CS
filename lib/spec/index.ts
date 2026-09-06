export { TOPICS, type Topic } from './topics';
export { RES, aqa, type Resource } from './resources';
export {
  subtopicId,
  isKnownSubtopicId,
  ALL_SUBTOPIC_IDS,
} from './subtopics';

import { TOPICS, type Topic } from './topics';

export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find((topic) => topic.id === id);
}
