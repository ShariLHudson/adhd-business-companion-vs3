"use client";

import { useMemo } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { buildBrainDumpClusterGraph } from "@/lib/brainDumpClusterModel";
import { VISUAL_THINKING_COLORS } from "@/lib/visualThinkingColors";

export function BrainDumpInfographic({
  entries,
  exportRef,
}: {
  entries: BrainDumpEntry[];
  exportRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const graph = useMemo(
    () => buildBrainDumpClusterGraph(entries),
    [entries],
  );

  const topBenefits = graph.clusters
    .filter((c) => c.tone === "benefit" || c.tone === "fact")
    .slice(0, 2);
  const topConcerns = graph.clusters.filter((c) => c.tone === "concern").slice(0, 2);
  const overwhelm = graph.clusters.filter((c) => c.overwhelm);

  return (
    <div ref={exportRef} className="mx-auto max-w-2xl px-4 py-5 print:text-[14pt]" data-testid="brain-dump-infographic">
      <div
        className="overflow-hidden rounded-3xl border-2 shadow-xl"
        style={{ borderColor: VISUAL_THINKING_COLORS.decision.border }}
      >
        <div className="border-b border-[#e7dfd4] bg-white/90 px-6 py-4 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#9a8f82] print:text-base">
            Clear My Mind
          </p>
          <p className="mt-2 text-3xl font-bold text-[#1f1c19] print:text-4xl">
            🧠 {graph.totalThoughts} thoughts organized
          </p>
        </div>

        <div className="space-y-3 p-5">
          {graph.clusters
            .filter((c) => c.id !== "__more__")
            .slice(0, 5)
            .map((c) => {
              const p = VISUAL_THINKING_COLORS[c.tone];
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border-2 px-4 py-3"
                  style={{
                    background: p.bgGradient,
                    borderColor: p.border,
                  }}
                >
                  <p className="text-lg font-bold" style={{ color: p.text }}>
                    {c.icon} {c.label}{" "}
                    <span className="text-base font-semibold opacity-80">
                      {c.overwhelm ? "🔥 " : ""}({c.count})
                    </span>
                  </p>
                  {c.subClusters[0] ? (
                    <p className="mt-1 text-base" style={{ color: p.text }}>
                      {c.subClusters[0].visibleThoughts[0]?.text ?? c.subClusters[0].label}
                    </p>
                  ) : null}
                </div>
              );
            })}
        </div>

        {(topBenefits.length > 0 || topConcerns.length > 0) && (
          <div className="grid gap-3 border-t border-[#e7dfd4] p-5 sm:grid-cols-2">
            {topBenefits[0] ? (
              <div
                className="rounded-xl p-3"
                style={{ background: VISUAL_THINKING_COLORS.benefit.bgGradient }}
              >
                <p className="text-sm font-bold text-emerald-900 print:text-base">Top themes</p>
                <p className="text-base font-semibold text-emerald-950 print:text-lg">
                  {topBenefits[0].label}
                </p>
              </div>
            ) : null}
            {topConcerns[0] ? (
              <div
                className="rounded-xl p-3"
                style={{ background: VISUAL_THINKING_COLORS.concern.bgGradient }}
              >
                <p className="text-sm font-bold text-rose-900 print:text-base">Stress points</p>
                <p className="text-base font-semibold text-rose-950 print:text-lg">
                  {topConcerns[0].label}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {overwhelm.length > 0 ? (
          <div className="border-t border-amber-200 bg-amber-50 px-5 py-4 text-center">
            <p className="text-base font-semibold text-amber-950 print:text-lg">
              🔥 {overwhelm.map((c) => c.label).join(", ")} — lots on your mind here. No
              judgment — just noticing.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
