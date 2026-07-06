import type { CompanyContextMode, OperatingContext } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { missionService } from "@/lib/founder/missions";
import { executiveOrchestratorService } from "@/lib/orchestrator";

const MODE_LABELS: Record<CompanyContextMode, string> = {
  building: "Building",
  launching: "Launching",
  researching: "Researching",
  hiring: "Hiring",
  writing: "Writing",
  planning: "Planning",
  growing: "Growing",
  recovering: "Recovering",
};

function inferMode(missionId: MissionId): CompanyContextMode {
  const mission = missionService.getMission(missionId);
  const initiatives = executiveOrchestratorService.sampleRepository().forMission(missionId);
  if (initiatives.some((i) => i.category === "launch")) return "launching";
  if (mission?.phase === "Discover" || mission?.phase === "Define") return "researching";
  if (mission?.phase === "Build") return "building";
  if (mission?.phase === "Launch") return "launching";
  if (mission?.phase === "Grow") return "growing";
  if (mission?.phase === "Review") return "planning";
  return "building";
}

export function composeExecutiveContext(
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
  mode?: CompanyContextMode,
): OperatingContext {
  const resolved = mode ?? inferMode(missionId);
  const mission = missionService.getMission(missionId);

  return {
    missionId,
    mode: resolved,
    label: MODE_LABELS[resolved],
    rationale: mission
      ? `${mission.name} is in ${resolved} context — Founder adapts without changing rooms.`
      : `Company is in ${resolved} context.`,
  };
}
