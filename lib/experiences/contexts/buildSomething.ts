import type { ExecutiveExperience, ExperienceRecommendation } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { composeExecutiveDesk } from "@/lib/founder/commandCenter";
import { improvementService } from "@/lib/improvement";
import { prepareMissionExecution } from "@/lib/founder/services/executiveOrchestratorBridge";
import type { ComposedExperienceContext } from "./index";

type BaseBuilder = (
  id: ExecutiveExperience["id"],
  state: ExecutiveExperience["state"],
  recommendations: ExperienceRecommendation[],
  composedFrom: string[],
) => ExecutiveExperience;

export function composeBuildSomething(
  missionId: MissionId,
  state: ExecutiveExperience["state"],
  base: BaseBuilder,
): ComposedExperienceContext {
  const desk = composeExecutiveDesk(missionId);
  const execution = prepareMissionExecution(missionId);
  const improvement = improvementService.prioritizeImprovements(missionId)[0];

  const recommendations: ExperienceRecommendation[] = [
    {
      id: desk.recommendedNextAction.id,
      title: desk.recommendedNextAction.label,
      summary: "Primary creation step from your executive desk.",
      tier: "primary",
    },
  ];

  if (improvement) {
    recommendations.push({
      id: improvement.id,
      title: improvement.title,
      summary: improvement.summary,
      tier: "supporting",
    });
  }

  return {
    experience: base(
      "build_something",
      state,
      recommendations,
      ["command_center", "orchestrator", "improvement"],
    ),
    composed: {
      desk: {
        nextAction: desk.recommendedNextAction,
        opportunities: desk.topOpportunities.slice(0, 3),
      },
      execution,
      improvement: improvement ?? null,
    },
  };
}
