/**
 * Optional Founder bridge — Overnight Executive Cycle without UI wiring.
 */
import {
  overnightExecutiveCycleService,
  prepareOffice,
  type ExecutiveBrief,
  type MorningSummary,
  type PreparedOffice,
  type PrioritizedItem,
} from "@/lib/overnight";

import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";

export function prepareFounderOffice(missionId?: string): PreparedOffice {
  return prepareOffice(
    missionId ? { missionId } : undefined,
  );
}

export function prepareFounderMission(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  return overnightExecutiveCycleService.prepareMission(missionId);
}

export function prepareFounderMorningBrief(): ExecutiveBrief {
  return overnightExecutiveCycleService.prepareMorningBrief();
}

export function prepareFounderMorningSummary(): MorningSummary {
  return overnightExecutiveCycleService.prepareMorningSummary();
}

export function prepareFounderExecutiveQuestions() {
  return overnightExecutiveCycleService.prepareExecutiveQuestions();
}

export function prepareFounderRecommendations(limit = 5): PrioritizedItem[] {
  return overnightExecutiveCycleService.prepareRecommendations(limit);
}

export function prepareFounderResearchSummary() {
  return overnightExecutiveCycleService.prepareResearchSummary();
}

export function prepareFounderOvernightBundle(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    office: prepareFounderOffice(missionId),
    brief: prepareFounderMorningBrief(),
    morning: prepareFounderMorningSummary(),
    mission: prepareFounderMission(missionId),
    questions: prepareFounderExecutiveQuestions(),
    recommendations: prepareFounderRecommendations(),
    research: prepareFounderResearchSummary(),
    history: overnightExecutiveCycleService.getLatestHistory(),
  };
}
