import type { ExecutiveTimeSensitivity } from "../types";

export function labelForTimeSensitivity(sensitivity: ExecutiveTimeSensitivity): string {
  const map: Record<ExecutiveTimeSensitivity, string> = {
    today: "Today",
    "this-week": "This week",
    "this-month": "This month",
    "next-quarter": "Next quarter",
    "long-term": "Long term",
    "no-action-needed": "No action needed",
  };
  return map[sensitivity];
}

export function timeSensitivityFromUrgency(score: number): ExecutiveTimeSensitivity {
  if (score >= 85) return "today";
  if (score >= 70) return "this-week";
  if (score >= 55) return "this-month";
  if (score >= 40) return "next-quarter";
  if (score >= 20) return "long-term";
  return "no-action-needed";
}
