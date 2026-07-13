/**
 * Slice 2 — continuity gate before primary / Decision Engine.
 * @vitest-environment node
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import * as primaryTurnClassifier from "@/lib/conversation/primaryTurnClassifier";
import {
  clearConversationOwner,
  continuityGateSkipsPrimaryClassification,
  detectStoredContentOrNavigationDestination,
  getActiveConversationOwner,
  persistConversationOwner,
  resolveContinuityTurnGate,
  routeTurnToOwner,
} from "@/lib/conversationContinuity";
import {
  clearUniversalCreationSession,
  formatUniversalCreationTurnReply,
  saveUniversalCreationSession,
  startUniversalCreationTurn,
  advanceUniversalCreation,
  advanceGuidedCreationFlow,
  resolveUniversalCreationTurn,
} from "@/lib/universalCreation";
import {
  answerBoardIntakeStep,
  createEmptyBoardIntakeDraft,
  saveBoardIntakeDraft,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import { activateChamberMember } from "@/lib/chamber/chamberMemberActivation";

function stubBrowserStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("window", {
    localStorage: storage,
    sessionStorage: storage,
  });
}

describe("conversationContinuity — Slice 2 gate", () => {
  beforeEach(() => {
    stubBrowserStorage();
    clearUniversalCreationSession();
    clearConversationOwner();
    vi.restoreAllMocks();
  });

  it("newsletter purpose stays inside newsletter creation and skips primary classify", () => {
    const classifySpy = vi.spyOn(
      primaryTurnClassifier,
      "classifyPrimaryConversationTurn",
    );
    const start = startUniversalCreationTurn("I need to write a newsletter.", 1);
    expect(start?.kind).toBe("question");
    saveUniversalCreationSession(start!.session);

    const purpose =
      "To introduce my ADHD app to new users and explain how it all works.";
    const gate = resolveContinuityTurnGate({
      userText: purpose,
      lastAssistantText: formatUniversalCreationTurnReply(start!),
    });

    expect(gate.action).toBe("route_to_owner");
    expect(continuityGateSkipsPrimaryClassification(gate)).toBe(true);
    expect(classifySpy).not.toHaveBeenCalled();

    if (gate.action !== "route_to_owner") return;
    expect(gate.routed.kind).toBe("universal_creation");
    if (gate.routed.kind === "universal_creation") {
      expect(gate.routed.session.documentType).toBe("newsletter");
      expect(gate.routed.reply).not.toMatch(/how (?:the )?app works as a product/i);
      expect(gate.routed.turn.kind).toBe("question");
    }
  });

  it("approved email is not sent back to discovery", () => {
    let turn = startUniversalCreationTurn("help me write a client email", 1)!;
    const answers = [
      "One client",
      "Existing relationship",
      "Clear boundary about missed commitments",
      "They know the work was expected",
      "They understand next steps",
      "A calm professional tone",
    ];
    for (const answer of answers) {
      const next = advanceUniversalCreation(turn.session, answer);
      expect(next).toBeTruthy();
      turn = next!;
      if (next?.kind === "ready") break;
    }
    expect(turn.kind).toBe("ready");
    saveUniversalCreationSession(turn.session);

    const draftTurn = advanceGuidedCreationFlow(
      turn.session,
      "yes",
      turn.kind === "ready" ? turn.message : "",
    )!;
    saveUniversalCreationSession(draftTurn.session);

    const approve = resolveUniversalCreationTurn(
      "No changes. I like it.",
      9,
      formatUniversalCreationTurnReply(draftTurn),
    )!;
    saveUniversalCreationSession(approve.session);
    expect(approve.session.phase).toBe("awaiting_action");

    const gate = resolveContinuityTurnGate({
      userText: "Let's write the email.",
      lastAssistantText: formatUniversalCreationTurnReply(approve),
    });
    expect(gate.action).toBe("route_to_owner");
    if (gate.action !== "route_to_owner") return;
    expect(gate.routed.kind).toBe("universal_creation");
    if (gate.routed.kind === "universal_creation") {
      expect(gate.routed.session.phase).toBe("awaiting_action");
      expect(gate.routed.reply).not.toMatch(/Who is receiving this email/i);
      expect(gate.routed.reply).toMatch(/Copy Email|Gmail|Send Email|ready/i);
    }
  });

  it("active Chamber conversation beats general classification", () => {
    activateChamberMember("data-analytics");
    const classifySpy = vi.spyOn(
      primaryTurnClassifier,
      "classifyPrimaryConversationTurn",
    );

    const gate = resolveContinuityTurnGate({
      userText: "What analytics software do you suggest?",
      activeSection: "chamber-of-momentum",
    });

    expect(gate.action).toBe("route_to_owner");
    expect(continuityGateSkipsPrimaryClassification(gate)).toBe(true);
    expect(classifySpy).not.toHaveBeenCalled();
    if (gate.action !== "route_to_owner") return;
    expect(gate.owner.kind).toBe("chamber_specialist");
    expect(gate.routed.kind).toBe("continue_in_chat");
  });

  it("Board intake awaiting-answer beats Decision Engine routing", () => {
    let draft = createEmptyBoardIntakeDraft(["board-chair"]);
    draft = answerBoardIntakeStep(draft, "Should we raise prices?");
    draft = answerBoardIntakeStep(draft, "Cash flow is tight.");
    draft = answerBoardIntakeStep(draft, "Raise, hold, or package");
    saveBoardIntakeDraft(draft);
    expect(getActiveConversationOwner().kind).toBe("board_intake");

    const classifySpy = vi.spyOn(
      primaryTurnClassifier,
      "classifyPrimaryConversationTurn",
    );
    const gate = resolveContinuityTurnGate({
      userText: "I'm worried about losing loyal members.",
    });

    expect(gate.action).toBe("route_to_owner");
    expect(classifySpy).not.toHaveBeenCalled();
    if (gate.action !== "route_to_owner") return;
    expect(gate.routed.kind).toBe("board_intake");
    if (gate.routed.kind === "board_intake") {
      expect(gate.routed.draft.currentStep).toBe("review");
      expect(gate.routed.reply).toMatch(/review|Board discussion/i);
    }
  });

  it("stored-project request works when no stronger owner exists", () => {
    const gate = resolveContinuityTurnGate({
      userText: "I need to see all my current projects.",
    });
    expect(gate.action).toBe("destination");
    if (gate.action === "destination") {
      expect(gate.destination.kind).toBe("my_day");
      if (gate.destination.kind === "my_day") {
        expect(gate.destination.opener).toBe("project-homes");
      }
    }
    const rhythms = detectStoredContentOrNavigationDestination("Open Rhythms.");
    expect(rhythms?.kind).toBe("my_day");
    if (rhythms?.kind === "my_day") expect(rhythms.opener).toBe("rhythms");
    const reminders =
      detectStoredContentOrNavigationDestination("Show my reminders.");
    expect(reminders?.kind).toBe("my_day");
    if (reminders?.kind === "my_day") expect(reminders.opener).toBe("reminders");
    const evidence =
      detectStoredContentOrNavigationDestination("Show my evidence.");
    expect(evidence?.kind).toBe("estate");
    if (evidence?.kind === "estate") {
      expect(evidence.destination).toBe("evidence-vault");
    }
    const boardPast = detectStoredContentOrNavigationDestination(
      "Show my past Board discussions.",
    );
    expect(boardPast?.kind).toBe("estate");
    if (boardPast?.kind === "estate") {
      expect(boardPast.destination).toBe("boardroom");
      expect(boardPast.boardroomIntent).toBe("past");
    }
  });

  it("explicit cancel exits the owner", () => {
    const start = startUniversalCreationTurn("I need to write a newsletter.", 1)!;
    saveUniversalCreationSession(start.session);
    persistConversationOwner(getActiveConversationOwner());

    const gate = resolveContinuityTurnGate({ userText: "cancel" });
    expect(gate.action).toBe("clear_owner_continue");
    if (gate.action === "clear_owner_continue") {
      expect(gate.reason).toBe("explicit_exit");
      expect(gate.clearUniversalCreation).toBe(true);
    }
  });

  it("explicit destination change overrides the current owner", () => {
    const start = startUniversalCreationTurn("I need to write a newsletter.", 1)!;
    saveUniversalCreationSession(start.session);

    const gate = resolveContinuityTurnGate({
      userText: "open Plan My Day instead",
    });
    expect(gate.action).toBe("destination");
    if (gate.action === "destination") {
      expect(gate.destination.kind).toBe("my_day");
      if (gate.destination.kind === "my_day") {
        expect(gate.destination.opener).toBe("plan-my-day");
      }
    }
  });

  it("stale owner clears safely", () => {
    persistConversationOwner({
      kind: "board_intake",
      discussionDraftId: "missing",
      currentStepId: "concerns",
      awaitingAnswer: true,
    });
    // No board draft in storage — domain owner absent.
    const gate = resolveContinuityTurnGate({
      userText: "hello there",
    });
    expect(gate.action).toBe("fall_through");
  });

  it("Cancel this clears ownership", () => {
    const start = startUniversalCreationTurn("I need to write a newsletter.", 1)!;
    saveUniversalCreationSession(start.session);
    const gate = resolveContinuityTurnGate({ userText: "Cancel this." });
    expect(gate.action).toBe("clear_owner_continue");
  });

  it("continuity owner hint is compact identifiers only", async () => {
    const start = startUniversalCreationTurn("write a newsletter", 1)!;
    saveUniversalCreationSession(start.session);
    const { continuityOwnerHintForChat } = await import(
      "@/lib/conversationContinuity"
    );
    const hint = continuityOwnerHintForChat();
    expect(hint).toMatch(/CONTINUITY OWNER/);
    expect(hint).toMatch(/guided_workflow|artifact/);
    expect(hint!.length).toBeLessThan(400);
  });

  it("routeTurnToOwner does not call classifyPrimaryConversationTurn", () => {
    const classifySpy = vi.spyOn(
      primaryTurnClassifier,
      "classifyPrimaryConversationTurn",
    );
    const start = startUniversalCreationTurn("write a newsletter", 1)!;
    saveUniversalCreationSession(start.session);
    const owner = getActiveConversationOwner();
    routeTurnToOwner({
      owner,
      userText: "To explain how the app works",
      lastAssistantText: formatUniversalCreationTurnReply(start),
    });
    expect(classifySpy).not.toHaveBeenCalled();
  });
});
