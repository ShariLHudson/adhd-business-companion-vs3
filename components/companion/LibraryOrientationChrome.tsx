"use client";

import { useState, type ReactNode } from "react";
import { initialSectionOpen } from "@/lib/expandableUi";

/** Always-visible exit — users should never wonder how to leave. */
export function LibraryCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-sm font-semibold text-[#6b635a] shadow-sm hover:border-[#1e4f4f]/30 hover:bg-[#faf7f2] hover:text-[#1f1c19]"
      aria-label="Close"
    >
      <span aria-hidden="true">✕</span>
      Close
    </button>
  );
}

export function LibraryPanelHeader({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) {
  return (
    <header className="flex items-start justify-between gap-3 border-b border-[#e7dfd4] pb-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-[#1f1c19]">{title}</h1>
        <p className="mt-1.5 text-base leading-relaxed text-[#6b635a]">
          {description}
        </p>
      </div>
      <LibraryCloseButton onClose={onClose} />
    </header>
  );
}

export function LibraryHelpText({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(initialSectionOpen);

  return (
    <div className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/90">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-[#f5f0e8]/80"
        aria-expanded={open}
      >
        <span className="text-sm text-[#6b635a]" aria-hidden>
          {open ? "▼" : "▶"}
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          How To Use This?
        </span>
      </button>
      {open ? (
        <ul className="list-inside list-disc space-y-1 border-t border-[#e7dfd4]/80 px-4 pb-3 pt-2 text-sm leading-relaxed text-[#4b463f]">
          {children}
        </ul>
      ) : null}
    </div>
  );
}

export function LibraryResultActions({
  onSave,
  onUse,
  onDuplicate,
  onDelete,
  saveLabel = "Save",
  useLabel = "Use",
}: {
  onSave?: () => void;
  onUse?: () => void;
  onDuplicate?: () => void;
  onDelete: () => void;
  saveLabel?: string;
  useLabel?: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {onSave ? (
        <button
          type="button"
          onClick={onSave}
          className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          {saveLabel}
        </button>
      ) : null}
      {onUse ? (
        <button
          type="button"
          onClick={onUse}
          className="rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
        >
          {useLabel}
        </button>
      ) : null}
      {onDuplicate ? (
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
        >
          Duplicate
        </button>
      ) : null}
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/10"
      >
        Delete
      </button>
    </div>
  );
}
