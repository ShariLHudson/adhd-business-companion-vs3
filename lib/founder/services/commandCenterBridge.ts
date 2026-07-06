/**
 * Optional Founder bridge — Executive Command Center without UI wiring.
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  composeAttention,
  composeCommandCenter,
  composeExecutiveDesk,
  composeFocus,
  composeLeverage,
  composeToday,
  composeExecutiveContexts,
} from "@/lib/founder/commandCenter";

export function getFounderCommandCenterBundle(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    center: composeCommandCenter({ missionId }),
    contexts: composeExecutiveContexts(missionId),
  };
}

export function prepareFounderExecutiveDesk(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    today: composeToday({ missionId }),
    desk: composeExecutiveDesk(missionId),
    focus: composeFocus(missionId),
    attention: composeAttention(missionId),
    leverage: composeLeverage(missionId),
  };
}
