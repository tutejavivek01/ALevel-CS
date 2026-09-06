import { notFound } from 'next/navigation';
import { Card } from '@/components/Card';
import { TopicChecklist } from '@/components/TopicChecklist';
import { getTopicById } from '@/lib/spec';

export default async function TopicPage(props: PageProps<'/topic/[topicId]'>) {
  const { topicId } = await props.params;
  const topic = getTopicById(topicId);

  if (!topic) {
    notFound();
  }

  return (
    <Card>
      <div className="topic-head">
        <div>
          <div className="ref">§ {topic.ref}</div>
          <h2>{topic.title}</h2>
          {topic.unit && <span className="unit-badge">{topic.unit}</span>}
          <p className="blurb">{topic.blurb}</p>
        </div>
      </div>

      <TopicChecklist topicId={topic.id} items={topic.items} />

      <h3 className="section-title" style={{ marginTop: 20 }}>
        Resources
      </h3>
      <div className="resources">
        {topic.resources.map((resource) => (
          <a
            key={resource.url}
            className="res-link"
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="dot" />
            {resource.name}
          </a>
        ))}
      </div>
    </Card>
  );
}
