/**
 * Optional Founder bridge — Continuous Improvement Engine without UI wiring.
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { improvementService } from "@/lib/improvement";

export function prepareImprovementPlan(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  const opportunities = improvementService.prioritizeImprovements(missionId);
  const recommendations = improvementService.recommendImprovements(missionId);
  const top = improvementService.topImprovement(missionId);

  return {
    product: "founder" as const,
    missionId,
    opportunities,
    recommendations,
    topImprovement: top,
    memoryLinks: improvementService.memoryLinks(),
    architectureOnly: true as const,
  };
}

export function prepareQuarterlyReview(missionId?: MissionId) {
  return {
    product: "founder" as const,
    review: improvementService.review({ kind: "quarterly", missionId }),
    experiments: improvementService.findExperiments(),
    prioritized: improvementService.prioritizeImprovements(missionId),
  };
}

export function prepareMissionReview(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    review: improvementService.review({ kind: "mission", missionId }),
    opportunities: improvementService.prioritizeImprovements(missionId),
    experiments: improvementService.findExperiments({ missionId }),
  };
}

export function prepareFounderReview() {
  return {
    product: "founder" as const,
    review: improvementService.review({ kind: "founder" }),
    recommendations: improvementService.recommendImprovements(),
    topImprovement: improvementService.topImprovement(),
  };
}

export function prepareProductReview(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    review: improvementService.review({ kind: "product", missionId }),
    opportunities: improvementService.sampleRepository().byCategory("products"),
    experiments: improvementService.findExperiments({ missionId }),
  };
}
