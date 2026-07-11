/**
 * Founder bridge — Executive Command Center / Executive Headquarters
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  composeExecutiveCommandCenterView,
  composeExecutivePanelDetail,
  executiveCommandCenterService,
} from "@/lib/executiveCommandCenter";
import type { ExecutivePanelId } from "@/lib/executiveCommandCenter";
import { getCommandCenterHeadquartersBootstrap } from "@/lib/founder/executiveCommandCenterCenter";

export function prepareFounderExecutiveCommandCenter(
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    bootstrap: getCommandCenterHeadquartersBootstrap(),
    view: composeExecutiveCommandCenterView(),
    principle: executiveCommandCenterService.bootstrap().principle,
  };
}

export function prepareFounderExecutivePanelDetail(
  panelId: ExecutivePanelId,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    detail: composeExecutivePanelDetail(panelId),
    principle: executiveCommandCenterService.bootstrap().principle,
  };
}
