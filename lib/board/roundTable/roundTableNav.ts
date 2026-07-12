/**
 * Round Table overlay navigation — in-place Board navigation (no page reload).
 */

import type { BoardDirectorId } from "@/lib/board/types";

export type RoundTableNavState = {
  open: boolean;
  /** Director currently focused from the table */
  activeDirectorId: BoardDirectorId | null;
  /** Previous Director — preserved for smooth transitions / return */
  previousDirectorId: BoardDirectorId | null;
};

export function createClosedRoundTableNav(): RoundTableNavState {
  return {
    open: false,
    activeDirectorId: null,
    previousDirectorId: null,
  };
}

export function openRoundTable(
  state: RoundTableNavState,
  activeDirectorId: BoardDirectorId | null = state.activeDirectorId,
): RoundTableNavState {
  return {
    ...state,
    open: true,
    activeDirectorId,
  };
}

export function closeRoundTable(state: RoundTableNavState): RoundTableNavState {
  return { ...state, open: false };
}

/**
 * Select a Director chair — preserves previous Director id for transitions.
 * Does not clear Meet / Board Review state (caller keeps that separately).
 */
export function selectRoundTableDirector(
  state: RoundTableNavState,
  directorId: BoardDirectorId,
): RoundTableNavState {
  if (state.activeDirectorId === directorId) {
    return { ...state, open: true };
  }
  return {
    open: true,
    previousDirectorId: state.activeDirectorId,
    activeDirectorId: directorId,
  };
}

export function returnToMemberPlace(
  state: RoundTableNavState,
): RoundTableNavState {
  return {
    open: true,
    previousDirectorId: state.activeDirectorId,
    activeDirectorId: null,
  };
}
