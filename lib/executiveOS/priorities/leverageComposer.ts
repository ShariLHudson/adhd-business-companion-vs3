import type { ExecutiveLeverage } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { composeLeverage as composeDeskLeverage } from "@/lib/founder/commandCenter";
import { improvementService } from "@/lib/improvement";

export function composeLeverage(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): ExecutiveLeverage {
  const deskLeverage = composeDeskLeverage(missionId);
  const top = deskLeverage.items[0];
  const improvement = improvementService.topImprovement(missionId);
  const automationCount = improvementService
    .prioritizeImprovements(missionId)
    .filter((o) => o.suggestedAction === "automate").length;

  const founderTimeSaved = deskLeverage.items.reduce((s, i) => s + i.timeSavedHours, 0);

  return {
    founderTimeSavedHours: founderTimeSaved,
    researchTimeSavedHours: improvement?.roi.timeSavedHours ?? 2,
    automationOpportunities: automationCount,
    revenueLeverage: top?.revenueImpact ?? improvement?.expectedImpact ?? "Mission momentum",
    learningLeverage: improvement?.summary ?? "Institutional Memory compounds quietly.",
    strategicLeverage: improvement?.roi.strategicValue ?? 70,
    summary: deskLeverage.topRecommendation,
  };
}
