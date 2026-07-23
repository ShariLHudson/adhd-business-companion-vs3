/**
 * Cross-context conflict matrix — intent × active context → expected owner/effect.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { clearConversationOwner, setActiveConversationOwner } from "@/lib/conversationContinuity";
import {
  __resetActiveChatScopeForTests,
  __resetDaySessionForTests,
  activateNewDayChatScope,
  startNewDaySession,
} from "@/lib/chatScope";
import {
  clearBoardIntakeDraft,
  createEmptyBoardIntakeDraft,
  saveBoardIntakeDraft,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import { routeConversationTurn } from "./routeConversationTurn";
import { clearRoutingTracesForTests } from "./routingTrace";

function seedBoardAwaiting(): void {
  const draft = createEmptyBoardIntakeDraft(["board-chair"]);
  saveBoardIntakeDraft(draft);
  setActiveConversationOwner({
    kind: "board_intake",
    discussionDraftId: "draft-matrix-1",
    currentStepId: draft.currentStep,
    awaitingAnswer: true,
  });
}

beforeEach(() => {
  clearRoutingTracesForTests();
  clearConversationOwner();
  clearBoardIntakeDraft();
  __resetDaySessionForTests();
  __resetActiveChatScopeForTests();
  startNewDaySession("conv-matrix");
  activateNewDayChatScope();
});

describe("routing conflict matrix", () => {
  const navPhrases = [
    "go to the music room",
    "take me to music",
    "can we head over to the music room",
  ];

  it.each(navPhrases)(
    "direct navigation wins over Board awaiting-answer: %s",
    (phrase) => {
      seedBoardAwaiting();
      const result = routeConversationTurn({
        userText: phrase,
        conversationId: "conv-matrix",
      });
      expect(result.decision.intentFamily).toBe("direct_navigation");
      expect(result.decision.priorityStep).toBe("direct_navigation");
      expect(result.continuityGate.action).not.toBe("route_to_owner");
      expect(
        result.effects.some(
          (e) => e.type === "navigate" || e.type === "suspend_scope",
        ),
      ).toBe(true);
    },
  );

  it("cancel outranks awaiting Board", () => {
    seedBoardAwaiting();
    const result = routeConversationTurn({
      userText: "never mind",
      conversationId: "conv-matrix",
    });
    expect(result.decision.intentFamily).toBe("cancel_stop_exit");
  });

  it("general question after New Day is not Board-owned", () => {
    seedBoardAwaiting();
    clearBoardIntakeDraft();
    clearConversationOwner();
    startNewDaySession("conv-new");
    activateNewDayChatScope();
    const result = routeConversationTurn({
      userText: "What's one simple tip for a calmer morning?",
      conversationId: "conv-new",
    });
    expect(result.decision.intentFamily).not.toBe("answer_pending_question");
    expect(result.continuityGate.action).not.toBe("route_to_owner");
  });

  it("one turn produces at most one primary navigate effect for music room", () => {
    const result = routeConversationTurn({
      userText: "go to the music room",
      conversationId: "conv-matrix",
    });
    const navigates = result.effects.filter((e) => e.type === "navigate");
    expect(navigates.length).toBeLessThanOrEqual(1);
  });

  it("unknown destination does not invent a navigate target", () => {
    const result = routeConversationTurn({
      userText: "go to the imaginary castle on mars",
      conversationId: "conv-matrix",
    });
    if (result.decision.intentFamily === "direct_navigation") {
      expect(result.decision.targetId).toBeNull();
    }
  });
});
