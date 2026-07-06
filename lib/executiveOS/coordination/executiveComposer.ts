import type { ExecutiveState, ImprovementState } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID, missionService } from "@/lib/founder/missions";
import { executiveOrchestratorService } from "@/lib/orchestrator";
import { improvementService } from "@/lib/improvement";
import { composeExecutiveContext } from "../context/contextComposer";
import { composeOperatingHealth } from "../health/companyHealth";
import { composeLeverage } from "../priorities/leverageComposer";
import { composeAttention, toRecommendationState } from "../routing/attentionEngine";
import { composeExecutiveDesk } from "@/lib/founder/commandCenter";
import { currentOperatingStage, getCoordinatedSystems, getOperatingLoop } from "../repositories/sample";

function buildImprovementState(missionId: MissionId): ImprovementState {
  const top = improvementService.topImprovement(missionId);
  const experiments = improvementService.findExperiments({ missionId });
  return {
    topOpportunity: top?.title ?? null,
    experimentCount: experiments.length,
    reviewKind: "weekly",
  };
}

export function composeExecutiveState(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): ExecutiveState {
  const mission = missionService.getMission(missionId) ?? missionService.getActiveMission();
  const progress = missionService.getMissionProgress(mission.id);
  const initiatives = executiveOrchestratorService.sampleRepository().forMission(missionId);
  const awaitingApproval = initiatives.filter((i) => i.status === "awaiting_approval").length;
  const waitingOn = executiveOrchestratorService
    .list()
    .filter((i) => i.missionId === missionId && i.status === "waiting_on").length;

  const attention = composeAttention(missionId);
  const desk = composeExecutiveDesk(missionId);

  return {
    product: "founder",
    missionId,
    generatedAt: new Date().toISOString(),
    operatingLoop: getOperatingLoop(),
    currentStage: currentOperatingStage(progress?.overall ?? mission.progress, awaitingApproval),
    context: composeExecutiveContext(missionId),
    attention,
    recommendations: toRecommendationState(attention),
    execution: {
      activeInitiatives: initiatives.filter((i) =>
        ["orchestrating", "in_progress", "approved", "planned"].includes(i.status),
      ).length,
      awaitingApproval,
      waitingOnOthers: waitingOn,
      recommendedNextAction: desk.recommendedNextAction.label,
    },
    mission: {
      id: mission.id,
      name: mission.name,
      progress: progress?.overall ?? mission.progress,
      status: mission.status,
      health: (progress?.overall ?? mission.progress) >= 60 ? "steady" : "watch",
    },
    improvement: buildImprovementState(missionId),
    leverage: composeLeverage(missionId),
    health: composeOperatingHealth(missionId),
    coordinatedSystems: getCoordinatedSystems(),
  };
}
