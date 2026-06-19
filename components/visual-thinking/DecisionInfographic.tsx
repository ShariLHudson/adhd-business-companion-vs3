"use client";

import { useMemo } from "react";
import type { PersistedDecisionCompassSession } from "@/lib/decisionCompassSessionStore";
import {
  buildDecisionCanvasGraph,
  buildDecisionMapView,
} from "@/lib/decisionCanvasModel";
import { VISUAL_THINKING_COLORS } from "@/lib/visualThinkingColors";

export function DecisionInfographic({
  session,
  exportRef,
}: {
  session: PersistedDecisionCompassSession | null;
  exportRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const vm = useMemo(() => buildDecisionMapView(session), [
    session?.lastTouchedAt,
    session?.sessionId,
  ]);
  const graph = useMemo(() => buildDecisionCanvasGraph(session), [
    session?.lastTouchedAt,
    session?.sessionId,
  ]);

  const gold = VISUAL_THINKING_COLORS.insight;
  const green = VISUAL_THINKING_COLORS.benefit;
  const coral = VISUAL_THINKING_COLORS.concern;

  return (
    <div
      ref={exportRef}
      className="decision-infographic mx-auto max-w-lg px-4 py-5"
      data-testid="decision-infographic"
    >
      <div
        className="overflow-hidden rounded-3xl border-2 shadow-xl"
        style={{
          borderColor: VISUAL_THINKING_COLORS.decision.border,
          background: "linear-gradient(160deg, #ffffff 0%, #faf7f2 50%, #f0ebe3 100%)",
        }}
      >
        <div className="border-b border-[#e7dfd4] bg-white/80 px-6 py-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#9a8f82]">
            ADHD Decision Canvas
          </p>
          <p className="mt-2 text-xl font-bold text-[#1f1c19] sm:text-2xl">
            🎯 {vm.decision || "Your decision"}
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div
            className="rounded-2xl border-2 p-4"
            style={{
              background: green.bgGradient,
              borderColor: green.border,
              boxShadow: graph.recommendedSide === "A" ? gold.shadow : undefined,
            }}
          >
            <p className="text-sm font-bold" style={{ color: green.text }}>
              🟢 {vm.optionA.label}
            </p>
            {vm.optionA.benefits[0] ? (
              <p className="mt-2 text-sm" style={{ color: green.text }}>
                ✅ {vm.optionA.benefits[0]}
              </p>
            ) : null}
            {vm.optionA.concerns[0] ? (
              <p className="mt-1 text-sm" style={{ color: coral.text }}>
                ⚠ {vm.optionA.concerns[0]}
              </p>
            ) : null}
          </div>
          <div
            className="rounded-2xl border-2 p-4"
            style={{
              background: VISUAL_THINKING_COLORS["option-b"].bgGradient,
              borderColor: VISUAL_THINKING_COLORS["option-b"].border,
              boxShadow: graph.recommendedSide === "B" ? gold.shadow : undefined,
            }}
          >
            <p
              className="text-sm font-bold"
              style={{ color: VISUAL_THINKING_COLORS["option-b"].text }}
            >
              🔵 {vm.optionB.label}
            </p>
            {vm.optionB.benefits[0] ? (
              <p
                className="mt-2 text-sm"
                style={{ color: VISUAL_THINKING_COLORS.benefit.text }}
              >
                ✅ {vm.optionB.benefits[0]}
              </p>
            ) : null}
            {vm.optionB.concerns[0] ? (
              <p className="mt-1 text-sm" style={{ color: coral.text }}>
                ⚠ {vm.optionB.concerns[0]}
              </p>
            ) : null}
          </div>
        </div>

        {vm.scores.length > 0 ? (
          <div className="border-t border-[#e7dfd4] px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
              Quick comparison
            </p>
            <div className="mt-3 space-y-3">
              {vm.scores.slice(0, 4).map((s) => (
                <div key={s.id}>
                  <p className="text-xs font-semibold text-[#1f1c19]">{s.label}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-medium">
                    <span className="w-8 shrink-0 text-emerald-800">A</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e7dfd4]">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${s.optionAPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] font-medium">
                    <span className="w-8 shrink-0 text-blue-800">B</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e7dfd4]">
                      <div
                        className="h-full rounded-full bg-blue-400"
                        style={{ width: `${s.optionBPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {vm.recommendation ? (
          <div
            className="border-t-2 px-5 py-5 text-center"
            style={{
              borderColor: gold.border,
              background: gold.bgGradient,
            }}
          >
            <p className="text-sm font-bold" style={{ color: gold.text }}>
              ⭐ Recommended Direction
            </p>
            <p className="mt-1 text-lg font-bold" style={{ color: gold.text }}>
              {vm.recommendation.choice}
            </p>
            {vm.recommendation.primaryReasons.slice(0, 3).map((r, i) => (
              <p key={i} className="mt-1 text-sm" style={{ color: gold.text }}>
                • {r}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
