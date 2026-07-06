import type { ExecutiveExperience, ExperienceContext } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { EXPERIENCE_DEFINITIONS } from "../sample";
import { composeBuildSomething } from "./buildSomething";
import { composeThinkWithMe } from "./thinkWithMe";
import { composeHelpMeDecide } from "./helpMeDecide";
import { composeResearchForMe } from "./researchForMe";
import { composeLaunchSomething } from "./launchSomething";
import { composeReviewMyCompany } from "./reviewMyCompany";
import { composeTeachMe } from "./teachMe";
import { composeQuietWork } from "./quietWork";

export type ComposedExperienceContext = {
  experience: ExecutiveExperience;
  composed: Record<string, unknown>;
};

function baseExperience(
  experienceId: ExecutiveExperience["id"],
  state: ExecutiveExperience["state"],
  recommendations: ExecutiveExperience["recommendations"],
  composedFrom: string[],
): ExecutiveExperience {
  const seed = EXPERIENCE_DEFINITIONS[experienceId];
  return { ...seed, recommendations, composedFrom, state };
}

export function composeExperienceContext(context: ExperienceContext): ComposedExperienceContext {
  const experienceId = context.experienceId ?? "think_with_me";
  const missionId = context.missionId ?? ("listening-rooms" as MissionId);
  const state = context.state ?? "arrival";

  switch (experienceId) {
    case "build_something":
      return composeBuildSomething(missionId, state, baseExperience);
    case "think_with_me":
      return composeThinkWithMe(missionId, state, baseExperience);
    case "help_me_decide":
      return composeHelpMeDecide(missionId, state, baseExperience);
    case "research_for_me":
      return composeResearchForMe(missionId, state, baseExperience);
    case "launch_something":
      return composeLaunchSomething(missionId, state, baseExperience);
    case "review_my_company":
      return composeReviewMyCompany(missionId, state, baseExperience);
    case "teach_me":
      return composeTeachMe(missionId, state, baseExperience);
    case "quiet_work":
      return composeQuietWork(missionId, state, baseExperience);
    default:
      return composeThinkWithMe(missionId, state, baseExperience);
  }
}
