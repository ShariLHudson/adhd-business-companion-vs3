import type { CompanyHealth, CompanyState, DepartmentState, MissionState } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID, missionService } from "@/lib/founder/missions";
import { composeOperatingHealth } from "../health/companyHealth";
import { composeExecutiveContext } from "../context/contextComposer";
import { routeAttention } from "../routing/attentionEngine";

function missionState(id: MissionId): MissionState | null {
  const mission = missionService.getMission(id);
  if (!mission) return null;
  const progress = missionService.getMissionProgress(id);
  return {
    id: mission.id,
    name: mission.name,
    progress: progress?.overall ?? mission.progress,
    status: mission.status,
    health: progress && progress.overall >= 60 ? "steady" : "watch",
  };
}

const DEPARTMENTS: DepartmentState[] = [
  { id: "dept-product", label: "Product", health: "steady", summary: "Listening Rooms mission active." },
  { id: "dept-companion", label: "Companion", health: "strong", summary: "Conversation-first experience stable." },
  { id: "dept-marketing", label: "Marketing", health: "watch", summary: "Launch packets awaiting approval." },
  { id: "dept-operations", label: "Operations", health: "steady", summary: "Orchestrator monitoring active initiatives." },
];

export function composeCompanyHealth(): CompanyHealth {
  const exec = composeOperatingHealth();
  return {
    overall: exec.overall,
    score: exec.score,
    dimensions: exec.dimensions,
    departments: DEPARTMENTS,
  };
}

export function composeCompanyState(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): CompanyState {
  const attention = routeAttention(missionId);
  const missions = missionService
    .listMissions()
    .map((m) => missionState(m.id))
    .filter((m): m is MissionState => m !== null);

  return {
    product: "founder",
    generatedAt: new Date().toISOString(),
    missions,
    health: composeCompanyHealth(),
    context: composeExecutiveContext(missionId),
    primaryRecommendation: attention.primary,
    operatingPrinciple: "One company · One intelligence · One operating system.",
  };
}
