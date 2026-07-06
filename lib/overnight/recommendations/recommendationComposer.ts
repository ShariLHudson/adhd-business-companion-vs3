import type { PrioritizedItem } from "../types";

export function topRecommendations(items: PrioritizedItem[], limit = 5): PrioritizedItem[] {
  return [...items].sort((a, b) => b.compositeScore - a.compositeScore).slice(0, limit);
}

export function recommendationsByKind(
  items: PrioritizedItem[],
  kind: PrioritizedItem["kind"],
): PrioritizedItem[] {
  return items.filter((i) => i.kind === kind);
}

export function executiveDecisionsNeedingAttention(items: PrioritizedItem[]): PrioritizedItem[] {
  return items.filter((i) => i.kind === "executive-decision");
}
