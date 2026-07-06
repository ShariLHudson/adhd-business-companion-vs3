import type { CalmFocusScore } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { composeFocus } from "@/lib/founder/commandCenter";
import { composeAttention, composeExecutiveState } from "@/lib/executiveOS";
import { missionService } from "@/lib/founder/missions";
import { executiveDecisionService } from "@/lib/executiveDecision";

export function computeFocusScore(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): CalmFocusScore {
  const focus = composeFocus(missionId).focus;
  const attention = composeAttention(missionId);
  const exec = composeExecutiveState({ missionId });
  const openMissions = missionService.listMissions().filter((m) => m.status === "active").length;
  const openDecisions = executiveDecisionService.list().length;

  const recommendationOverload = attention.supporting.length + attention.library.length;
  const missionOverload = openMissions > 2 ? 70 : openMissions > 1 ? 40 : 10;
  const researchOverload = exec.health.dimensions.find((d) => d.dimension === "research")?.score ?? 50;
  const decisionFatigue = Math.min(100, openDecisions * 12);
  const contextSwitching = focus.contextSwitchRisk;
  const currentOverload = Math.round(
    (100 - focus.score + recommendationOverload * 3 + missionOverload) / 3,
  );

  const score = Math.max(0, Math.min(100, focus.score - Math.round(recommendationOverload * 2)));
  const label =
    score >= 80 ? "calm" : score >= 65 ? "steady" : score >= 45 ? "strained" : "overloaded";

  return {
    score,
    label,
    currentOverload,
    decisionFatigue,
    contextSwitching,
    researchOverload: 100 - researchOverload,
    recommendationOverload,
    missionOverload,
    simplification: focus.simplification,
  };
}
