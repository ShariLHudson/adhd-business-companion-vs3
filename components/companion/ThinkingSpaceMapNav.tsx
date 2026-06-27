"use client";

import type { CollectionSummary } from "@/lib/thinkingSpace/collectionSummaries";
import { THINKING_MAP_TITLE } from "@/lib/thinkingSpace/copy";

type Props = {
  summaries: CollectionSummary[];
  focusedCollectionId: string | null;
  onOpenCollection: (collectionId: string) => void;
  onFocusCollection?: (collectionId: string | null) => void;
};

/**
 * @deprecated V2 — Future Thinking Map (relationship graph, not navigation).
 * Removed from My Thoughts garden in v1; do not wire back until it shows
 * clusters and connections rather than duplicating collection cards.
 */
export function ThinkingSpaceMapNav({
  summaries,
  focusedCollectionId,
  onOpenCollection,
  onFocusCollection,
}: Props) {
  if (summaries.length === 0) return null;

  return (
    <div className="thinking-space-map-nav" data-testid="thinking-space-map-nav">
      <p className="cmind-section-title">{THINKING_MAP_TITLE}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {summaries.map((summary) => {
          const palette = summary.palette;
          const focused = focusedCollectionId === summary.id;
          const softened =
            focusedCollectionId !== null && focusedCollectionId !== summary.id;

          return (
            <button
              key={summary.id}
              type="button"
              onClick={() => onOpenCollection(summary.id)}
              onMouseEnter={() => onFocusCollection?.(summary.id)}
              onMouseLeave={() => onFocusCollection?.(null)}
              onFocus={() => onFocusCollection?.(summary.id)}
              onBlur={() => onFocusCollection?.(null)}
              className={`thinking-map-node companion-fade-in rounded-full border-2 px-4 py-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35 ${
                focused ? "scale-110 shadow-md" : ""
              } ${softened ? "opacity-40" : ""}`}
              style={{
                background: palette.bgGradient,
                borderColor: focused ? "#1e4f4f" : palette.border,
              }}
              data-testid={`map-node-${summary.id}`}
              aria-pressed={focused}
            >
              <span className="text-lg" aria-hidden>
                {summary.icon}
              </span>
              <span
                className="ml-1.5 text-sm font-semibold"
                style={{ color: palette.text }}
              >
                {summary.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
