/**
 * @vitest-environment jsdom
 *
 * Scoped conversation + New Day + direct navigation priority.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  answerBoardIntakeStep,
  clearBoardIntakeDraft,
  createEmptyBoardIntakeDraft,
  loadBoardIntakeDraft,
  saveBoardIntakeDraft,
  suspendBoardIntakeConversation,
  upsertBoardDirectorDiscussion,
  type BoardDirectorDiscussionRecord,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import { prepareCallTheBoard } from "@/lib/board/callTheBoard";
import {
  activateNewDayChatScope,
  createChatRequestIdentity,
  getActiveChatScope,
  getDaySession,
  isDirectNavigationPriorityTurn,
  shouldAcceptAssistantResponse,
  startNewDaySession,
  __resetActiveChatScopeForTests,
  __resetDaySessionForTests,
} from "@/lib/chatScope";
import {
  canOwnerHandleTurn,
  getActiveConversationOwner,
  resolveContinuityTurnGate,
} from "@/lib/conversationContinuity";
import { resetActiveConversation } from "@/lib/conversationReset";
import { detectDirectCommand } from "@/lib/estateIntelligence/estateCommandRouter";
import { resolveHardNavigationCommand } from "@/lib/hardNavigationCommands";
import { classifyMemberIntent } from "@/lib/memberIntent";
import { clearUniversalCreationSession } from "@/lib/universalCreation";

describe("chat scope + New Day + navigation priority", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    __resetDaySessionForTests();
    __resetActiveChatScopeForTests();
    clearBoardIntakeDraft();
    clearUniversalCreationSession();
  });

  function seedBoardIntakeAtReview() {
    let draft = createEmptyBoardIntakeDraft(["board-chair"]);
    draft = answerBoardIntakeStep(draft, "Should we raise prices?");
    draft = answerBoardIntakeStep(draft, "Cash flow is tight.");
    draft = answerBoardIntakeStep(draft, "Raise, hold, or package");
    draft = answerBoardIntakeStep(draft, "Losing loyal members.");
    saveBoardIntakeDraft(draft);
    return draft;
  }

  it("1. New Day clears temporary Board intake ownership", () => {
    seedBoardIntakeAtReview();
    expect(getActiveConversationOwner().kind).toBe("board_intake");
    resetActiveConversation({ mode: "new-day" });
    expect(loadBoardIntakeDraft()).toBeNull();
    expect(getActiveConversationOwner().kind).not.toBe("board_intake");
  });

  it("2. New Day preserves saved Board discussion history", () => {
    const record = {
      id: "bd-test-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      decision: "Pricing",
      importance: "Cash",
      options: ["Raise"],
      concerns: "Loyalty",
      selectedDirectorIds: ["board-chair"],
      chairConfirmed: true,
      status: "open",
    } as BoardDirectorDiscussionRecord;
    upsertBoardDirectorDiscussion(record);
    seedBoardIntakeAtReview();
    resetActiveConversation({ mode: "new-day" });
    expect(loadBoardIntakeDraft()).toBeNull();
    const raw = localStorage.getItem("spark.board.director-discussions.v1");
    expect(raw).toBeTruthy();
    expect(raw).toContain("bd-test-1");
  });

  it("3. Go to the Music Room is direct navigation (canonical registry)", () => {
    expect(isDirectNavigationPriorityTurn("go to the music room")).toBe(true);
    const cmd = detectDirectCommand("go to the music room");
    expect(cmd?.roomId).toBe("music-room");
    expect(resolveHardNavigationCommand("go to the music room")).toBeNull();
  });

  it("4. Navigation outranks Board awaiting-answer", () => {
    seedBoardIntakeAtReview();
    const owner = getActiveConversationOwner();
    expect(owner.kind).toBe("board_intake");
    expect(canOwnerHandleTurn(owner, "go to the music room")).toBe(false);
    const gate = resolveContinuityTurnGate({
      userText: "go to the music room",
    });
    expect(gate.action).toBe("fall_through");
    expect(gate.intentBucket).toBe("navigation");
    expect(loadBoardIntakeDraft()?.conversationSuspended).toBe(true);
  });

  it("5. Navigation outranks unfinished Create workflow", () => {
    const owner = {
      kind: "guided_workflow" as const,
      workflowId: "uc:workshop:t1",
      workflowType: "workshop",
      currentStepId: "q:0",
      awaitingAnswer: true,
    };
    expect(canOwnerHandleTurn(owner, "take me to the Music Room")).toBe(false);
    const intent = classifyMemberIntent({
      userText: "take me to the Music Room",
      activeOwner: owner,
      hasStickyDocument: true,
    });
    expect(intent.bucket).toBe("navigation");
    const gate = resolveContinuityTurnGate({
      userText: "take me to the Music Room",
    });
    expect(gate.intentBucket).toBe("navigation");
    expect(gate.action).not.toBe("route_to_owner");
  });

  it("6. Navigation outranks stale destination scope via priority helper", () => {
    expect(
      isDirectNavigationPriorityTurn("open the Conservatory"),
    ).toBe(true);
  });

  it("7. Old async Board response discarded after New Day", () => {
    const before = startNewDaySession("conv-old");
    const identity = createChatRequestIdentity({
      conversationId: "conv-old",
      scopeId: "board_discussion:1",
    });
    expect(identity.daySessionId).toBe(before.daySessionId);
    resetActiveConversation({ mode: "new-day" });
    const after = getDaySession();
    expect(after.daySessionId).not.toBe(before.daySessionId);
    const check = shouldAcceptAssistantResponse({
      identity,
      activeConversationId: after.conversationId,
      activeDaySessionId: after.daySessionId,
      activeScopeId: getActiveChatScope()?.scopeId ?? "new_day",
    });
    expect(check.ok).toBe(false);
    if (!check.ok) {
      expect(["day_session_mismatch", "conversation_mismatch"]).toContain(
        check.reason,
      );
    }
  });

  it("8. Old async response discarded after navigation identity change", () => {
    const identity = createChatRequestIdentity({
      conversationId: "conv-a",
      scopeId: "board_discussion:1",
      destinationId: "boardroom",
    });
    const check = shouldAcceptAssistantResponse({
      identity,
      activeConversationId: "conv-a",
      activeDaySessionId: identity.daySessionId,
      activeScopeId: identity.scopeId,
      responseDestinationId: "boardroom",
      activeDestinationId: "music-room",
    });
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.reason).toBe("destination_mismatch");
  });

  it("9. Board state resumes only when explicitly unsuspended / Boardroom loads", () => {
    seedBoardIntakeAtReview();
    suspendBoardIntakeConversation();
    expect(getActiveConversationOwner().kind).not.toBe("board_intake");
    expect(loadBoardIntakeDraft()?.conversationSuspended).toBe(true);
  });

  it("10–11. New Day activates new_day scope; does not restore board_intake", () => {
    seedBoardIntakeAtReview();
    prepareCallTheBoard({
      projectName: "Launch",
      projectFocus: "Pricing",
    });
    resetActiveConversation({ mode: "new-day" });
    expect(getActiveChatScope()?.kind).toBe("new_day");
    expect(getActiveConversationOwner().kind).not.toBe("board_intake");
    const gate = resolveContinuityTurnGate({
      userText: "What should I focus on today?",
    });
    expect(gate.action).not.toBe("route_to_owner");
  });

  it("12. Direct destination aliases resolve through canonical registry", () => {
    expect(detectDirectCommand("Take me to the Music Room.")?.roomId).toBe(
      "music-room",
    );
    expect(detectDirectCommand("go to the treehouse")?.roomId).toBeTruthy();
  });

  it("14. Unknown destinations do not fabricate a route", () => {
    expect(detectDirectCommand("go to the imaginary castle")).toBeNull();
    expect(isDirectNavigationPriorityTurn("go to the imaginary castle")).toBe(
      false,
    );
  });

  it("17. Fresh general conversation works after New Day", () => {
    seedBoardIntakeAtReview();
    resetActiveConversation({ mode: "new-day" });
    activateNewDayChatScope();
    const intent = classifyMemberIntent({
      userText: "How are you today?",
    });
    expect(intent.bucket).toBe("conversation");
  });

  it("19. Return to Estate / Welcome Home is direct navigation", () => {
    expect(isDirectNavigationPriorityTurn("return to the Estate")).toBe(true);
    expect(isDirectNavigationPriorityTurn("Welcome Home")).toBe(true);
  });
});
