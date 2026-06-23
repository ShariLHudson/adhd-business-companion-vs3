"use client";

import { useMemo } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  buildBrainDumpClusterGraph,
  groupRelationshipsByTheme,
} from "@/lib/brainDumpClusterModel";
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
  const themes = useMemo(
    () => groupRelationshipsByTheme(graph.relationships),
    [graph.relationships],
  );

  if (!themes.length && !graph.hasContent) {
    return (
      <p className="px-4 py-8 text-center text-lg text-[#6b635a]">
        Related themes appear when your thoughts share a topic or category.
      </p>
    );
  }

  return (
    <div className="space-y-5 px-3 py-4 sm:px-5">
      <div className="text-center">
        <p className="text-base font-bold uppercase tracking-wide text-[#6b635a]">
          Related Thoughts
        </p>
        <p className="mt-1 text-base leading-relaxed text-[#9a8f82]">
          Patterns that belong together — not a diagram to decode.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {themes.map((theme) => {
          const palette = VISUAL_THINKING_COLORS.idea;
          return (
            <article
              key={theme.reason}
              className="companion-fade-in rounded-2xl border-2 p-4 sm:p-5"
              style={{
                background: palette.bgGradient,
                borderColor: palette.border,
              }}
              data-testid={`related-theme-${theme.reason}`}
            >
              <h3
                className="text-lg font-bold sm:text-xl"
                style={{ color: palette.text }}
              >
                {theme.themeLabel}
              </h3>
              <p className="mt-2 text-base font-medium text-[#6b635a]">
                These thoughts seem related:
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                {theme.thoughts.map((thought) => (
                  <li
                    key={thought}
                    className="text-base leading-relaxed"
                    style={{ color: palette.text }}
                  >
                    {thought}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-base leading-relaxed text-[#5a5248]">
                <span className="font-semibold text-[#1f1c19]">Observation: </span>
                {theme.observation}
              </p>
            </article>
          );
        })}
      </div>

      {themes.length === 0 && graph.hasContent ? (
        <p className="text-center text-base text-[#6b635a]">
          Add a few more thoughts — related themes will appear when ideas overlap.
        </p>
      ) : null}
    </div>
  );
}
