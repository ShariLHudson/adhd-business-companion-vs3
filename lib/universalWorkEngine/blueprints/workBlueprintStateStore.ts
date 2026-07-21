/**
 * In-memory Work ↔ Blueprint runtime state (engine-owned).
 */

import type { CanonicalWorkId } from "../types";
import type { WorkBlueprintState } from "./types";
import { resolveActiveSections } from "./conditions";
import { requireBlueprint } from "./registry";

const byWorkId = new Map<string, WorkBlueprintState>();

export function resetWorkBlueprintStateForTests(): void {
  byWorkId.clear();
}

export function getWorkBlueprintState(
  workId: CanonicalWorkId | string,
): WorkBlueprintState | null {
  return byWorkId.get(workId) ?? null;
}

export function requireWorkBlueprintState(
  workId: CanonicalWorkId | string,
): WorkBlueprintState {
  const state = getWorkBlueprintState(workId);
  if (!state) {
    throw new Error(`No Blueprint state for Work "${workId}"`);
  }
  return state;
}

export function putWorkBlueprintState(state: WorkBlueprintState): WorkBlueprintState {
  byWorkId.set(state.workId, state);
  return state;
}

export function refreshConditionalSections(
  state: WorkBlueprintState,
): WorkBlueprintState {
  const bp = requireBlueprint(state.blueprintId, state.blueprintVersion);
  const { activeConditionalSectionIds } = resolveActiveSections(
    bp.sections,
    state,
    state.depthMode,
  );
  const next = {
    ...state,
    activeConditionalSectionIds,
    updatedAt: new Date().toISOString(),
  };
  return putWorkBlueprintState(next);
}

export function listWorkBlueprintStates(): WorkBlueprintState[] {
  return [...byWorkId.values()];
}
