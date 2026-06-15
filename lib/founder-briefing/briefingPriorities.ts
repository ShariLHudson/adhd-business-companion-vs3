/**
 * Rank and cap briefing items — max 3 priorities, max 3 actions.
 */

import type { BriefingItem, BriefingOverallStatus } from "./types";
import type { IntelligenceAggregate } from "./briefingInsights";

export function pickTopItems(items: BriefingItem[], limit: number): BriefingItem[] {
  return [...items].sort((a, b) => b.weight - a.weight).slice(0, limit);
}

export function inferOverallStatus(agg: IntelligenceAggregate): BriefingOverallStatus {
  if (agg.recovery.burnoutRiskCount >= 2 || agg.userHealth.overloadedCount >= 3) {
    return "urgent";
  }
  if (
    agg.recovery.burnoutRiskCount > 0 ||
    agg.userHealth.needsSupportCount >= 2 ||
    agg.recovery.decliningEnergyCount >= 2
  ) {
    return "needs_attention";
  }
  if (
    agg.loops.loadTrend === "rising" ||
    agg.cognitiveLoad.loadTrend === "rising" ||
    agg.userHealth.disengagingCount > 0
  ) {
    return "watch";
  }
  return "healthy";
}

export function statusLabel(status: BriefingOverallStatus): string {
  switch (status) {
    case "healthy":
      return "healthy overall";
    case "watch":
      return "mostly healthy — a few things to watch";
    case "needs_attention":
      return "needs attention in a few areas";
    case "urgent":
      return "needs attention today";
  }
}

export function statusColorClass(status: BriefingOverallStatus): string {
  switch (status) {
    case "healthy":
      return "text-[#1e4f4f]";
    case "watch":
      return "text-[#7a5c00]";
    case "needs_attention":
      return "text-[#a85c4a]";
    case "urgent":
      return "text-[#c9684d]";
  }
}
