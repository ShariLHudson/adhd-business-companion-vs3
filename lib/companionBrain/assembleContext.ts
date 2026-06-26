/**
 * Context Assembly™ — unify memory into one reasoning snapshot.
 * @see constitution.ts — assembleContext
 */

import type {
  AssembledContext,
  CompanionMemorySnapshot,
  OrientationType,
  PermissionDisplay,
} from "./types";
import { resolveCycleState } from "./resolveCycleState";
import { resolveDayMode } from "./resolveDayMode";

function resolveOrientationType(
  memory: CompanionMemorySnapshot,
  dayMode: ReturnType<typeof resolveDayMode>,
): OrientationType {
  if (memory.sessionFlags?.hyperfocusActive) return "minimal";
  if (memory.capacity.motivation === "overwhelmed") return "orientationOnly";
  if (dayMode === "celebration" || dayMode === "recovery") return "short";
  if (dayMode === "survival" || dayMode === "health" || dayMode === "family") {
    return "short";
  }
  if (dayMode === "hyperfocus") return "minimal";
  return "full";
}

function resolvePermissionDisplay(
  memory: CompanionMemorySnapshot,
  orientationType: OrientationType,
): PermissionDisplay {
  if (memory.sessionFlags?.hyperfocusActive) return "none";
  if (dayModeCelebration(memory)) return "none";
  if (
    orientationType === "orientationOnly" ||
    memory.capacity.motivation === "overwhelmed"
  ) {
    return "collapsedSummary";
  }
  if (
    memory.sessionFlags?.userDeclaredSurvival ||
    memory.capacity.energy === "low"
  ) {
    return "collapsedSummary";
  }
  return "collapsedSummary";
}

function dayModeCelebration(memory: CompanionMemorySnapshot): boolean {
  return resolveDayMode(memory) === "celebration";
}

export function assembleContext(
  memory: CompanionMemorySnapshot,
): AssembledContext {
  const dayMode = resolveDayMode(memory);
  const cycleState = resolveCycleState(memory, dayMode);
  const orientationType = resolveOrientationType(memory, dayMode);
  const orientationOnly =
    orientationType === "orientationOnly" ||
    memory.capacity.motivation === "overwhelmed";
  const permissionDisplay = resolvePermissionDisplay(memory, orientationType);
  const overloadDetected =
    (memory.captureLoad?.thoughtCount ?? 0) >= 12 ||
    memory.capacity.motivation === "overwhelmed";

  return {
    dayKey: memory.dayKey,
    dayMode,
    cycleState,
    capacity: memory.capacity,
    brainState: memory.brainState,
    candidates: memory.candidates,
    exclusions: memory.exclusions,
    suppressTopics: memory.suppressTopics,
    orientationType,
    orientationOnly,
    permissionDisplay,
    overloadDetected,
    captureLoad: memory.captureLoad,
    milestoneEvidence: memory.milestoneEvidence,
    focusAreas: memory.focusAreas,
    yesterdaySummary: memory.yesterdaySummary,
    calendarHighlights: memory.calendarHighlights,
  };
}
