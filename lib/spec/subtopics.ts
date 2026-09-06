import { TOPICS } from './topics';

// Matches the prototype's subId(topicId, idx) scheme exactly
// (conventions.md: migrate ids directly, don't invent a second scheme).
export function subtopicId(topicId: string, index: number): string {
  return `${topicId}__${index}`;
}

// The full set of valid subtopic ids, derived from /lib/spec itself so it
// can never drift from the topic data. This is the reference other code
// (later, /lib/exercises; for now, this module's own tests) checks
// against - see design.md §8's referential-integrity requirement.
export const ALL_SUBTOPIC_IDS: readonly string[] = TOPICS.flatMap((topic) =>
  topic.items.map((_item, index) => subtopicId(topic.id, index))
);

const KNOWN_SUBTOPIC_IDS = new Set(ALL_SUBTOPIC_IDS);

export function isKnownSubtopicId(id: string): boolean {
  return KNOWN_SUBTOPIC_IDS.has(id);
}
