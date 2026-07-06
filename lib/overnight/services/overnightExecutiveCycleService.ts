import type {
  ExecutiveBrief,
  MorningSummary,
  OvernightCycleFilter,
  OvernightCycleHistoryRecord,
  OvernightCycleRun,
  PreparedOffice,
  PrioritizedItem,
} from "../types";
import { runOvernightCycle, runOvernightCycleSample } from "../orchestrator/overnightOrchestrator";
import { overnightSampleRepository } from "../repositories/sample";
import {
  getCycleHistory,
  getLatestCycleHistory,
  listCycleHistory,
} from "../history/cycleHistory";
import {
  executiveDecisionsNeedingAttention,
  recommendationsByKind,
  topRecommendations,
} from "../recommendations/recommendationComposer";
import {
  composeAutomationSummaries,
  composeExecutiveBrief,
  composeMarketingSummaries,
  composeMissionSummary,
  composeMorningSummary,
  composeOpportunitySummaries,
  composePreparedOffice,
  composeProductSummaries,
  composeQuestionSummaries,
  composeResearchSummaries,
  composeRiskSummaries,
} from "../summary/officeComposer";
import { listOvernightPhases } from "../timeline/cycleTimeline";

export class OvernightExecutiveCycleService {
  runCycle(): OvernightCycleRun {
    return runOvernightCycle();
  }

  runCycleSample(): OvernightCycleRun {
    return runOvernightCycleSample();
  }

  listPhases() {
    return listOvernightPhases();
  }

  prepareOffice(filter?: OvernightCycleFilter): PreparedOffice {
    if (filter?.date) {
      return overnightSampleRepository.getPreparedOffice(filter.date);
    }
    const run = this.runCycle();
    if (filter?.missionId) {
      return {
        ...run.preparedOffice,
        missionFocus: composeMissionSummary(filter.missionId),
        recommendedMission: composeMissionSummary(filter.missionId),
      };
    }
    return run.preparedOffice;
  }

  prepareMorningBrief(): ExecutiveBrief {
    const office = this.prepareOffice();
    return office.brief;
  }

  prepareMorningSummary(): MorningSummary {
    return composeMorningSummary();
  }

  prepareMission(missionId?: string) {
    return composeMissionSummary(missionId);
  }

  prepareExecutiveQuestions() {
    return composeQuestionSummaries();
  }

  prepareRecommendations(limit = 5): PrioritizedItem[] {
    const office = this.prepareOffice();
    return topRecommendations(office.recommendations, limit);
  }

  prepareResearchSummary() {
    return composeResearchSummaries();
  }

  prepareOpportunities() {
    return composeOpportunitySummaries();
  }

  prepareRisks() {
    return composeRiskSummaries();
  }

  prepareMarketingSummary() {
    return composeMarketingSummaries();
  }

  prepareProductSummary() {
    return composeProductSummaries();
  }

  prepareAutomationSummary() {
    return composeAutomationSummaries();
  }

  listHistory(): OvernightCycleHistoryRecord[] {
    return listCycleHistory();
  }

  getHistory(date: string) {
    return getCycleHistory(date);
  }

  getLatestHistory() {
    return getLatestCycleHistory();
  }

  recommendationsByKind(kind: PrioritizedItem["kind"]) {
    const office = this.prepareOffice();
    return recommendationsByKind(office.recommendations, kind);
  }

  executiveDecisionsNeedingAttention() {
    const office = this.prepareOffice();
    return executiveDecisionsNeedingAttention(office.recommendations);
  }
}

export const overnightExecutiveCycleService = new OvernightExecutiveCycleService();

export function prepareOffice(filter?: OvernightCycleFilter): PreparedOffice {
  return overnightExecutiveCycleService.prepareOffice(filter);
}

export function runOvernightExecutiveCycle(): OvernightCycleRun {
  return overnightExecutiveCycleService.runCycle();
}

export function prepareMorningBrief(): ExecutiveBrief {
  return overnightExecutiveCycleService.prepareMorningBrief();
}

export function prepareMorningSummary(): MorningSummary {
  return overnightExecutiveCycleService.prepareMorningSummary();
}

export function prepareMission(missionId?: string) {
  return overnightExecutiveCycleService.prepareMission(missionId);
}

export function prepareExecutiveQuestions() {
  return overnightExecutiveCycleService.prepareExecutiveQuestions();
}

export function prepareRecommendations(limit?: number) {
  return overnightExecutiveCycleService.prepareRecommendations(limit);
}

export function prepareResearchSummary() {
  return overnightExecutiveCycleService.prepareResearchSummary();
}

export { composePreparedOffice, composeExecutiveBrief };
