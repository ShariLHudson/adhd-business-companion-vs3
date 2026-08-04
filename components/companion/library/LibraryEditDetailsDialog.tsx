"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useDismissibleWindow } from "@/lib/windowDismiss/useDismissibleWindow";
import { useOverlayExclusivity } from "@/lib/windowDismiss/useOverlayExclusivity";

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
  const instanceId = useId();
  const overlayId = `library-edit-details:${instanceId}`;

  // Whoever had focus right before this dialog opened — usually the
  // "Edit details" menu item, which unmounts with its popover before this
  // dialog ever renders, so there is no live trigger element to hold a ref to.
  const openerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open) {
      openerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setDraft(initial);
      window.requestAnimationFrame(() => titleRef.current?.focus());
    }
  }, [open, initial]);

  // Escape, outside-click, and dismissal policy are shared behavior. Busy
  // (a save in flight) blocks dismissal — the Save/Cancel buttons are
  // already disabled while busy; Escape/backdrop now match that instead of
  // bypassing it.
  const { onBackdropClick } = useDismissibleWindow({
    open,
    onClose: onCancel,
    isDirty: Boolean(busy),
    confirmDiscard: () => !busy,
    overlayId,
    overlayKind: "dialog",
    // The title input auto-focuses on open, so it is focused for most of
    // this dialog's open lifetime — Escape must still cancel from there,
    // matching the pre-existing unconditional behavior.
    escapeAppliesInFocusedField: true,
  });

  // Claim exclusive focus on open (asks any open popover/modal to close
  // through policy) and return focus to the opener on close.
  useOverlayExclusivity({ overlayId, open, triggerRef: openerRef });

  if (!open) return null;

  return (
    <div
      className="spark-library-dialog-backdrop"
      role="presentation"
      data-testid="library-details-dialog"
      onClick={onBackdropClick}
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
