/**
 * Optional Founder bridge — Executive Experience Framework without UI wiring.
 */
import type { ExecutiveExperienceId } from "@/lib/experiences/types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { composeExperience, experienceService, listExperiences, routeExperienceFromPhrase } from "@/lib/experiences";

export function prepareFounderExperience(
  experienceId: ExecutiveExperienceId,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    ...composeExperience({ experienceId, missionId }),
    architectureOnly: true as const,
  };
}

export function prepareFounderExperienceFromPhrase(
  phrase: string,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  const routed = routeExperienceFromPhrase(phrase, missionId);
  return {
    product: "founder" as const,
    missionId,
    experience: routed.experience,
    composed: routed.composed,
    architectureOnly: true as const,
  };
}

export function prepareFounderExperienceCatalog() {
  return {
    product: "founder" as const,
    principle: experienceService.sampleRepository().principle(),
    rules: experienceService.sampleRepository().rules(),
    experiences: listExperiences(),
    architectureOnly: true as const,
  };
}
