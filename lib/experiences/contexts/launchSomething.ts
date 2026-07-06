import type { ExecutiveExperience, ExperienceRecommendation } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { prepareLaunch } from "@/lib/founder/services/executiveOrchestratorBridge";
import { missionService } from "@/lib/founder/missions";
import type { ComposedExperienceContext } from "./index";

type BaseBuilder = (
  id: ExecutiveExperience["id"],
  state: ExecutiveExperience["state"],
  recommendations: ExperienceRecommendation[],
  composedFrom: string[],
) => ExecutiveExperience;

export function composeLaunchSomething(
  missionId: MissionId,
  state: ExecutiveExperience["state"],
  base: BaseBuilder,
): ComposedExperienceContext {
  const launch = prepareLaunch(missionId);
  const mission = missionService.getMission(missionId);

  const recommendations: ExperienceRecommendation[] = [];
  if (launch?.initiative) {
    recommendations.push({
      id: launch.initiative.id,
      title: launch.initiative.title,
      summary: launch.initiative.purpose,
      tier: "primary",
    });
  } else if (mission) {
    recommendations.push({
      id: mission.id,
      title: `Launch ${mission.name}`,
      summary: mission.purpose ?? "Confirm launch scope and approval gates.",
      tier: "primary",
    });
  }

  return {
    experience: base(
      "launch_something",
      state,
      recommendations,
      ["orchestrator", "missions"],
    ),
    composed: {
      launch,
      mission,
      checklist: launch?.checklist ?? null,
      approval: launch?.approval ?? null,
    },
  };
}
