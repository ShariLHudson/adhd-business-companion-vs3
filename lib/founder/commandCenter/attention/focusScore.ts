import type { AttentionItem, ExecutiveFocusScore } from "../types";

export function calculateFocusScore(items: AttentionItem[], openMissions: number, openDecisions: number): ExecutiveFocusScore {
  const nowCount = items.filter((i) => i.level === "now").length;
  const nextCount = items.filter((i) => i.level === "next").length;
  const contextSwitchRisk = Math.min(100, nowCount * 12 + nextCount * 6 + openMissions * 8 + openDecisions * 5);

  let score = 100 - contextSwitchRisk;
  if (nowCount > 3) score -= 15;
  if (openDecisions > 4) score -= 10;
  score = Math.max(0, Math.min(100, score));

  const label: ExecutiveFocusScore["label"] =
    score >= 80 ? "calm" : score >= 65 ? "focused" : score >= 45 ? "busy" : "overloaded";

  const simplification: string[] = [];
  if (nowCount > 2) simplification.push("Limit NOW items to two — defer the rest to NEXT.");
  if (openDecisions > 3) simplification.push("Close or defer decisions not tied to today's mission.");
  if (openMissions > 2) simplification.push("One primary mission today; others move to WATCH.");
  if (simplification.length === 0) simplification.push("Workload looks calm — protect the single next action.");

  return {
    score,
    label,
    openMissions,
    openDecisions,
    nowCount,
    nextCount,
    contextSwitchRisk,
    simplification,
  };
}
