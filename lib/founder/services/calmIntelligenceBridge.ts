/**
 * Optional Founder bridge — Calm Intelligence without UI wiring.
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { calmIntelligenceService, composeCalmIntelligence, filterForToday } from "@/lib/calmIntelligence";
import { getFounderCommandCenterBundle } from "./commandCenterBridge";

export function prepareCalmOffice(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  const calm = composeCalmIntelligence({ missionId });
  const commandCenter = getFounderCommandCenterBundle(missionId);

  return {
    product: "founder" as const,
    missionId,
    principle: calm.principle,
    presence: calm.presence,
    ruleOfOne: calm.ruleOfOne,
    focus: calm.focus,
    hiddenCount: calm.hiddenCount,
    commandCenter: commandCenter.center,
    architectureOnly: true as const,
  };
}

export function prepareCalmToday(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  const calm = composeCalmIntelligence({ missionId });

  return {
    product: "founder" as const,
    missionId,
    presence: calm.presence,
    recommendations: calm.recommendations,
    waiting: calm.waiting,
    simplification: calm.simplification,
    todayFiltered: filterForToday(missionId),
    architectureOnly: true as const,
  };
}

export function prepareCalmFocus(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  const calm = calmIntelligenceService.compose({ missionId });
  return {
    product: "founder" as const,
    missionId,
    focus: calm.focus,
    interruptions: calm.interruptions,
    risks: calm.risks,
    architectureOnly: true as const,
  };
}
