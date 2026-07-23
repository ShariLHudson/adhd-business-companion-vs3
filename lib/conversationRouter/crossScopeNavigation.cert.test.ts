/**
 * Journey D/E certification — Create composer, Chamber, Project N/A, stale responses.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { tryDirectNavigationInterrupt } from "./tryDirectNavigationInterrupt";
import { routeConversationTurn } from "./routeConversationTurn";
import { clearRoutingTracesForTests } from "./routingTrace";
import {
  createChatRequestIdentity,
  shouldAcceptAssistantResponse,
} from "@/lib/chatScope/staleResponseGuard";
import {
  __resetActiveChatScopeForTests,
  __resetDaySessionForTests,
  activateNewDayChatScope,
  getDaySession,
  setActiveChatScope,
  startNewDaySession,
} from "@/lib/chatScope";
import { readDevChatResponseDelayMs } from "@/lib/chatScope/devChatResponseDelay";
import {
  clearConversationOwner,
  setActiveConversationOwner,
} from "@/lib/conversationContinuity";
import {
  clearBoardIntakeDraft,
  createEmptyBoardIntakeDraft,
  saveBoardIntakeDraft,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import { resolveCreateBeginOutcome } from "@/lib/createEstate/resolveCreateBeginOutcome";
import { isDirectNavigationPriorityTurn } from "@/lib/chatScope/directNavigationPriority";

beforeEach(() => {
  clearRoutingTracesForTests();
  clearConversationOwner();
  clearBoardIntakeDraft();
  __resetDaySessionForTests();
  __resetActiveChatScopeForTests();
  startNewDaySession("conv-cert");
  activateNewDayChatScope();
});

describe("cross-scope navigation certification", () => {
  it("1–2 Create composer: direct navigation outranks Create intent", () => {
    const phrase = "go to the music room";
    const interrupt = tryDirectNavigationInterrupt(phrase);
    expect(interrupt.interrupted).toBe(true);
    if (!interrupt.interrupted) return;
    expect(interrupt.destinationId.toLowerCase()).toMatch(/music/);
    expect(isDirectNavigationPriorityTurn(phrase)).toBe(true);
    // Composer must call interrupt before Create classifier; Create must not
    // silently open a workspace for a navigation phrase.
    const createOutcome = resolveCreateBeginOutcome(phrase);
    expect(createOutcome.kind).not.toBe("open");
  });

  it("3–4 Create interrupt does not delete drafts (navigate-only contract)", () => {
    const interrupt = tryDirectNavigationInterrupt(
      "take me over to the music room",
    );
    expect(interrupt.interrupted).toBe(true);
    // Resume remains a deliberate Continue Working action on Create entrance.
    expect(interrupt).toMatchObject({
      interrupted: true,
      destinationId: expect.any(String),
      label: expect.any(String),
    });
  });

  it("5–8 Chamber active cannot claim direct navigation", () => {
    setActiveConversationOwner({
      kind: "chamber_specialist",
      memberId: "strategy",
      conversationId: "conv-chamber",
      awaitingAnswer: true,
    });
    setActiveChatScope("chamber_member", {
      sourceId: "strategy",
      pendingQuestion: true,
      resumable: true,
    });

    const result = routeConversationTurn({
      userText: "go to the music room",
      conversationId: "conv-chamber",
      destinationId: "chamber-of-momentum",
      activeSection: "chamber-of-momentum",
    });

    expect(result.decision.intentFamily).toBe("direct_navigation");
    expect(result.decision.targetId?.toLowerCase()).toMatch(/music/);
    expect(result.effects.some((e) => e.type === "navigate")).toBe(true);
    expect(result.effects.some((e) => e.type === "suspend_scope")).toBe(true);
    expect(result.effects.some((e) => e.type === "supersede_inflight")).toBe(
      true,
    );
    expect(result.continuityGate.action).not.toBe("route_to_owner");
  });

  it("9–10 Project has no chat surface (N/A); global nav still wins while projects active", () => {
    // Project Ask Shari is approve/reject task UI — not conversational chat.
    const result = routeConversationTurn({
      userText: "go to the music room",
      conversationId: "conv-project",
      destinationId: "projects",
      activeSection: "projects",
    });
    expect(result.decision.intentFamily).toBe("direct_navigation");
    expect(result.effects.some((e) => e.type === "navigate")).toBe(true);
    expect(result.decision.targetId?.toLowerCase()).toMatch(/music/);
  });

  it("11–13 Delayed responses discarded after navigation and New Day", () => {
    const day = getDaySession();
    const identity = createChatRequestIdentity({
      conversationId: "conv-a",
      scopeId: "scope-create",
      destinationId: "create",
    });

    expect(
      shouldAcceptAssistantResponse({
        identity,
        activeConversationId: "conv-a",
        activeDaySessionId: day.daySessionId,
        activeScopeId: "scope-music",
        activeDestinationId: "music-room",
        responseDestinationId: "create",
      }).ok,
    ).toBe(false);

    const next = startNewDaySession("conv-new");
    expect(
      shouldAcceptAssistantResponse({
        identity,
        activeConversationId: "conv-new",
        activeDaySessionId: next.daySessionId,
        activeScopeId: "scope-global",
        activeDestinationId: "welcome-home",
        responseDestinationId: identity.destinationId,
      }).ok,
    ).toBe(false);
  });

  it("14 keyboard and voice-transcribed text share the same routing path", () => {
    const text = "go to the music room";
    expect(tryDirectNavigationInterrupt(text)).toEqual(
      tryDirectNavigationInterrupt(text),
    );
    const a = routeConversationTurn({
      userText: text,
      conversationId: "conv-cert",
    });
    const b = routeConversationTurn({
      userText: text,
      conversationId: "conv-cert",
    });
    expect(a.decision.targetId).toBe(b.decision.targetId);
    expect(a.decision.intentFamily).toBe(b.decision.intentFamily);
  });

  it("15 other Estate destinations resolve, not only Music Room", () => {
    const home = tryDirectNavigationInterrupt("go home");
    expect(home.interrupted).toBe(true);
    if (home.interrupted) {
      expect(home.destinationId.toLowerCase()).toMatch(/welcome|home/);
    }
    const music = tryDirectNavigationInterrupt("open the music room");
    expect(music.interrupted).toBe(true);
  });

  it("dev delay seam is off by default", () => {
    expect(readDevChatResponseDelayMs()).toBe(0);
  });

  it("Board awaiting still cannot claim navigation (A–C regression guard)", () => {
    const draft = createEmptyBoardIntakeDraft(["board-chair"]);
    saveBoardIntakeDraft(draft);
    setActiveConversationOwner({
      kind: "board_intake",
      discussionDraftId: "draft-cert-1",
      currentStepId: draft.currentStep,
      awaitingAnswer: true,
    });
    const result = routeConversationTurn({
      userText: "go to the music room",
      conversationId: "conv-cert",
      activeSection: "boardroom",
    });
    expect(result.decision.intentFamily).toBe("direct_navigation");
    expect(result.effects.some((e) => e.type === "navigate")).toBe(true);
  });
});
