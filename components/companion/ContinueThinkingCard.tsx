"use client";

import type { VisualFocusMap } from "@/lib/visualFocus";
import { getStudioCardByMode } from "@/lib/visualFocus/studioCards";

export function ContinueThinkingCard({
  map,
  onOpen,
  onRemove,
  onDelete,
}: {
  map: VisualFocusMap;
  onOpen: () => void;
  onRemove?: () => void;
  onDelete?: () => void;
}) {
  const card = getStudioCardByMode(map.mode);
  const accent = card?.accent;
  const emoji = card?.emoji ?? "💡";
  const modeTitle = card?.title ?? map.mode;
  const showActions = Boolean(onRemove || onDelete);

  return (
    <div
      className={`relative flex min-w-[200px] flex-1 flex-col rounded-2xl border border-[#e7dfd4] border-t-4 bg-white p-4 shadow-sm transition hover:shadow-md ${
        accent?.borderTop ?? "border-t-violet-500"
      }`}
      data-testid={`continue-thinking-${map.id}`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col text-left"
      >
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
            accent?.iconRing ?? "bg-violet-100 text-violet-800"
          }`}
          aria-hidden
        >
          {emoji}
        </span>
        <span className="mt-3 line-clamp-2 font-bold text-[#1f1c19]">{map.title}</span>
        <span className="mt-1 text-xs font-medium text-[#6b635a]">{modeTitle}</span>
      </button>

      {showActions ? (
        <div
          className="mt-3 flex flex-wrap gap-2 border-t border-[#efe8df] pt-3"
          data-testid={`continue-thinking-actions-${map.id}`}
        >
          {onRemove ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="rounded-lg border border-[#d4cdc3] bg-[#faf7f2] px-3 py-1.5 text-xs font-semibold text-[#1f1c19] hover:bg-[#f0ebe3]"
              data-testid={`continue-thinking-remove-${map.id}`}
            >
              Remove
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded-lg border border-[#f0d4d4] bg-[#fff5f5] px-3 py-1.5 text-xs font-semibold text-[#9b2c2c] hover:bg-[#fde8e8]"
              data-testid={`continue-thinking-delete-${map.id}`}
            >
              Delete
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
