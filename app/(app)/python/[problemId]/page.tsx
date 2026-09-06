import { Card } from '@/components/Card';

export default async function PythonProblemPage(
  props: PageProps<'/python/[problemId]'>
) {
  const { problemId } = await props.params;

  return (
    <Card>
      <h3 className="section-title">Python problem: {problemId}</h3>
      <p>Description, test cases, editor, and attempt history land here in tasks 22–26.</p>
    </Card>
  );
}
