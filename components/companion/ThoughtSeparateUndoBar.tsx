"use client";

import type { ThoughtSeparateUndo } from "@/lib/thinkingSpace/thoughtSeparate";
import { THOUGHT_SEPARATE_UNDO } from "@/lib/thinkingSpace/copy";

type Props = {
  undo: ThoughtSeparateUndo;
  onUndo: () => void;
  onDismiss: () => void;
};

/** Quiet acknowledgment + undo after companion-guided separation. */
export function ThoughtSeparateUndoBar({ undo, onUndo, onDismiss }: Props) {
  return (
    <div
      className="companion-fade-in flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c5ddd8] bg-[#f0f8f8] px-4 py-3"
      data-testid="thought-separate-undo-bar"
      role="status"
    >
      <p className="text-sm leading-relaxed text-[#5a5248]">
        {undo.acknowledgment}
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onUndo}
          className="rounded-lg border border-[#c5ddd8] bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#e6f4f4]"
        >
          {THOUGHT_SEPARATE_UNDO}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg px-2 py-1.5 text-sm text-[#9a8f82] hover:text-[#6b635a]"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
