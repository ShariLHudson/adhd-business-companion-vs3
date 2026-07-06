import type { ExecutiveLeverage } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { executiveOrchestratorService } from "@/lib/orchestrator";
import { opportunitySampleRepository } from "@/lib/opportunities/repositories/sample";

export function composeLeverageItems(missionId: MissionId): ExecutiveLeverage[] {
  const items: ExecutiveLeverage[] = [];

  for (const initiative of executiveOrchestratorService.sampleRepository().forMission(missionId).slice(0, 3)) {
    const roi = executiveOrchestratorService.calculateROI(initiative.id);
    if (!roi) continue;
    items.push({
      itemId: initiative.id,
      title: initiative.title,
      timeSavedHours: roi.roi.founderTimeSavedHours,
      decisionsSaved: 1,
      researchAvoided: true,
      automationPotential: initiative.estimatedAutomationPotential,
      revenueImpact: initiative.estimatedRevenue,
      customerImpact: initiative.estimatedCustomerImpact,
      founderEffort: roi.roi.founderTimeRequiredHours > 8 ? "high" : roi.roi.founderTimeRequiredHours > 4 ? "medium" : "low",
      summary: roi.recommendation,
    });
  }

  const opps = [...opportunitySampleRepository.all()]
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, 2);
  for (const opp of opps) {
    items.push({
      itemId: opp.id,
      title: opp.name,
      timeSavedHours: 2,
      decisionsSaved: 0,
      researchAvoided: false,
      automationPotential: 40,
      revenueImpact: opp.estimatedRevenue,
      customerImpact: opp.soWhat.whyMembersShouldCare,
      founderEffort: "low",
      summary: opp.recommendationRationale || opp.executiveSummary,
    });
  }

  return items.sort((a, b) => b.timeSavedHours - a.timeSavedHours);
}

export function topLeverageRecommendation(items: ExecutiveLeverage[]): string {
  const top = items[0];
  if (!top) return "Protect focus — no high-leverage item identified yet.";
  return `${top.title}: ${top.summary}`;
}
