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

import { TOPICS, type Topic } from './topics';

export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find((topic) => topic.id === id);
}
