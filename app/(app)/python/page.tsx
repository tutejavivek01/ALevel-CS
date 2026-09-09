import { PythonProblemList } from '@/components/PythonProblemList';
import { OcrChallengeList } from '@/components/OcrChallengeList';

// Two visually distinct groups on the same page (design.md §6.8) - the
// same "two distinct lists, kept visually separate" treatment already
// used for curated vs. personal resource links (§6.2) - not a second
// nav item or route.
export default function PythonPracticeListPage() {
  return (
    <div className="stack">
      <PythonProblemList />
      <OcrChallengeList />
    </div>
  );
}
