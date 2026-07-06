/**
 * Optional Founder bridge — Companion Intelligence Governor without UI wiring.
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { composeGovernor, governorService, governorPrimaryRecommendation } from "@/lib/governor";

export function prepareFounderGovernor(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    ...composeGovernor({ missionId }),
    architectureOnly: true as const,
  };
}

export function prepareFounderGovernorPrimary(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    primary: governorPrimaryRecommendation(missionId),
    principle: governorService.sampleRepository().principle(),
    attentionProtected: true as const,
    architectureOnly: true as const,
  };
}

export function prepareFounderGovernorCoordination() {
  return {
    product: "founder" as const,
    coordinatedSystems: governorService.sampleRepository().coordinatedSystems(),
    questions: governorService.sampleRepository().questions(),
    trustRules: governorService.sampleRepository().trustRules(),
    architectureOnly: true as const,
  };
}
