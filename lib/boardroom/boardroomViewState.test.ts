/**
 * Boardroom destination entry vs conversation resume
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  clearBoardIntakeDraft,
  createEmptyBoardIntakeDraft,
  saveBoardIntakeDraft,
  suspendBoardIntakeConversation,
  resumeBoardIntakeConversation,
  resolveInitialBoardIntakeDraft,
  answerBoardIntakeStep,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import {
  boardroomViewFromEntryIntent,
  boardroomViewModeFromView,
  hasResumableBoardDiscussion,
  isBoardroomDestinationHomeView,
  ordinaryDestinationBoardroomView,
} from "@/lib/boardroom";

describe("Boardroom view modes and destination entry", () => {
  beforeEach(() => {
    clearBoardIntakeDraft();
  });

  it("ordinary destination view is seating overview (meet-directors)", () => {
    expect(ordinaryDestinationBoardroomView()).toBe("meet-directors");
    expect(boardroomViewFromEntryIntent("home")).toBe("meet-directors");
    expect(boardroomViewModeFromView("meet-directors")).toBe("boardroom_home");
    expect(isBoardroomDestinationHomeView("meet-directors")).toBe(true);
  });

  it("maps intake and past to discussion / saved modes", () => {
    expect(boardroomViewModeFromView("board-director-intake")).toBe(
      "board_discussion",
    );
    expect(boardroomViewModeFromView("past")).toBe("saved_discussions");
  });

  it("unfinished draft is resumable without auto-opening", () => {
    let d = createEmptyBoardIntakeDraft(["board-chair"]);
    d = answerBoardIntakeStep(d, "Should we hire help?");
    saveBoardIntakeDraft(d);
    expect(hasResumableBoardDiscussion()).toBe(true);
    suspendBoardIntakeConversation();
    expect(hasResumableBoardDiscussion()).toBe(true);
    const restored = resolveInitialBoardIntakeDraft([]);
    expect(restored.conversationSuspended).toBe(true);
    expect(restored.decision).toContain("hire");
  });

  it("resolveInitial does not clear conversationSuspended", () => {
    const d = answerBoardIntakeStep(
      createEmptyBoardIntakeDraft(["board-chair"]),
      "Keep going?",
    );
    saveBoardIntakeDraft({ ...d, conversationSuspended: true });
    const restored = resolveInitialBoardIntakeDraft([]);
    expect(restored.conversationSuspended).toBe(true);
  });

  it("resumeBoardIntakeConversation explicitly unsuspends", () => {
    const d = answerBoardIntakeStep(
      createEmptyBoardIntakeDraft(["board-chair"]),
      "Keep going?",
    );
    saveBoardIntakeDraft({ ...d, conversationSuspended: true });
    const next = resumeBoardIntakeConversation();
    expect(next?.conversationSuspended).toBe(false);
  });

  it("Start New clears draft without deleting saved history lists", () => {
    const d = answerBoardIntakeStep(
      createEmptyBoardIntakeDraft(["board-chair"]),
      "Temp draft",
    );
    saveBoardIntakeDraft(d);
    clearBoardIntakeDraft();
    expect(hasResumableBoardDiscussion()).toBe(false);
  });
});
