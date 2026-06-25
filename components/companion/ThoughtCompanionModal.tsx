"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClose: () => void;
};

/** Centered Companion Box™ — no scrolling to find the editor. */
export function ThoughtCompanionModal({ children, onClose }: Props) {
  return (
    <div
      className="thought-companion-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
      data-testid="thought-companion-modal-overlay"
    >
      <div
        className="thought-companion-modal-inner w-full max-w-lg"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
