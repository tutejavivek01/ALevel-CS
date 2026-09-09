import { OcrChallengeList } from '@/components/OcrChallengeList';

// The supporter-authored ("custom") problem list that used to render
// here alongside the OCR set is retired (design.md §6.9,
// requirements.md §8.11) - the underlying python_* schema and data are
// untouched, only this page's UI no longer shows them.
export default function PythonPracticeListPage() {
  return (
    <div className="stack">
      <OcrChallengeList />
    </div>
  );
}
