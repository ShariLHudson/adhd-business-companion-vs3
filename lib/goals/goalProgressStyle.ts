import { getPrefs } from "@/lib/companionStore";

export const GOAL_PROGRESS_STYLES = [
  "progress-bars",
  "circular",
  "donut",
  "line-graph",
  "dashboard-cards",
  "compact-numbers",
] as const;

export type GoalProgressStyle = (typeof GOAL_PROGRESS_STYLES)[number];

export const GOAL_PROGRESS_STYLE_LABELS: Record<GoalProgressStyle, string> = {
  "progress-bars": "Progress Bars",
  circular: "Circular Progress",
  donut: "Donut Charts",
  "line-graph": "Line Graph",
  "dashboard-cards": "Dashboard Cards",
  "compact-numbers": "Compact Numbers Only",
};

export function normalizeGoalProgressStyle(value: unknown): GoalProgressStyle {
  if (
    typeof value === "string" &&
    GOAL_PROGRESS_STYLES.includes(value as GoalProgressStyle)
  ) {
    return value as GoalProgressStyle;
  }
  return "progress-bars";
}

export function getGoalProgressStyle(): GoalProgressStyle {
  return normalizeGoalProgressStyle(getPrefs().goalProgressStyle);
}

export function goalProgressStyleLabel(style: GoalProgressStyle): string {
  return GOAL_PROGRESS_STYLE_LABELS[style];
}
