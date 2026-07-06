import type { ExecutiveExperience, ExperienceRecommendation } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { composeCompanyState } from "@/lib/executiveOS";
import { composeLeverage } from "@/lib/founder/commandCenter";
import type { ComposedExperienceContext } from "./index";

type BaseBuilder = (
  id: ExecutiveExperience["id"],
  state: ExecutiveExperience["state"],
  recommendations: ExperienceRecommendation[],
  composedFrom: string[],
) => ExecutiveExperience;

export function composeReviewMyCompany(
  missionId: MissionId,
  state: ExecutiveExperience["state"],
  base: BaseBuilder,
): ComposedExperienceContext {
  const company = composeCompanyState({ missionId });
  const leverage = composeLeverage(missionId);

  const primary = company.primaryRecommendation;
  const recommendations: ExperienceRecommendation[] = primary
    ? [
        {
          id: primary.id,
          title: primary.title,
          summary: primary.summary,
          tier: "primary",
        },
      ]
    : [];

  for (const supporting of company.health.departments.slice(0, 2)) {
    recommendations.push({
      id: supporting.id,
      title: supporting.label,
      summary: supporting.summary,
      tier: "supporting",
    });
  }

  return {
    experience: base(
      "review_my_company",
      state,
      recommendations,
      ["executive_os", "command_center"],
    ),
    composed: {
      company,
      leverage,
      missionCount: company.missions.length,
      healthLabel: company.health.overall,
    },
  };
}
