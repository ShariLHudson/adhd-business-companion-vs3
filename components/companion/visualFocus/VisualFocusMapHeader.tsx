"use client";

import type { VisualFocusMap } from "@/lib/visualFocus/types";
import { studioCardTitleForMode } from "@/lib/visualFocus/studioCards";

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function saveStatusLabel(status: VisualFocusMap["saveStatus"]): string {
  if (status === "saving") return "Saving…";
  if (status === "unsaved") return "Unsaved changes";
  return "Saved";
}

export function VisualFocusMapHeader({ map }: { map: VisualFocusMap }) {
  const typeLabel = `${studioCardTitleForMode(map.mode)}™`;
  const purpose = map.purposeAnchor?.userAnswer?.trim();

  return (
    <header
      className="rounded-2xl border border-[#e7dfd4] bg-[#faf7f2] px-4 py-4"
      data-testid="visual-focus-map-header"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-[#1f1c19]">{map.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#1e4f4f]">{typeLabel}</p>
            {map.lifecycleStatus === "archived" ? (
              <span className="rounded-full bg-[#6b635a]/15 px-2 py-0.5 text-xs font-bold text-[#6b635a]">
                Archived
              </span>
            ) : null}
            {(map.versions?.length ?? 0) > 0 ? (
              <span className="rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-bold text-[#1e4f4f]">
                {map.versions!.length} version{map.versions!.length === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
          {purpose ? (
            <p className="mt-2 text-sm text-[#6b635a]">
              <span className="font-semibold text-[#2f261f]">Purpose:</span> {purpose}
            </p>
          ) : null}
        </div>
        <div className="text-right text-xs text-[#6b635a]">
          <p
            className="font-semibold text-[#1e4f4f]"
            data-testid="visual-focus-save-status"
          >
            {saveStatusLabel(map.saveStatus)}
          </p>
          <p className="mt-1">Updated {formatRelativeTime(map.updatedAt)}</p>
          <p>Created {new Date(map.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </header>
  );
}
