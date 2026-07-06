import type { ExecutivePriority, ExecutivePriorityLabel } from "../types";

const LABEL_THRESHOLDS: { min: number; label: ExecutivePriorityLabel }[] = [
  { min: 90, label: "critical" },
  { min: 75, label: "high" },
  { min: 55, label: "medium" },
  { min: 35, label: "low" },
  { min: 15, label: "watch" },
  { min: 0, label: "ignore" },
];

export function priorityFromScore(score: number): ExecutivePriority {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const label = LABEL_THRESHOLDS.find((t) => clamped >= t.min)?.label ?? "medium";
  return { label, score: clamped };
}

export function comparePriority(a: ExecutivePriority, b: ExecutivePriority): number {
  return b.score - a.score;
}

export function labelForPriority(label: ExecutivePriorityLabel): string {
  const map: Record<ExecutivePriorityLabel, string> = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    watch: "Watch",
    ignore: "Ignore",
  };
  return map[label];
}

export function isFounderAlertPriority(priority: ExecutivePriority): boolean {
  return priority.label === "critical" || priority.label === "high";
}
