/**
 * Board Review selection — no auto-invite, no auto-start discussion.
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import {
  addDirectorToBoardReview,
  canStartBoardReview,
  createEmptyBoardReviewState,
  dismissFirstJoinInvite,
  isDirectorIncludedInBoardReview,
  removeDirectorFromBoardReview,
  startBoardReview,
  suggestDirectorsFromBoardRelationships,
} from "@/lib/board/boardReview";

describe("Board Review state", () => {
  it("adds a Director and marks first-join invite", () => {
    const empty = createEmptyBoardReviewState();
    const next = addDirectorToBoardReview(empty, "board-chair");
    expect(next.selectedDirectorIds).toEqual(["board-chair"]);
    expect(next.showFirstJoinInvite).toBe(true);
    expect(next.lastJoinedDirectorId).toBe("board-chair");
    expect(next.reviewStarted).toBe(false);
    expect(isDirectorIncludedInBoardReview(next, "board-chair")).toBe(true);
  });

  it("does not show first-join invite when adding a second Director", () => {
    const withChair = addDirectorToBoardReview(
      createEmptyBoardReviewState(),
      "board-chair",
    );
    const dismissed = dismissFirstJoinInvite(withChair);
    const withTwo = addDirectorToBoardReview(dismissed, "founder-advocate");
    expect(withTwo.selectedDirectorIds).toEqual([
      "board-chair",
      "founder-advocate",
    ]);
    expect(withTwo.showFirstJoinInvite).toBe(false);
  });

  it("allows Remove from Review", () => {
    const withChair = addDirectorToBoardReview(
      createEmptyBoardReviewState(),
      "board-chair",
    );
    const removed = removeDirectorFromBoardReview(withChair, "board-chair");
    expect(removed.selectedDirectorIds).toEqual([]);
    expect(removed.showFirstJoinInvite).toBe(false);
  });

  it("does not start discussion until Start Board Review", () => {
    const withChair = addDirectorToBoardReview(
      createEmptyBoardReviewState(),
      "board-chair",
    );
    expect(canStartBoardReview(withChair)).toBe(true);
    expect(withChair.reviewStarted).toBe(false);
    const started = startBoardReview(withChair);
    expect(started.reviewStarted).toBe(true);
    expect(canStartBoardReview(started)).toBe(false);
  });

  it("never auto-starts with an empty Board", () => {
    const empty = createEmptyBoardReviewState();
    expect(canStartBoardReview(empty)).toBe(false);
    expect(startBoardReview(empty).reviewStarted).toBe(false);
  });

  it("suggests related Directors without auto-including them", () => {
    const suggestions = suggestDirectorsFromBoardRelationships(
      ["board-chair"],
      "board-chair",
    );
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions).not.toContain("board-chair");
    expect(suggestions).toEqual(
      expect.arrayContaining(["vice-chair", "founder-advocate"]),
    );
  });
});
