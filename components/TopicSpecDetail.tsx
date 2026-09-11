import type { TopicSpecContent } from '@/lib/spec';

// The full AQA spec content for one topic (design.md §6.12,
// requirements.md §11.1). Server component - pure render of code-defined
// content, like the curated Resources block on the topic page. Each
// sub-section is a native <details> collapsed by default so a long spec
// area doesn't bury the checklist. No <h2> here (the page's only <h2> is
// the topic title - tests/e2e/topics.spec.ts relies on that); <summary>
// contents are plain spans, not headings.
export function TopicSpecDetail({ content }: { content: TopicSpecContent }) {
  return (
    <section className="spec-detail">
      <h3 className="section-title" style={{ marginTop: 20 }}>
        Specification detail
      </h3>
      {content.note && <p className="spec-detail-note">{content.note}</p>}

      {content.sections.map((section) => (
        <details className="spec-section" key={section.ref}>
          <summary>
            <span className="mono spec-section-ref">{section.ref}</span>{' '}
            <span>{section.title}</span>
          </summary>
          <div className="spec-section-body">
            {section.detail?.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            {section.points && section.points.length > 0 && (
              <ul className="spec-points">
                {section.points.map((point) => (
                  <li key={point.ref ?? point.text}>
                    {point.ref && <span className="mono">{point.ref}</span>}{' '}
                    {point.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      ))}
    </section>
  );
}
