/**
 * Founder-facing loop reporting — patterns only, no individual diagnosis.
 */

import { LOOP_PURPOSES } from "./loopMessages";
import { getLoopStore } from "./loopStore";
import type { FounderLoopReport, LoopType } from "./types";

const LOOP_LABELS: Record<LoopType, string> = {
  anxiety_loop: "Anxiety",
  rumination_loop: "Rumination",
  perfectionism_loop: "Perfectionism",
  guilt_loop: "Guilt",
  shame_loop: "Shame",
  comparison_loop: "Comparison",
  impostor_loop: "Impostor feelings",
  control_loop: "Control",
  connection_loop: "Connection",
  achievement_loop: "Achievement pressure",
  rsd_loop: "RSD / rejection sensitivity",
  certainty_loop: "Certainty seeking",
  potential_loop: "Potential worry",
  research_loop: "Research",
  planning_loop: "Planning",
  optimization_loop: "Optimization",
  productivity_loop: "Productivity pressure",
  overwhelm_loop: "Overwhelm",
  restart_loop: "Restart",
  recovery_loop: "Recovery guilt",
};

export function buildFounderLoopReport(now = new Date()): FounderLoopReport {
  const store = getLoopStore();
  const since7d = now.getTime() - 7 * 86_400_000;
  const sincePrior7d = now.getTime() - 14 * 86_400_000;

  const recentSnapshots = store.snapshots.filter(
    (s) => new Date(s.createdAt).getTime() >= since7d,
  );
  const priorSnapshots = store.snapshots.filter((s) => {
    const t = new Date(s.createdAt).getTime();
    return t >= sincePrior7d && t < since7d;
  });

  const typeCounts = new Map<LoopType, number>();
  const purposeCounts = new Map<string, number>();

  for (const snap of recentSnapshots) {
    typeCounts.set(snap.loopType, (typeCounts.get(snap.loopType) ?? 0) + 1);
    purposeCounts.set(
      snap.possiblePurpose,
      (purposeCounts.get(snap.possiblePurpose) ?? 0) + 1,
    );
  }

  const commonLoopTypes = [...typeCounts.entries()]
    .map(([type, count]) => ({
      type,
      label: LOOP_LABELS[type],
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const priorCounts = new Map<LoopType, number>();
  for (const snap of priorSnapshots) {
    priorCounts.set(
      snap.loopType,
      (priorCounts.get(snap.loopType) ?? 0) + 1,
    );
  }

  const emergingLoops = commonLoopTypes
    .filter((row) => {
      const prior = priorCounts.get(row.type) ?? 0;
      return row.count >= 2 && row.count > prior;
    })
    .map((row) => ({
      type: row.type,
      label: row.label,
      trend: (priorCounts.get(row.type) ?? 0) === 0
        ? ("new" as const)
        : ("rising" as const),
    }))
    .slice(0, 4);

  const commonPurposes = [...purposeCounts.entries()]
    .map(([purpose, count]) => ({ purpose, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topType = commonLoopTypes[0]?.type;
  const recommendedFounderAction = founderActionFor(topType);
  const contentOpportunities = contentIdeasFor(topType, emergingLoops);

  return {
    generatedAt: now.toISOString(),
    sampleSize: recentSnapshots.length,
    commonLoopTypes,
    emergingLoops,
    loadTrend: computeTrend(recentSnapshots.length, priorSnapshots.length),
    commonPurposes,
    recommendedFounderAction,
    contentOpportunities,
    notes:
      "Local preview — aggregated loop patterns only, never individual diagnosis.",
  };
}

function computeTrend(
  recent: number,
  prior: number,
): "rising" | "stable" | "easing" {
  if (recent >= prior + 2) return "rising";
  if (recent <= prior - 2) return "easing";
  return "stable";
}

function founderActionFor(type: LoopType | undefined): string {
  switch (type) {
    case "rsd_loop":
    case "connection_loop":
      return "RSD/connection loops are increasing. Consider creating supportive content around feedback and rejection sensitivity.";
    case "research_loop":
    case "certainty_loop":
      return "Research loops are common. Consider adding a 'good enough to act' support flow.";
    case "perfectionism_loop":
    case "optimization_loop":
      return "Perfectionism/optimization loops are common. Highlight good-enough shipping examples.";
    case "overwhelm_loop":
      return "Overwhelm loops are rising. Promote load-sorting and park workflows earlier.";
    case "productivity_loop":
    case "achievement_loop":
      return "Productivity pressure loops detected. Audit copy for shame-free, enough-for-today language.";
    case "recovery_loop":
      return "Recovery guilt loops detected. Surface rest-as-work messaging in companion.";
    case "planning_loop":
    case "restart_loop":
      return "Planning/restart loops common. Add 'start messy' prompts before planning tools.";
    default:
      return "Monitor loop patterns — no product change suggested until trends clarify.";
  }
}

function contentIdeasFor(
  topType: LoopType | undefined,
  emerging: { type: LoopType; label: string }[],
): string[] {
  const ideas: string[] = [];
  if (topType === "rsd_loop" || topType === "connection_loop") {
    ideas.push("Short guide: feedback without spiraling");
    ideas.push("Template: private draft before public share");
  }
  if (topType === "research_loop" || topType === "certainty_loop") {
    ideas.push("Checklist: good enough to act");
    ideas.push("Prompt: one decision with partial info");
  }
  if (topType === "perfectionism_loop" || topType === "optimization_loop") {
    ideas.push("Example: shipped vs. perfect comparison");
  }
  for (const e of emerging.slice(0, 2)) {
    const purpose = LOOP_PURPOSES[e.type];
    if (purpose) ideas.push(`${e.label}: ${purpose}`);
  }
  return [...new Set(ideas)].slice(0, 4);
}

export { LOOP_LABELS };
