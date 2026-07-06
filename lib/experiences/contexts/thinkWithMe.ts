import type { ExecutiveExperience, ExperienceRecommendation } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { composeToday } from "@/lib/founder/commandCenter";
import { prepareFounderExecutiveQuestions } from "@/lib/founder/services/overnightExecutiveCycleBridge";
import { getFounderDigitalTwinBundle } from "@/lib/founder/services/founderProfileBridge";
import type { ComposedExperienceContext } from "./index";

type BaseBuilder = (
  id: ExecutiveExperience["id"],
  state: ExecutiveExperience["state"],
  recommendations: ExperienceRecommendation[],
  composedFrom: string[],
) => ExecutiveExperience;

export function composeThinkWithMe(
  missionId: MissionId,
  state: ExecutiveExperience["state"],
  base: BaseBuilder,
): ComposedExperienceContext {
  const today = composeToday({ missionId });
  const questions = prepareFounderExecutiveQuestions();
  const profile = getFounderDigitalTwinBundle(missionId);

  const primaryQuestion = questions[0];
  const recommendations: ExperienceRecommendation[] = [
    {
      id: primaryQuestion?.id ?? "think-primary",
      title: primaryQuestion?.question ?? "What is on your mind?",
      summary: primaryQuestion?.category ?? "Start with one thread.",
      tier: "primary",
    },
  ];

  if (profile.topRecommendation) {
    recommendations.push({
      id: profile.topRecommendation.id,
      title: profile.topRecommendation.noticedPhrase,
      summary: profile.topRecommendation.suggestion,
      tier: "supporting",
    });
  }

  return {
    experience: base(
      "think_with_me",
      state,
      recommendations,
      ["command_center", "overnight", "founder_profile"],
    ),
    composed: {
      morning: today.morning,
      questions: questions.slice(0, 3),
      profileHint: profile.topRecommendation,
    },
  };
}
