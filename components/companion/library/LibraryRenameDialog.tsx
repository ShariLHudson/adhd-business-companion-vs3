"use client";

import { useEffect, useId, useRef, useState } from "react";

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

  useEffect(() => {
    if (open) {
      setName(initialName);
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, initialName]);

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
      data-testid="library-rename-dialog"
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
