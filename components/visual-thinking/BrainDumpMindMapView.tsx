"use client";

import { useMemo } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  auditClusterConnectionAlignment,
  buildBrainDumpClusterGraph,
  buildConnectionGroups,
} from "@/lib/brainDumpClusterModel";
import { loadClusterOverrides } from "@/lib/brainDumpClusterPreferences";
import { VISUAL_THINKING_COLORS } from "@/lib/visualThinkingColors";

export function BrainDumpMindMapView({
  entries,
}: {
  entries: BrainDumpEntry[];
}) {
  const overrides = useMemo(() => loadClusterOverrides(), [entries]);
  const graph = useMemo(
    () => buildBrainDumpClusterGraph(entries, overrides),
    [entries, overrides],
  );
  const connections = useMemo(
    () => buildConnectionGroups(graph.relationships),
    [graph.relationships],
  );
  const audit = useMemo(
    () => auditClusterConnectionAlignment(graph),
    [graph],
  );

  if (!graph.hasContent) {
    return (
      <p className="px-4 py-8 text-center text-lg text-[#6b635a]">
        Connections appear when thoughts share a project, goal, category, timing, or strong theme.
      </p>
    );
  }

  return (
    <div className="space-y-5 px-3 py-4 sm:px-5">
      <div className="text-center">
        <p className="text-base font-bold uppercase tracking-wide text-[#6b635a]">
          Connections
        </p>
        <p className="mt-1 text-base leading-relaxed text-[#9a8f82]">
          Why thoughts affect each other — only real links, no invented themes.
        </p>
      </div>

      {audit.factors.length > 0 ? (
        <aside
          className="mx-auto max-w-2xl rounded-xl border border-[#e4ddd2] bg-[#faf7f2]/80 px-4 py-3 text-sm text-[#5a5248]"
          data-testid="cluster-alignment-audit"
        >
          <p className="font-semibold text-[#1f1c19]">{audit.summary}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {audit.factors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </aside>
      ) : null}

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {connections.map((group) => {
          const palette = VISUAL_THINKING_COLORS.idea;
          return (
            <article
              key={`${group.kind}-${group.detail ?? group.whyLabel}`}
              className="companion-fade-in rounded-2xl border-2 p-4 sm:p-5"
              style={{
                background: palette.bgGradient,
                borderColor: palette.border,
              }}
              data-testid={`connection-group-${group.kind}`}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                Why connected
              </p>
              <h3
                className="mt-1 text-lg font-bold sm:text-xl"
                style={{ color: palette.text }}
              >
                {group.whyLabel}
              </h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                {group.thoughts.map((thought) => (
                  <li
                    key={thought}
                    className="text-base leading-relaxed"
                    style={{ color: palette.text }}
                  >
                    {thought}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      {connections.length === 0 ? (
        <p
          className="text-center text-base text-[#6b635a]"
          data-testid="no-connections-message"
        >
          No strong connections found.
        </p>
      ) : null}
    </div>
  );
}
