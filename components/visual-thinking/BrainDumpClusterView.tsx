"use client";

import { useMemo } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { buildBrainDumpClusterGraph } from "@/lib/brainDumpClusterModel";
import { VISUAL_THINKING_COLORS } from "@/lib/visualThinkingColors";
import { VisualConnector } from "./VisualCanvasNode";

function ClusterCard({
  label,
  icon,
  count,
  tone,
  overwhelm,
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
  return (
    <div
      className="companion-fade-in rounded-2xl border-2 p-4 shadow-md"
      style={{
        background: palette.bgGradient,
        borderColor: palette.border,
        boxShadow: palette.shadow,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-bold sm:text-lg" style={{ color: palette.text }}>
          {icon} {label}
        </p>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{ background: `${palette.border}44`, color: palette.text }}
        >
          {overwhelm ? "🔥 " : ""}
          {count}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {subClusters.map((sub) => (
          <div
            key={sub.label}
            className="rounded-xl border border-white/60 bg-white/50 px-3 py-2"
          >
            <p className="text-xs font-bold uppercase tracking-wide opacity-70">
              {sub.label}
              {sub.overwhelm ? " 🔥" : ""}
            </p>
            <ul className="mt-1 space-y-1">
              {sub.visibleThoughts.map((t, i) => (
                <li key={i} className="text-sm leading-snug" style={{ color: palette.text }}>
                  {t.text}
                </li>
              ))}
            </ul>
            {sub.moreCount > 0 ? (
              <p className="mt-1 text-xs font-semibold opacity-70">+{sub.moreCount} more</p>
            ) : null}
          </div>
        ))}
      </div>
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
          <p className="text-[10px] font-semibold opacity-70" style={{ color: palette.text }}>
            {graph.totalThoughts} thoughts
          </p>
        </div>

        {graph.focusSuggestion ? (
          <p className="max-w-sm rounded-2xl border border-[#fcd34d]/50 bg-amber-50/80 px-4 py-3 text-center text-sm text-amber-950">
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
