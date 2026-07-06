/**
 * Optional Founder bridge — Executive Awareness without UI wiring.
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { awarenessService, composeAwareness, significantAwareness } from "@/lib/awareness";

export function prepareFounderAwareness(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    ...composeAwareness({ missionId }),
    architectureOnly: true as const,
  };
}

export function prepareFounderSignificantAwareness(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    recommendations: significantAwareness(missionId),
    principle: awarenessService.sampleRepository().principle(),
    architectureOnly: true as const,
  };
}

export function prepareFounderAwarenessNotices() {
  return {
    product: "founder" as const,
    notices: awarenessService.sampleRepository().notices(),
    questions: awarenessService.sampleRepository().questions(),
    architectureOnly: true as const,
  };
}
