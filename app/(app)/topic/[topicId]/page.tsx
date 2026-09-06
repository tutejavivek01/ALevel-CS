import { Card } from '@/components/Card';

export default async function TopicPage(props: PageProps<'/topic/[topicId]'>) {
  const { topicId } = await props.params;

  return (
    <Card>
      <h3 className="section-title">Topic: {topicId}</h3>
      <p>Checklist, curated &amp; personal resources, and supporter flags land here in tasks 7–9, 11.</p>
    </Card>
  );
}
