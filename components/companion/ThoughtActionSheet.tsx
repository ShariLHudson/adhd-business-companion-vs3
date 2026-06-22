"use client";

import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  THOUGHT_ACTION_LABEL,
  THOUGHT_ACTION_ORDER,
  type ThoughtAction,
} from "@/lib/thoughtActions";

const actionButtonClass =
  "rounded-lg border border-[#1e4f4f]/30 bg-[#1e4f4f]/5 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35";

const deleteButtonClass =
  "rounded-lg border border-[#a85c4a]/30 bg-white px-3 py-1.5 text-sm font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a85c4a]/25";

export function ThoughtActionSheet({
  entry,
  onAction,
}: {
  entry: BrainDumpEntry;
  onAction: (action: ThoughtAction) => void;
}) {
  return (
    <div
      className="companion-fade-in mt-2 rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/90 p-3"
      data-testid="thought-action-sheet"
      role="region"
      aria-label={`Actions for ${entry.text}`}
    >
      <p className="text-sm font-medium leading-relaxed text-[#1f1c19]">
        {entry.text}
      </p>
      <p className="mt-2 text-xs font-medium text-[#6b635a]">
        What would you like to do with this?
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {THOUGHT_ACTION_ORDER.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => onAction(action)}
            className={action === "delete" ? deleteButtonClass : actionButtonClass}
            data-testid={`thought-action-${action}`}
          >
            {THOUGHT_ACTION_LABEL[action]}
          </button>
        ))}
      </div>
    </div>
  );
}
