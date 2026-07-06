import type { ExecutiveExperience, ExperienceRecommendation } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { applyRuleOfOne } from "@/lib/calmIntelligence";
import { prepareMissionDecision } from "@/lib/founder/services/executiveDecisionBridge";
import type { ComposedExperienceContext } from "./index";

type BaseBuilder = (
  id: ExecutiveExperience["id"],
  state: ExecutiveExperience["state"],
  recommendations: ExperienceRecommendation[],
  composedFrom: string[],
) => ExecutiveExperience;

export function composeHelpMeDecide(
  missionId: MissionId,
  state: ExecutiveExperience["state"],
  base: BaseBuilder,
): ComposedExperienceContext {
  const decisionBundle = prepareMissionDecision(missionId);
  const ruleOfOne = applyRuleOfOne(missionId);

  const recommendations: ExperienceRecommendation[] = [];
  if (decisionBundle?.recommendation) {
    recommendations.push({
      id: decisionBundle.recommendation.recommendedOptionId,
      title: decisionBundle.recommendation.headline,
      summary: decisionBundle.recommendation.why,
      tier: "primary",
    });
  } else if (ruleOfOne.decision) {
    recommendations.push({
      id: ruleOfOne.decision.id,
      title: ruleOfOne.decision.title,
      summary: "One decision on your desk today.",
      tier: "primary",
    });
  }

  return {
    experience: base(
      "help_me_decide",
      state,
      recommendations,
      ["executive_decision", "calm_intelligence"],
    ),
    composed: {
      decision: decisionBundle,
      ruleOfOne: ruleOfOne.decision,
      comparison: decisionBundle?.comparison ?? null,
      guidance: decisionBundle?.guidance ?? null,
    },
  };
}
