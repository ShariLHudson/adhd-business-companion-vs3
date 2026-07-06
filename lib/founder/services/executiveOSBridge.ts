/**
 * Optional Founder bridge — Executive Operating System without UI wiring.
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { executiveOSService } from "@/lib/executiveOS";
import { getFounderCommandCenterBundle } from "./commandCenterBridge";

export function prepareExecutiveOperatingState(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    executive: executiveOSService.composeExecutiveState({ missionId }),
    company: executiveOSService.composeCompanyState({ missionId }),
    architectureOnly: true as const,
  };
}

export function prepareOffice(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  const commandCenter = getFounderCommandCenterBundle(missionId);
  const os = executiveOSService.composeExecutiveState({ missionId });

  return {
    product: "founder" as const,
    missionId,
    commandCenter: commandCenter.center,
    attention: os.attention,
    health: os.health,
    primaryRecommendation: os.attention.primary,
    architectureOnly: true as const,
  };
}

export function prepareToday(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  const os = executiveOSService.composeExecutiveState({ missionId });
  return {
    product: "founder" as const,
    missionId,
    context: os.context,
    execution: os.execution,
    leverage: os.leverage,
    recommendations: os.recommendations,
    commandCenterToday: getFounderCommandCenterBundle(missionId).center.today,
  };
}

export function prepareMission(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    mission: executiveOSService.composeExecutiveState({ missionId }).mission,
    attention: executiveOSService.composeAttention(missionId),
    leverage: executiveOSService.composeLeverage(missionId),
  };
}

export function prepareCompany(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return executiveOSService.composeCompanyState({ missionId });
}
