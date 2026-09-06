'use client';

import { useState } from 'react';
import {
  useAddResourceLink,
  useDeleteResourceLink,
  useResourceLinks,
} from '@/lib/db/use-resource-links';
import { useCurrentProfile } from '@/lib/db/use-current-profile';

export function PersonalResourceLinks({ topicId }: { topicId: string }) {
  const { profile } = useCurrentProfile();
  const { data: links } = useResourceLinks(topicId);
  const addLink = useAddResourceLink(topicId);
  const deleteLink = useDeleteResourceLink(topicId);
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');

  return (
    <>
      <h3 className="section-title" style={{ marginTop: 20 }}>
        Also saved
      </h3>
      <div className="resources">
        {(links ?? []).map((link) => (
          <span key={link.id} className="res-link">
            <span className="dot" />
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
            {profile?.id === link.created_by && (
              <button
                aria-label={`Remove ${link.label}`}
                onClick={() => deleteLink.mutate({ id: link.id })}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink-dim)',
                  cursor: 'pointer',
                  padding: 0,
                  marginLeft: 4,
                }}
              >
                ✕
              </button>
            )}
          </span>
        ))}
        {(links ?? []).length === 0 && (
          <p className="empty-note">Nothing saved here yet.</p>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (url.trim() && label.trim()) {
            addLink.mutate({ url: url.trim(), label: label.trim() });
            setUrl('');
            setLabel('');
          }
        }}
        style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label"
          style={{
            border: '1px solid var(--border)',
            borderRadius: 7,
            padding: '6px 9px',
            background: 'var(--surface)',
            color: 'var(--ink)',
            fontSize: 12.5,
            width: 160,
          }}
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          type="url"
          style={{
            flex: 1,
            minWidth: 200,
            border: '1px solid var(--border)',
            borderRadius: 7,
            padding: '6px 9px',
            background: 'var(--surface)',
            color: 'var(--ink)',
            fontSize: 12.5,
          }}
        />
        <button type="submit" className="btn2 alt">
          Add link
        </button>
      </form>
      {(addLink.isError || deleteLink.isError) && (
        <p className="ex-feedback no">
          Couldn&apos;t save —{' '}
          <button
            className="btn2 alt"
            onClick={() => (addLink.isError ? addLink.retry() : deleteLink.retry())}
          >
            retry
          </button>
        </p>
      )}
    </>
  );
}
