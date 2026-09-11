import { notFound } from 'next/navigation';
import { Card } from '@/components/Card';
import { TopicChecklist } from '@/components/TopicChecklist';
import { TopicSpecDetail } from '@/components/TopicSpecDetail';
import { TopicWatchResources } from '@/components/TopicWatchResources';
import { PersonalResourceLinks } from '@/components/PersonalResourceLinks';
import {
  getTopicById,
  getSpecContentForTopic,
  getWatchResourcesForTopic,
} from '@/lib/spec';

export default async function TopicPage(props: PageProps<'/topic/[topicId]'>) {
  const { topicId } = await props.params;
  const topic = getTopicById(topicId);

  if (!topic) {
    notFound();
  }

  const specContent = getSpecContentForTopic(topic);
  const watchResources = getWatchResourcesForTopic(topic);

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

      {specContent && <TopicSpecDetail content={specContent} />}
      {watchResources && <TopicWatchResources resources={watchResources} />}

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

      <PersonalResourceLinks topicId={topic.id} />
    </Card>
  );
}
