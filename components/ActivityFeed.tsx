'use client';

import { Card } from './Card';
import { useActivityFeed } from '@/lib/db/use-activity-feed';

export function ActivityFeed() {
  const { data: events, isLoading } = useActivityFeed();

  return (
    <Card>
      <h3 className="section-title">Recent activity</h3>
      {isLoading && <p className="empty-note">Loading…</p>}
      {!isLoading && (events?.length ?? 0) === 0 && (
        <p className="empty-note">Nothing yet.</p>
      )}
      {!isLoading && events && events.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.map((event) => (
            <p key={event.id} style={{ fontSize: 12.5, margin: 0 }}>
              <strong>{event.actorName}</strong>{' '}
              <span style={{ color: 'var(--ink-dim)' }}>{event.summary}</span>{' '}
              <span className="mono" style={{ color: 'var(--muted)', fontSize: 11 }}>
                {new Date(event.created_at).toLocaleString()}
              </span>
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
