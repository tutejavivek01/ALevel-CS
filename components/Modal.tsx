'use client';

import { useEffect, useRef } from 'react';

// The app's first modal/dialog component (design.md §6.13 - there was no
// precedent anywhere before the mastery gate's "Test knowledge"/"History"
// entry points needed one). Built on the native <dialog> element rather
// than a portal + manual backdrop: showModal()/close() give a real
// top-layer render, a free focus trap, and Escape-to-close, with no
// library dependency. The panel reuses Card's visual language (border/
// radius/shadow tokens) via its own CSS rather than inventing a third
// look - see the .modal-panel rules in app/globals.css.
type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal-panel"
      // The native 'close' event fires for Escape and any close() call -
      // this is the one place onClose needs wiring, not onClick handlers
      // scattered across every trigger.
      onClose={onClose}
      onClick={(e) => {
        // A click on the <dialog> backdrop lands directly on the dialog
        // element itself (not a descendant) - close on that, but not on
        // clicks inside the panel content.
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          type="button"
          className="modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
