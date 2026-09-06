import { notFound } from 'next/navigation';
import { Card } from '@/components/Card';
import { PythonProblemForm } from '@/components/PythonProblemForm';
import { getServerProfile } from '@/lib/db/get-server-profile';

export default async function NewPythonProblemPage() {
  // Server-side role check (design.md §5) - not just hiding the nav
  // link. A student navigating here directly gets a 404, same as any
  // other nonexistent route, rather than a page that reveals the
  // feature exists and merely refuses them.
  const profile = await getServerProfile();
  if (profile?.role !== 'supporter') {
    notFound();
  }

  return (
    <Card>
      <h3 className="section-title">New Python problem</h3>
      <PythonProblemForm />
    </Card>
  );
}
