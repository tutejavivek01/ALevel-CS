import { notFound } from 'next/navigation';
import { PythonProblemDetail } from '@/components/PythonProblemDetail';
import { createClient } from '@/lib/db/supabase-server';

export default async function PythonProblemPage(
  props: PageProps<'/python/[problemId]'>
) {
  const { problemId } = await props.params;
  const numericId = Number(problemId);

  if (!Number.isInteger(numericId)) {
    notFound();
  }

  const supabase = await createClient();
  const [{ data: problem }, { data: testCases }] = await Promise.all([
    supabase.from('python_problems').select('*').eq('id', numericId).maybeSingle(),
    supabase
      .from('python_test_cases')
      .select('*')
      .eq('problem_id', numericId)
      .order('position', { ascending: true }),
  ]);

  if (!problem) {
    notFound();
  }

  return (
    <PythonProblemDetail
      problemId={numericId}
      initialProblem={problem}
      initialTestCases={testCases ?? []}
    />
  );
}
