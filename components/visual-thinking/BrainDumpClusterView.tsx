"use client";

import { useMemo } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { buildBrainDumpClusterGraph, formatClusterDotWeight } from "@/lib/brainDumpClusterModel";
import { VISUAL_THINKING_COLORS } from "@/lib/visualThinkingColors";
import { VisualConnector } from "./VisualCanvasNode";

function ClusterCard({
  label,
  icon,
  count,
  tone,
  subClusters,
}: {
  label: string;
  icon: string;
  count: number;
  tone: keyof typeof VISUAL_THINKING_COLORS;
  overwhelm: boolean;
  subClusters: {
    label: string;
    visibleThoughts: { text: string }[];
    moreCount: number;
    overwhelm: boolean;
  }[];
}) {
  const palette = VISUAL_THINKING_COLORS[tone];
  const { dots, suffix } = formatClusterDotWeight(count);
  return (
    <div
      className="rounded-2xl border-2 p-4 shadow-md"
      style={{
        background: palette.bgGradient,
        borderColor: palette.border,
        boxShadow: palette.shadow,
      }}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-base font-bold sm:text-lg" style={{ color: palette.text }}>
          {icon} {label}
        </p>
        <span
          className="text-sm tracking-[0.2em]"
          style={{ color: palette.text }}
          aria-hidden="true"
        >
          {dots}
          {suffix ? (
            <span className="ml-1.5 tracking-normal opacity-70">{suffix}</span>
          ) : null}
        </span>
      </div>
      {subClusters.length > 1 ? (
        <p className="mt-2 text-xs opacity-70" style={{ color: palette.text }}>
          {subClusters.length} themes grouped here
        </p>
      ) : null}
    </div>
  );
}

export function BrainDumpClusterView({
  entries,
}: {
  entries: BrainDumpEntry[];
}) {
  const graph = useMemo(
    () => buildBrainDumpClusterGraph(entries),
    [entries],
  );

  if (!graph.hasContent) {
    return (
      <div className="flex h-full min-h-[180px] flex-col items-center justify-center px-4 text-center">
        <p className="text-4xl" aria-hidden>
          🧠
        </p>
        <p className="mt-3 text-base text-[#6b635a]">
          Clusters will form here as you capture thoughts.
        </p>
      </div>
    );
  }

  const palette = VISUAL_THINKING_COLORS.decision;

  return (
    <div
      className="px-3 py-4 sm:px-4"
      role="img"
      aria-label={`${graph.totalThoughts} thoughts in ${graph.clusters.length} clusters`}
    >
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4">
        <div
          className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-[3px] text-center shadow-lg sm:h-32 sm:w-32"
          style={{
            background: palette.bgGradient,
            borderColor: palette.border,
            boxShadow: palette.shadow,
          }}
        >
          <span className="text-3xl" aria-hidden>
            {graph.centerIcon}
          </span>
          <p className="mt-1 px-2 text-xs font-bold sm:text-sm" style={{ color: palette.text }}>
            {graph.centerLabel}
          </p>
          <p className="text-[10px] font-medium opacity-70" style={{ color: palette.text }}>
            Safely held
          </p>
        </div>

        {graph.focusSuggestion ? (
          <p className="max-w-sm rounded-2xl border border-[#e7dfd4] bg-[#faf7f2]/90 px-4 py-3 text-center text-sm leading-relaxed text-[#5a5248]">
            {graph.focusSuggestion.replace(/\*\*/g, "")}
          </p>
        ) : null}

        <div className="grid w-full gap-3 sm:grid-cols-2">
          {graph.clusters.map((cluster, i) => (
            <div key={cluster.id} className="flex flex-col gap-2">
              {i > 0 ? (
                <VisualConnector
                  tone={cluster.tone}
                  className="mx-auto hidden h-6 w-16 sm:block"
                />
              ) : null}
              <ClusterCard
                label={cluster.label}
                icon={cluster.icon}
                count={cluster.count}
                tone={cluster.tone}
                overwhelm={cluster.overwhelm}
                subClusters={cluster.subClusters}
              />
            </div>
          ))}
        </div>
      </div>

      <ul className="sr-only">
        {graph.clusters.flatMap((c) =>
          c.subClusters.flatMap((s) =>
            s.thoughts.map((t) => <li key={t.id}>{t.text}</li>),
          ),
        )}
      </ul>
    </div>
  );
}
