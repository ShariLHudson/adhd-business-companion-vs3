import type { FounderAnalyticsSummary } from "../types";

/** Placeholder — Phase 3+ connects real analytics. */
export function getAnalyticsSummary(): FounderAnalyticsSummary[] {
  return [
    {
      id: "an-1",
      label: "Member returns",
      value: "Steady",
      trend: "up",
      note: "Calm re-entry copy performing well",
    },
    {
      id: "an-2",
      label: "Conversation depth",
      value: "+12%",
      trend: "up",
      note: "Spark Alpha vs baseline",
    },
    {
      id: "an-3",
      label: "Estate wander",
      value: "High",
      trend: "flat",
      note: "Conservatory curiosity spike",
    },
  ];
}
