import type { ExecutiveExperienceId, ExperienceContext, ExperienceIntent } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { detectExperienceIntent, resolveExperienceId } from "./intentDetection";
import { composeExperienceContext } from "../contexts";

export function routeExperience(
  intent: ExperienceIntent,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  const experienceId = resolveExperienceId(intent);
  return composeExperienceContext({
    missionId,
    experienceId,
    intent,
    state: "arrival",
  });
}

export function routeExperienceFromPhrase(
  phrase: string,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return routeExperience(detectExperienceIntent(phrase), missionId);
}

export function suggestExperience(
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
): ExecutiveExperienceId {
  const context: ExperienceContext = { missionId };
  void context;
  return "think_with_me";
}
