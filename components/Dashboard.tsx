'use client';

import Link from 'next/link';
import { Card } from './Card';
import { ProgressRing } from './ProgressRing';
import { ActivityFeed } from './ActivityFeed';
import { NeaDeadlineBanner } from './NeaDeadlineBanner';
import { useAllSubtopicStatuses } from '@/lib/db/use-all-subtopic-statuses';
import { overallProgress, topicProgress } from '@/lib/progress';
import { TOPICS } from '@/lib/spec';

const FOCUS_TOPIC = TOPICS.find((t) => t.hasExercises)!;

export function Dashboard() {
  const { data: statuses, isLoading } = useAllSubtopicStatuses();
  const safeStatuses = statuses ?? {};
  const overall = overallProgress(safeStatuses);
  const focusProgress = topicProgress(FOCUS_TOPIC, safeStatuses);

  return (
    <div className="stack">
      <div className="focus-banner">
        <div>
          <div className="eyebrow">Currently studying &middot; {FOCUS_TOPIC.unit}</div>
          <h2>{FOCUS_TOPIC.title}</h2>
          <p>
            {isLoading
              ? 'Loading…'
              : `${focusProgress.confident}/${focusProgress.total} sub-topics confident.`}
          </p>
        </div>
        <Link className="btn" href={`/topic/${FOCUS_TOPIC.id}`}>
          Open {FOCUS_TOPIC.ref} →
        </Link>
      </div>

      <div className="kpis">
        <div className="kpi accent">
          <div className="n">{isLoading ? '…' : `${overall.pct}%`}</div>
          <div className="l">Overall syllabus confidence</div>
        </div>
        <div className="kpi">
          <div className="n">{isLoading ? '…' : `${overall.confident}/${overall.total}`}</div>
          <div className="l">Sub-topics marked confident</div>
        </div>
        <div className="kpi">
          <div className="n">{TOPICS.length}</div>
          <div className="l">Specification areas (4.1–4.13)</div>
        </div>
      </div>

      <NeaDeadlineBanner />

      <Card>
        <h3 className="section-title">Specification map</h3>
        <div className="topic-grid">
          {TOPICS.map((topic) => {
            const progress = topicProgress(topic, safeStatuses);
            return (
              <Link key={topic.id} href={`/topic/${topic.id}`} className="topic-tile">
                <div className="row1">
                  <span className="ref">{topic.ref}</span>
                  <ProgressRing percent={isLoading ? 0 : progress.pct} size={26} stroke={4} />
                </div>
                <div className="title">{topic.title}</div>
                {topic.unit && <div className="unit">{topic.unit}</div>}
                <div className="bar">
                  <i style={{ width: `${isLoading ? 0 : progress.pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      <ActivityFeed />
    </div>
  );
}
