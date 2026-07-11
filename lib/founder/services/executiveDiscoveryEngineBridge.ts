/**
 * Founder bridge — Executive Discovery Engine
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  composeDailyDiscoveryBrief,
  composeDiscoveryFindingDetail,
  composeMonthlyExecutiveDiscoveryReport,
  composeWeeklyDiscoveryReport,
  executiveDiscoveryEngineService,
} from "@/lib/executiveDiscoveryEngine";
import { getDiscoveryEngineCenterBootstrap } from "@/lib/founder/discoveryEngineCenter";

export function prepareFounderExecutiveDiscoveryEngine(
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    bootstrap: getDiscoveryEngineCenterBootstrap(),
    principle: executiveDiscoveryEngineService.sampleRepository().principle(),
  };
}

export function prepareFounderDailyDiscoveryBrief(
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    brief: composeDailyDiscoveryBrief(),
    principle: executiveDiscoveryEngineService.sampleRepository().principle(),
  };
}

export function prepareFounderWeeklyDiscoveryReport(
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    report: composeWeeklyDiscoveryReport(),
    principle: executiveDiscoveryEngineService.sampleRepository().principle(),
  };
}

export function prepareFounderMonthlyDiscoveryReport(
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    report: composeMonthlyExecutiveDiscoveryReport(),
    principle: executiveDiscoveryEngineService.sampleRepository().principle(),
  };
}

export function prepareFounderDiscoveryFindingDetail(
  findingId: string,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    detail: composeDiscoveryFindingDetail(findingId),
    principle: executiveDiscoveryEngineService.sampleRepository().principle(),
  };
}
