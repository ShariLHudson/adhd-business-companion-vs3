import type { ExecutiveExperience, ExperienceRecommendation } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { getFounderDigitalTwinBundle } from "@/lib/founder/services/founderProfileBridge";
import { getFounderInstitutionalMemoryBundle } from "@/lib/founder/services/institutionalMemoryBridge";
import { improvementService } from "@/lib/improvement";
import type { ComposedExperienceContext } from "./index";

type BaseBuilder = (
  id: ExecutiveExperience["id"],
  state: ExecutiveExperience["state"],
  recommendations: ExperienceRecommendation[],
  composedFrom: string[],
) => ExecutiveExperience;

export function composeTeachMe(
  missionId: MissionId,
  state: ExecutiveExperience["state"],
  base: BaseBuilder,
): ComposedExperienceContext {
  const profile = getFounderDigitalTwinBundle(missionId);
  const memory = getFounderInstitutionalMemoryBundle(missionId);
  const lesson = memory.lessons[0];
  const improvement = improvementService.prioritizeImprovements(missionId)[0];

  const recommendations: ExperienceRecommendation[] = [];
  if (lesson) {
    recommendations.push({
      id: lesson.id,
      title: lesson.title,
      summary: lesson.description,
      tier: "primary",
    });
  } else if (profile.topRecommendation) {
    recommendations.push({
      id: profile.topRecommendation.id,
      title: profile.topRecommendation.noticedPhrase,
      summary: profile.topRecommendation.suggestion,
      tier: "primary",
    });
  }

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
      "teach_me",
      state,
      recommendations,
      ["founder_profile", "institutional_memory", "improvement"],
    ),
    composed: {
      patterns: profile.patterns.slice(0, 3),
      lessons: memory.lessons.slice(0, 3),
      strengths: profile.strengths.slice(0, 2),
    },
  };
}
