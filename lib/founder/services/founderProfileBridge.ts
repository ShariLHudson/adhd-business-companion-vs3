/**
 * Optional Founder bridge — Executive Digital Twin without UI wiring.
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { founderProfileService } from "@/lib/founderProfile";

export function getFounderDigitalTwinBundle(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    profile: founderProfileService.profile({ missionId }),
    patterns: founderProfileService.patterns(),
    friction: founderProfileService.friction(),
    strengths: founderProfileService.strengths(),
    recommendations: founderProfileService.recommend({ missionId }),
    topRecommendation: founderProfileService.topRecommendation({ missionId }),
  };
}

export function prepareFounderAdaptationHints(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  const recs = founderProfileService.recommend({ missionId });
  return {
    product: "founder" as const,
    missionId,
    hints: recs.slice(0, 3),
    architectureOnly: true as const,
  };
}
