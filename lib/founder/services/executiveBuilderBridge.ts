/**
 * Founder bridge — Executive Builder
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  composeBuildSession,
  composeBuildFromBlueprintId,
  executiveBuilderService,
  type BuildModeId,
} from "@/lib/executiveBuilder";
import { getBuilderCenterBootstrap } from "@/lib/founder/builderCenter";

export function prepareFounderExecutiveBuilder(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    product: "founder" as const,
    missionId,
    bootstrap: getBuilderCenterBootstrap(),
    principle: executiveBuilderService.sampleRepository().principle(),
  };
}

export function prepareFounderBuildSession(
  query: string,
  buildMode: BuildModeId = "standard-build",
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    session: composeBuildSession(query, buildMode),
    principle: executiveBuilderService.sampleRepository().principle(),
  };
}

export function prepareFounderBuildFromBlueprint(
  blueprintId: string,
  buildMode: BuildModeId = "standard-build",
) {
  return {
    product: "founder" as const,
    session: composeBuildFromBlueprintId(blueprintId, buildMode),
    principle: executiveBuilderService.sampleRepository().principle(),
  };
}
