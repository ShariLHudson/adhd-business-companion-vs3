import type { AwarenessSignal } from "../types";

/** Sample prior-period baseline for trend comparison (V1). */
export const SAMPLE_PRIOR_SIGNALS: AwarenessSignal[] = [
  {
    id: "prior-mission-lr",
    domain: "mission_movement",
    title: "Listening Rooms progress",
    summary: "Mission at 42% — steady workshop prep.",
    source: "missions",
    missionId: "listening-rooms",
    metric: 42,
    observedAt: "2026-07-01T08:00:00.000Z",
  },
  {
    id: "prior-research-requests",
    domain: "research_change",
    title: "ADHD companion research interest",
    summary: "Moderate inbound research requests.",
    source: "overnight",
    metric: 55,
    observedAt: "2026-07-01T08:00:00.000Z",
  },
  {
    id: "prior-founder-context-switch",
    domain: "founder_behavior",
    title: "Founder context switching",
    summary: "Elevated switches between missions.",
    source: "founder_profile",
    metric: 68,
    observedAt: "2026-07-01T08:00:00.000Z",
  },
  {
    id: "prior-content-engagement",
    domain: "content_performance",
    title: "Spark Card engagement",
    summary: "Stable gallery return visits.",
    source: "command_center",
    metric: 50,
    observedAt: "2026-07-01T08:00:00.000Z",
  },
  {
    id: "prior-automation-gap",
    domain: "operational_bottleneck",
    title: "Manual onboarding steps",
    summary: "Repeated manual work in launch path.",
    source: "improvement",
    metric: 72,
    observedAt: "2026-07-01T08:00:00.000Z",
  },
];
