'use client';

import { useState } from 'react';
import { Modal } from './Modal';

// Renders one chapter's pre-built HTML (specs/reading-material/design.md
// §3) via dangerouslySetInnerHTML - safe here since the content comes
// from this app's own ingestion of trusted source material
// (scripts/ingest-reading-material.mjs), never from user input. A single
// delegated click listener on the wrapper catches clicks on any
// `.reading-figure img` and opens that image enlarged inside the
// existing Modal, reusing it rather than building a new lightbox.
export function ReadingChapterBody({ html }: { html: string }) {
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(
    null
  );
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'IMG') return;
    const img = target as HTMLImageElement;
    setEnlarged({ src: img.src, alt: img.alt });
  }

  return (
    <>
      <div
        className="reading-body"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <Modal
        open={enlarged !== null}
        onClose={() => setEnlarged(null)}
        title={enlarged?.alt || 'Figure'}
      >
        {enlarged && (
          // An arbitrary already-rewritten server URL, not a static asset
          // next/image can usefully optimise here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={enlarged.src}
            alt={enlarged.alt}
            className="reading-figure-enlarged"
          />
        )}
      </Modal>
    </>
  );
}
