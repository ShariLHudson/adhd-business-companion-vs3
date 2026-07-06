import type { AttentionItem, AttentionLevel, IgnoreAction, IgnoreRecommendation } from "../types";

export function classifyAttention(
  item: Omit<AttentionItem, "level"> & { level?: AttentionLevel },
): AttentionItem {
  return { ...item, level: item.level ?? "next" };
}

export function groupByAttentionLevel(items: AttentionItem[]): Record<AttentionLevel, AttentionItem[]> {
  return {
    now: items.filter((i) => i.level === "now"),
    next: items.filter((i) => i.level === "next"),
    watch: items.filter((i) => i.level === "watch"),
    library: items.filter((i) => i.level === "library"),
  };
}

export function recommendIgnore(items: AttentionItem[]): IgnoreRecommendation[] {
  return items
    .filter((i) => i.level === "watch" || i.level === "library")
    .slice(0, 5)
    .map((i) => ({
      id: `ignore-${i.id}`,
      title: i.title,
      reason:
        i.level === "library"
          ? "Reference only — do not spend time here today."
          : "Interesting but not actionable today.",
      action: (i.ignoreAction ?? "ignore_today") as IgnoreAction,
    }));
}

export const ATTENTION_LEVEL_LABELS: Record<AttentionLevel, string> = {
  now: "Needs attention today",
  next: "Probably later today",
  watch: "Interesting but not actionable",
  library: "Reference only",
};
