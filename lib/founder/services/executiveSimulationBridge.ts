/**
 * Founder bridge — Executive Simulation Studio
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  composeSimulationSession,
  composeSimulationById,
  executiveSimulationService,
} from "@/lib/executiveSimulation";
import { getSimulationCenterBootstrap } from "@/lib/founder/simulationCenter";

export function prepareFounderExecutiveSimulation(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    bootstrap: getSimulationCenterBootstrap(),
    principle: executiveSimulationService.sampleRepository().principle(),
  };
}

export function prepareFounderSimulationSession(
  query: string,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    session: composeSimulationSession(query),
    principle: executiveSimulationService.sampleRepository().principle(),
  };
}

export function prepareFounderSimulationById(
  simulationId: string,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    session: composeSimulationById(simulationId),
    principle: executiveSimulationService.sampleRepository().principle(),
  };
}
