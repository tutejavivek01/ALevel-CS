import type { TopicWatchResources as TopicWatchResourcesData } from '@/lib/spec';

// Per-topic "watch & revise" starting points (design.md §6.12,
// requirements.md §11.2). Server component. Deliberately kept as a
// section distinct from the curated "Resources" list and "Also saved" -
// the three may name the same sources but aren't merged. Every link goes
// to a source's front door, never a specific video (see
// lib/spec/watch-resources.ts).
const GROUPS = [
  { kind: 'watch' as const, label: 'Watch' },
  { kind: 'revise' as const, label: 'Revise & practise' },
];

export function TopicWatchResources({
  resources,
}: {
  resources: TopicWatchResourcesData;
}) {
  return (
    <section className="watch-revise">
      <h3 className="section-title" style={{ marginTop: 20 }}>
        Watch &amp; revise
      </h3>
      <p className="empty-note">
        Starting points — search within each for the exact 4.x lesson. These
        aren&rsquo;t deep links to one video.
      </p>

      {GROUPS.map(({ kind, label }) => {
        const group = resources.resources.filter((r) => r.kind === kind);
        if (group.length === 0) return null;
        return (
          <div className="watch-group" key={kind}>
            <h4>{label}</h4>
            <div className="resources">
              {group.map((resource) => (
                <a
                  key={resource.url + resource.name}
                  className="res-link"
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="dot" />
                  {resource.name}
                  {resource.hint && (
                    <span className="watch-hint"> · {resource.hint}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
