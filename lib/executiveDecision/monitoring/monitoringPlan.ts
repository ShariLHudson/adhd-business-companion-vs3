import type { ExecutiveDecision, MonitoringPlan } from "../types";

export function prepareMonitoring(decision: ExecutiveDecision): MonitoringPlan {
  if (decision.monitoring) return decision.monitoring;

  return {
    decisionId: decision.id,
    checkpoints: [
      {
        id: `cp-${decision.id}-progress`,
        label: "Implementation progress",
        status: "upcoming",
        notes: "Track blocked items and deadlines.",
      },
      {
        id: `cp-${decision.id}-feedback`,
        label: "Customer feedback",
        status: "upcoming",
        notes: "Watch for unexpected issues.",
      },
    ],
    metrics: [
      {
        id: `m-${decision.id}-mission`,
        label: "Mission progress",
        target: "On track",
        source: decision.missionId ? "Mission Workspace" : "Executive Brief",
      },
    ],
    watchFor: ["Blocked items", "Missed deadlines", "Trust signals", "Revenue anomalies"],
    recommendationTriggers: ["Metric misses target", "New customer feedback pattern", "Risk threshold crossed"],
  };
}
