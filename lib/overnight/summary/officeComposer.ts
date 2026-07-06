import type {
  AutomationSummary,
  ExecutiveBrief,
  MarketingSummary,
  MissionSummary,
  MorningSummary,
  OpportunitySummary,
  PreparedOffice,
  PrioritizedItem,
  ProductSummary,
  QuestionSummary,
  ResearchSummary,
  RiskSummary,
} from "../types";
import { discoverOpportunities } from "@/lib/opportunities";
import { executiveQuestionService } from "@/lib/executiveQuestions";
import { getActiveMission, missionService } from "@/lib/founder/missions";
import type { MissionId } from "@/lib/founder/missions";

import { overnightSampleRepository } from "../repositories/sample";

const CYCLE_DATE = new Date().toISOString().slice(0, 10);

export function composeMorningSummary(): MorningSummary {
  return overnightSampleRepository.getLatestOffice().morning;
}

export function composeExecutiveBrief(
  recommendedMissionId: string,
  recommendedFirstAction: string,
): ExecutiveBrief {
  const sample = overnightSampleRepository.getLatestOffice().brief;
  return {
    ...sample,
    date: CYCLE_DATE,
    recommendedMissionId,
    recommendedFirstAction,
  };
}

export function composeMissionSummary(missionId?: string): MissionSummary {
  const sample = overnightSampleRepository.getLatestOffice().missionFocus;
  const id = (missionId ?? getActiveMission().id) as MissionId;
  const mission = missionService.getMission(id) ?? getActiveMission();
  return {
    missionId: mission.id,
    title: mission.name,
    status: mission.status,
    headline: mission.purpose,
    progressNote: sample.progressNote,
    isRecommended: mission.id === sample.missionId,
  };
}

export function composeQuestionSummaries(): QuestionSummary[] {
  return executiveQuestionService
    .listRecommendedQuestions({ product: "founder", timeHorizon: "today" })
    .slice(0, 3)
    .map((q, i) => ({
      id: q.id,
      question: q.title,
      category: q.category,
      priority: 92 - i * 4,
      missionId: q.relatedMissionIds[0],
    }));
}

export function composeOpportunitySummaries(): OpportunitySummary[] {
  return discoverOpportunities({ missionId: "listening-rooms" })
    .slice(0, 4)
    .map((o) => ({
      id: o.id,
      title: o.title,
      headline: o.summary,
      missionIds: o.missionIds,
      compositeScore: o.score.composite,
    }));
}

export function composeRiskSummaries(): RiskSummary[] {
  return overnightSampleRepository.getLatestOffice().risks;
}

export function composeResearchSummaries(): ResearchSummary[] {
  return overnightSampleRepository.getLatestOffice().research;
}

export function composeMarketingSummaries(): MarketingSummary[] {
  return overnightSampleRepository.getLatestOffice().marketing;
}

export function composeProductSummaries(): ProductSummary[] {
  return overnightSampleRepository.getLatestOffice().products;
}

export function composeAutomationSummaries(): AutomationSummary[] {
  return overnightSampleRepository.getLatestOffice().automations;
}

export function composePreparedOffice(prioritized: PrioritizedItem[]): PreparedOffice {
  const sample = overnightSampleRepository.getLatestOffice();
  const top = prioritized[0];
  const recommendedMissionId = top?.missionIds[0] ?? sample.recommendedMission.missionId;
  const recommendedFirstAction =
    top?.suggestedAction ?? sample.recommendedFirstAction;

  return {
    date: CYCLE_DATE,
    morning: composeMorningSummary(),
    brief: composeExecutiveBrief(recommendedMissionId, recommendedFirstAction),
    missionFocus: composeMissionSummary(recommendedMissionId),
    todaysQuestions: composeQuestionSummaries(),
    opportunities: composeOpportunitySummaries(),
    risks: composeRiskSummaries(),
    research: composeResearchSummaries(),
    marketing: composeMarketingSummaries(),
    products: composeProductSummaries(),
    automations: composeAutomationSummaries(),
    recommendations: prioritized.length > 0 ? prioritized : sample.recommendations,
    recommendedMission: composeMissionSummary(recommendedMissionId),
    recommendedFirstAction,
  };
}
