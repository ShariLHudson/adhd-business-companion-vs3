import type { ExecutiveExperience, ExperienceRecommendation } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { composeCalmIntelligence } from "@/lib/calmIntelligence";
import { composeFocus } from "@/lib/founder/commandCenter";
import type { ComposedExperienceContext } from "./index";

type BaseBuilder = (
  id: ExecutiveExperience["id"],
  state: ExecutiveExperience["state"],
  recommendations: ExperienceRecommendation[],
  composedFrom: string[],
) => ExecutiveExperience;

export function composeQuietWork(
  missionId: MissionId,
  state: ExecutiveExperience["state"],
  base: BaseBuilder,
): ComposedExperienceContext {
  const calm = composeCalmIntelligence({ missionId });
  const focus = composeFocus(missionId);

  const recommendations: ExperienceRecommendation[] = [
    {
      id: calm.ruleOfOne.nextStep?.id ?? "quiet-next",
      title: calm.ruleOfOne.nextStep?.label ?? "One quiet step",
      summary: calm.presence.subhead,
      tier: "primary",
    },
  ];

  return {
    experience: base(
      "quiet_work",
      state,
      recommendations,
      ["calm_intelligence", "command_center"],
    ),
    composed: {
      focus: focus.focus,
      hiddenCount: calm.hiddenCount,
      simplification: calm.simplification.slice(0, 2),
      presence: calm.presence,
    },
  };
}
