import type { RuleOfOne } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID, missionService } from "@/lib/founder/missions";
import { composeExecutiveDesk } from "@/lib/founder/commandCenter";
import { composeAttention } from "@/lib/executiveOS";
import { RULE_OF_ONE_PRINCIPLE } from "../sample";

export function applyRuleOfOne(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): RuleOfOne {
  const mission = missionService.getMission(missionId) ?? missionService.getActiveMission();
  const desk = composeExecutiveDesk(missionId);
  const attention = composeAttention(missionId);

  return {
    mission: { id: mission.id, name: mission.name },
    recommendation: attention.primary
      ? { id: attention.primary.id, title: attention.primary.title, summary: attention.primary.summary }
      : null,
    decision: desk.recommendedDecision
      ? { id: desk.recommendedDecision.id, title: desk.recommendedDecision.headline }
      : null,
    nextStep: {
      id: desk.recommendedNextAction.id,
      label: desk.recommendedNextAction.label,
    },
  };
}

export { RULE_OF_ONE_PRINCIPLE };
