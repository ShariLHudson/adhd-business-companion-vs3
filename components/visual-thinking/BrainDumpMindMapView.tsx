"use client";

import { useMemo } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { buildBrainDumpClusterGraph } from "@/lib/brainDumpClusterModel";
import { VISUAL_THINKING_COLORS } from "@/lib/visualThinkingColors";

export function BrainDumpMindMapView({
  entries,
}: {
  entries: BrainDumpEntry[];
}) {
  const graph = useMemo(
    () => buildBrainDumpClusterGraph(entries),
    [entries],
  );

  if (!graph.relationships.length && !graph.hasContent) {
    return (
      <p className="px-4 py-8 text-center text-base text-[#6b635a]">
        Relationships appear when thoughts connect by topic or theme.
      </p>
    );
  }

  return (
    <div className="space-y-4 px-3 py-4 sm:px-4">
      <p className="text-center text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        How your thoughts connect
      </p>
      <div className="mx-auto flex max-w-md flex-col gap-3">
        {graph.relationships.map((rel, i) => {
          const palette = VISUAL_THINKING_COLORS.idea;
          return (
            <div
              key={`${rel.fromId}-${rel.toId}-${i}`}
              className="companion-fade-in rounded-2xl border-2 p-3"
              style={{
                background: palette.bgGradient,
                borderColor: palette.border,
              }}
            >
              <p className="text-sm font-semibold" style={{ color: palette.text }}>
                {rel.fromLabel}
              </p>
              <p className="my-1 text-center text-xs font-bold text-[#6b635a]">
                ↕ connected via {rel.reason}
              </p>
              <p className="text-sm font-semibold" style={{ color: palette.text }}>
                {rel.toLabel}
              </p>
            </div>
          );
        })}
      </div>
      {graph.relationships.length === 0 && graph.hasContent ? (
        <p className="text-center text-sm text-[#6b635a]">
          Add a few more thoughts — connections will appear when themes overlap.
        </p>
      ) : null}
    </div>
  );
}
