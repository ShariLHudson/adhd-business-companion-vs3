/**
 * Founder bridge — Executive Memory Theater™
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  composeMemoryReplaySession,
  composeMemoryReplayById,
  executiveMemoryTheaterService,
} from "@/lib/executiveMemoryTheater";
import { getMemoryTheaterCenterBootstrap } from "@/lib/founder/memoryTheaterCenter";

export function prepareFounderExecutiveMemoryTheater(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    bootstrap: getMemoryTheaterCenterBootstrap(),
    principle: executiveMemoryTheaterService.sampleRepository().principle(),
  };
}

export function prepareFounderMemoryReplaySession(
  query: string,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    session: composeMemoryReplaySession(query),
    principle: executiveMemoryTheaterService.sampleRepository().principle(),
  };
}

export function prepareFounderMemoryReplayById(
  replayId: string,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    session: composeMemoryReplayById(replayId),
    principle: executiveMemoryTheaterService.sampleRepository().principle(),
  };
}
