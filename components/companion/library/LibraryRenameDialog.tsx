"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useDismissibleWindow } from "@/lib/windowDismiss/useDismissibleWindow";
import { useOverlayExclusivity } from "@/lib/windowDismiss/useOverlayExclusivity";

type Props = {
  open: boolean;
  title: string;
  initialName: string;
  busy?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onSave: (name: string) => void;
};

export function LibraryRenameDialog({
  open,
  title,
  initialName,
  busy,
  errorMessage,
  onCancel,
  onSave,
}: Props) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const instanceId = useId();
  const overlayId = `library-rename:${instanceId}`;

  // Whoever had focus right before this dialog opened — usually the
  // "Rename" menu item, which unmounts with its popover before this dialog
  // ever renders, so there is no live trigger element to hold a ref to.
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
      setName(initialName);
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, initialName]);

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
    // The name input auto-focuses on open, so it is focused for most of this
    // dialog's open lifetime — Escape must still cancel from there, matching
    // the pre-existing unconditional behavior.
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
      data-testid="library-rename-dialog"
      onClick={onBackdropClick}
    >
      <div
        className="spark-library-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId}>{title}</h2>
        <label htmlFor="library-rename-input">Name</label>
        <input
          ref={inputRef}
          id="library-rename-input"
          value={name}
          disabled={busy}
          onChange={(e) => setName(e.target.value)}
          data-testid="library-rename-input"
        />
        {errorMessage ? (
          <p role="alert" data-testid="library-rename-error">
            {errorMessage}
          </p>
        ) : null}
        <div className="spark-library-dialog__actions">
          <button
            type="button"
            data-variant="primary"
            disabled={busy || !name.trim()}
            data-testid="library-rename-save"
            onClick={() => onSave(name.trim())}
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
