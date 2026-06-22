"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";

// A light, ADHD-friendly modal sheet that slides in from the right. It never
// feels like leaving the app: the background stays partly visible and dimmed.
// Three always-available exits: click the backdrop, press ESC, or tap ✕.
// State inside is preserved while open (we just unmount on close).
export function ModalSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const [entered, setEntered] = useState(open);

  // Slide-in runs after paint; panel stays interactive immediately on open.
  useLayoutEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    setEntered(true);
  }, [open]);

  // ESC closes.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Absolute (not fixed) so the sheet only covers the main pane — sidebar stays
  // clickable. No pointer-events-none wrapper; panel is interactive as soon as open.
  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex justify-end overflow-hidden">
      {entered ? (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="pointer-events-auto absolute inset-0 bg-black/30 transition-opacity duration-300"
        />
      ) : null}

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`pointer-events-auto relative z-10 flex h-full w-full max-w-md flex-col bg-[#faf7f2] shadow-2xl transition-transform duration-300 ease-out ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <span className="text-sm font-semibold text-[#6b635a]">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#6b635a] hover:bg-[#1e4f4f]/10"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
