/**
 * Board Review — selection state before a discussion begins.
 * Directors are added only by explicit member choice.
 */

import type { BoardDirectorId } from "@/lib/board/types";

export type BoardReviewState = {
  /** Explicitly included Directors — never auto-filled. */
  selectedDirectorIds: BoardDirectorId[];
  /**
   * Discussion must not begin until the member selects Start Board Review.
   */
  reviewStarted: boolean;
  /** Shown after the first Director is included. */
  showFirstJoinInvite: boolean;
  lastJoinedDirectorId: BoardDirectorId | null;
};

export function createEmptyBoardReviewState(): BoardReviewState {
  return {
    selectedDirectorIds: [],
    reviewStarted: false,
    showFirstJoinInvite: false,
    lastJoinedDirectorId: null,
  };
}

export function isDirectorIncludedInBoardReview(
  state: BoardReviewState,
  directorId: BoardDirectorId,
): boolean {
  return state.selectedDirectorIds.includes(directorId);
}

export function addDirectorToBoardReview(
  state: BoardReviewState,
  directorId: BoardDirectorId,
): BoardReviewState {
  if (state.selectedDirectorIds.includes(directorId)) {
    return state;
  }
  const wasEmpty = state.selectedDirectorIds.length === 0;
  return {
    ...state,
    selectedDirectorIds: [...state.selectedDirectorIds, directorId],
    reviewStarted: false,
    showFirstJoinInvite: wasEmpty,
    lastJoinedDirectorId: directorId,
  };
}

export function removeDirectorFromBoardReview(
  state: BoardReviewState,
  directorId: BoardDirectorId,
): BoardReviewState {
  const nextIds = state.selectedDirectorIds.filter((id) => id !== directorId);
  return {
    ...state,
    selectedDirectorIds: nextIds,
    reviewStarted: false,
    showFirstJoinInvite:
      nextIds.length === 0 ? false : state.showFirstJoinInvite,
    lastJoinedDirectorId:
      state.lastJoinedDirectorId === directorId
        ? (nextIds[nextIds.length - 1] ?? null)
        : state.lastJoinedDirectorId,
  };
}

export function dismissFirstJoinInvite(
  state: BoardReviewState,
): BoardReviewState {
  return { ...state, showFirstJoinInvite: false };
}

/**
 * Start Board Review — member-initiated only.
 * Does not auto-invite Directors or open Chamber.
 */
export function startBoardReview(state: BoardReviewState): BoardReviewState {
  if (state.selectedDirectorIds.length === 0) return state;
  return {
    ...state,
    reviewStarted: true,
    showFirstJoinInvite: false,
  };
}

export function canStartBoardReview(state: BoardReviewState): boolean {
  return state.selectedDirectorIds.length > 0 && !state.reviewStarted;
}
