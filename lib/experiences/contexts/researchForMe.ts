import type { ExecutiveExperience, ExperienceRecommendation } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { prepareFounderResearchSummary } from "@/lib/founder/services/overnightExecutiveCycleBridge";
import { prepareFounderExecutiveBrief } from "@/lib/founder/services/executiveBriefBridge";
import type { ComposedExperienceContext } from "./index";

type BaseBuilder = (
  id: ExecutiveExperience["id"],
  state: ExecutiveExperience["state"],
  recommendations: ExperienceRecommendation[],
  composedFrom: string[],
) => ExecutiveExperience;

export function composeResearchForMe(
  missionId: MissionId,
  state: ExecutiveExperience["state"],
  base: BaseBuilder,
): ComposedExperienceContext {
  const research = prepareFounderResearchSummary();
  const brief = prepareFounderExecutiveBrief(missionId);

  const findings = research.filter((r) => r.worthReading).slice(0, 5);
  const recommendations: ExperienceRecommendation[] = findings.slice(0, 3).map((finding, index) => ({
    id: finding.id,
    title: finding.title,
    summary: finding.headline,
    tier: index === 0 ? "primary" : "supporting",
  }));

  if (recommendations.length === 0 && brief.opportunities[0]) {
    recommendations.push({
      id: brief.opportunities[0].id,
      title: brief.opportunities[0].title,
      summary: brief.opportunities[0].simpleExplanation,
      tier: "primary",
    });
  }

  return {
    experience: base(
      "research_for_me",
      state,
      recommendations,
      ["overnight", "executive_brief"],
    ),
    composed: {
      research: findings,
      briefHeadline: brief.summary.headline,
      findingCount: findings.length,
    },
  };
}
