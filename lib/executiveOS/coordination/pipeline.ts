import type { MissionId } from "@/lib/founder/missions/types";
import { getFounderSparkOverview } from "@/lib/founder/services/sparkBridge";
import { getFounderExecutiveQuestionsBundle } from "@/lib/founder/services/executiveQuestionsBridge";
import { getExecutiveBrief } from "@/lib/founder/executiveBrief";
import { missionService } from "@/lib/founder/missions";
import { executiveOrchestratorService } from "@/lib/orchestrator";
import { getFounderInstitutionalMemoryBundle } from "@/lib/founder/services/institutionalMemoryBridge";
import { improvementService } from "@/lib/improvement";

/** Executive coordination pipeline — existing systems, one natural flow. */
export function composeCoordinationPipeline(missionId: MissionId) {
  return {
    missionId,
    research: { connected: true, note: "Research feeds SPARK via intelligence pipeline." },
    spark: getFounderSparkOverview(),
    questions: getFounderExecutiveQuestionsBundle({ product: "founder", missionId }),
    decisions: { available: true, note: "Executive Decision Lifecycle linked." },
    brief: getExecutiveBrief({ missionId }),
    mission: missionService.composeMission(missionId),
    orchestrator: executiveOrchestratorService.sampleRepository().forMission(missionId),
    memory: getFounderInstitutionalMemoryBundle(missionId),
    improvement: improvementService.prioritizeImprovements(missionId),
    flow: [
      "research",
      "spark",
      "questions",
      "decision_lifecycle",
      "executive_brief",
      "mission",
      "orchestrator",
      "institutional_memory",
      "continuous_improvement",
    ],
  };
}
