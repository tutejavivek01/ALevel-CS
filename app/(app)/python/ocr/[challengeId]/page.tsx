import { notFound } from 'next/navigation';
import { OcrChallengeDetail } from '@/components/OcrChallengeDetail';
import { OCR_CHALLENGES } from '@/lib/exercises/ocr-challenges';

export default async function OcrChallengePage(
  props: PageProps<'/python/ocr/[challengeId]'>
) {
  const { challengeId } = await props.params;

  // No database lookup needed - the challenge itself is fixed,
  // code-defined content (design.md §6.8), unlike /python/[problemId]'s
  // database row.
  const challenge = OCR_CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) {
    notFound();
  }

  return <OcrChallengeDetail challenge={challenge} />;
}
