import { notFound } from 'next/navigation';
import { getTopicById, getReadingContentForTopic } from '@/lib/spec';
import { getExamChaptersForTopic } from '@/lib/exercises/exam-question-bank';
import { ReadingPageBody } from '@/components/ReadingPageBody';

// specs/reading-material/design.md §3, requirements.md §3/§5 - noindex:
// this is copyrighted book content reproduced for one student's private
// study, same constraint the exam question bank already applies.
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function ReadingMaterialPage(
  props: PageProps<'/topic/[topicId]/reading'>
) {
  const { topicId } = await props.params;
  const topic = getTopicById(topicId);
  if (!topic) notFound();

  const area = getReadingContentForTopic(topic);
  if (!area) notFound();

  const hasExamQuestions = getExamChaptersForTopic(topic.ref).length > 0;

  return (
    <ReadingPageBody
      topic={topic}
      area={area}
      hasExamQuestions={hasExamQuestions}
    />
  );
}
