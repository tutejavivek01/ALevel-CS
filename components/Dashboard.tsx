'use client';

import Link from 'next/link';
import { Card } from './Card';
import { ProgressRing } from './ProgressRing';
import { ActivityFeed } from './ActivityFeed';
import { DeadlineBanner } from './DeadlineBanner';
import { useAllSubtopicStatuses } from '@/lib/db/use-all-subtopic-statuses';
import { useAllTopicCompletion } from '@/lib/db/use-topic-completion';
import { useAllTopicReadState } from '@/lib/db/use-reading-state';
import { chapterProgress, topicProgress } from '@/lib/progress';
import { TOPICS } from '@/lib/spec';

const FOCUS_TOPIC = TOPICS.find((t) => t.hasExercises)!;

export function Dashboard() {
  const { data: statuses, isLoading } = useAllSubtopicStatuses();
  const { data: completion, isLoading: completionLoading } =
    useAllTopicCompletion();
  const { data: readState } = useAllTopicReadState();
  const safeStatuses = statuses ?? {};
  const safeCompletion = completion ?? {};
  const overall = chapterProgress(safeCompletion);
  const focusProgress = topicProgress(FOCUS_TOPIC, safeStatuses);

  return (
    <div className="stack">
      <div className="focus-banner">
        <div>
          <div className="eyebrow">
            Currently studying &middot; {FOCUS_TOPIC.unit}
          </div>
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
          <div className="n">{completionLoading ? '…' : `${overall.pct}%`}</div>
          <div className="l">Chapters completed</div>
        </div>
        <div className="kpi">
          <div className="n">
            {completionLoading ? '…' : `${overall.completed}/${overall.total}`}
          </div>
          <div className="l">Chapters marked complete</div>
        </div>
        <div className="kpi">
          <div className="n">{TOPICS.length}</div>
          <div className="l">Specification areas (4.1–4.13)</div>
        </div>
      </div>

      <DeadlineBanner />

      <Card>
        <h3 className="section-title">Specification map</h3>
        <div className="topic-grid">
          {TOPICS.map((topic) => {
            const done = Boolean(safeCompletion[topic.id]);
            const pct = done ? 100 : 0;
            return (
              <Link
                key={topic.id}
                href={`/topic/${topic.id}`}
                className="topic-tile"
              >
                <div className="row1">
                  <span className="ref">
                    {topic.ref}
                    {readState?.[topic.ref] && (
                      <span
                        className="reading-read-dot"
                        title="Reading material marked as read"
                      >
                        ●
                      </span>
                    )}
                  </span>
                  <ProgressRing
                    percent={completionLoading ? 0 : pct}
                    size={26}
                    stroke={4}
                  />
                </div>
                <div className="title">{topic.title}</div>
                {topic.unit && <div className="unit">{topic.unit}</div>}
                <div className="bar">
                  <i style={{ width: `${completionLoading ? 0 : pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      <ActivityFeed />

      {/* design.md §6.6: insurance, not a feature surface - one link,
          nothing more. */}
      <p style={{ textAlign: 'center' }}>
        <a href="/export" className="btn2 alt">
          Download my data
        </a>
      </p>
    </div>
  );
}
