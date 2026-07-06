import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { missionService } from "@/lib/founder/missions";
import type { MissionId } from "@/lib/founder/missions/types";
import { getExecutiveBrief } from "@/lib/founder/executiveBrief";
import { executiveDecisionService } from "@/lib/executiveDecision";
import { opportunitySampleRepository } from "@/lib/opportunities/repositories/sample";
import { executiveOrchestratorService } from "@/lib/orchestrator";
import type { ExecutiveDesk } from "../types";

export function composeExecutiveDesk(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): ExecutiveDesk {
  const mission = missionService.getMission(missionId) ?? missionService.getActiveMission();
  const progress = missionService.getMissionProgress(mission.id);
  const brief = getExecutiveBrief({ missionId });

  const decisions = executiveDecisionService
    .sampleRepository()
    .forMission(missionId)
    .filter((d) => d.recommendation);
  const topDecision = decisions.find((d) => d.id === "ed-voice-companion") ?? decisions[0];
  const rec = topDecision ? executiveDecisionService.recommendOption(topDecision.id) : null;

  const opportunities = [...opportunitySampleRepository.all()]
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, 3)
    .map((o) => ({
      id: o.id,
      title: o.name,
      summary: o.recommendationRationale || o.executiveSummary,
    }));

  const waitingOn = executiveOrchestratorService
    .list()
    .filter((i) => i.missionId === missionId && i.status === "waiting_on")
    .map((i) => ({
      id: i.id,
      label: i.title,
      waitingOn: i.founderPromise?.requiresApproval.join(", ") ?? "Approval",
    }));

  const initiative =
    executiveOrchestratorService.sampleRepository().forMission(missionId)[0] ??
    executiveOrchestratorService.get("init-listening-rooms");
  const nextAction = {
    id: initiative?.id ?? "next-review-brief",
    label: rec?.whatToPrepare?.[0] ?? "Review today's Executive Brief",
    reason: "One clear next step — everything else waits.",
  };

  return {
    todaysMission: {
      id: mission.id,
      name: mission.name,
      summary: mission.purpose,
      progress: progress?.overall ?? mission.progress,
    },
    executiveBriefHeadline: brief.summary.headline,
    recommendedDecision: topDecision
      ? {
          id: topDecision.id,
          title: topDecision.title,
          headline: rec?.headline ?? topDecision.question,
          why: rec?.why ?? topDecision.whyItMatters,
        }
      : null,
    topOpportunities: opportunities,
    waitingOnOthers: waitingOn,
    recommendedNextAction: nextAction,
  };
}
