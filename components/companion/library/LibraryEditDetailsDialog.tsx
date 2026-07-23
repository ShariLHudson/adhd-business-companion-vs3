"use client";

import { useEffect, useId, useRef, useState } from "react";

export type LibraryDetailsDraft = {
  title: string;
  purpose?: string;
  audience?: string;
};

type Props = {
  open: boolean;
  heading: string;
  initial: LibraryDetailsDraft;
  showAudience?: boolean;
  busy?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onSave: (draft: LibraryDetailsDraft) => void;
};

export function LibraryEditDetailsDialog({
  open,
  heading,
  initial,
  showAudience = false,
  busy,
  errorMessage,
  onCancel,
  onSave,
}: Props) {
  const [draft, setDraft] = useState(initial);
  const titleRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (open) {
      setDraft(initial);
      window.requestAnimationFrame(() => titleRef.current?.focus());
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="spark-library-dialog-backdrop"
      role="presentation"
      data-testid="library-details-dialog"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="spark-library-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId}>{heading}</h2>
        <label htmlFor="library-details-title">Title</label>
        <input
          ref={titleRef}
          id="library-details-title"
          value={draft.title}
          disabled={busy}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          data-testid="library-details-title"
        />
        <label htmlFor="library-details-purpose">Short description</label>
        <textarea
          id="library-details-purpose"
          value={draft.purpose ?? ""}
          disabled={busy}
          onChange={(e) =>
            setDraft((d) => ({ ...d, purpose: e.target.value }))
          }
          data-testid="library-details-purpose"
        />
        {showAudience ? (
          <>
            <label htmlFor="library-details-audience">Audience</label>
            <input
              id="library-details-audience"
              value={draft.audience ?? ""}
              disabled={busy}
              onChange={(e) =>
                setDraft((d) => ({ ...d, audience: e.target.value }))
              }
              data-testid="library-details-audience"
            />
          </>
        ) : null}
        {errorMessage ? (
          <p role="alert" data-testid="library-details-error">
            {errorMessage}
          </p>
        ) : null}
        <div className="spark-library-dialog__actions">
          <button
            type="button"
            data-variant="primary"
            disabled={busy || !draft.title.trim()}
            data-testid="library-details-save"
            onClick={() => onSave(draft)}
          >
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            data-variant="ghost"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
