import { describe, expect, it } from "vitest";
import type { FrictionlessPendingAction } from "@/lib/frictionlessActionLayer";
import type { PendingChoiceState } from "@/lib/pendingChoice/types";
import {
  detectContinuationKind,
  isRestorationUserTurn,
  resolveConversationPriority,
  stalePendingsToClearOnTopicShift,
} from "./priorityEngine";

const salesFunnelPending: FrictionlessPendingAction = {
  type: "open_workspace",
  target: "content-generator",
  label: "Create",
  context: "sales funnel",
  artifactType: "sales-funnel",
  initialPrompt: "I need to create a sales funnel",
  offeredAtTurn: 2,
  offerSummary: "Create sales funnel",
};

const placeMenuState: PendingChoiceState = {
  pendingChoiceId: "test-menu",
  pendingChoiceType: "estate_place",
  choices: [
    {
      id: "coffee-house",
      label: "Coffee House",
      destination: "coffee-house",
      callback: { kind: "navigate_place", placeId: "coffee-house" },
    },
    {
      id: "library",
      label: "Library",
      destination: "library",
      callback: { kind: "navigate_place", placeId: "library" },
    },
    {
      id: "observatory",
      label: "Observatory",
      destination: "observatory",
      callback: { kind: "navigate_place", placeId: "observatory" },
    },
  ],
  timestamp: Date.now(),
  menuText: "1. Coffee House\n2. Library\n3. Observatory",
  offeredAtTurn: 3,
};

describe("resolveConversationPriority", () => {
  it('"yes" after Clear My Mind offer binds to last assistant — not stale sales funnel', () => {
    const verdict = resolveConversationPriority({
      userText: "yes",
      lastAssistantText:
        "Would you like to clear your mind together for a few minutes?",
      currentTurn: 9,
      hasUniversalCreationSession: false,
      frictionlessPending: salesFunnelPending,
      pendingChoiceState: null,
    });
    expect(verdict.winner).toBe("accept_last_assistant");
    expect(verdict.bindAffirmationTo).toBe("last_assistant");
    expect(verdict.deferFrictionlessYes).toBe(true);
    expect(verdict.stalePendingsToClear).toContain("frictionless");
  });

  it('"yes" after email creation offer aligns with frictionless create pending', () => {
    const emailPending: FrictionlessPendingAction = {
      type: "open_workspace",
      target: "content-generator",
      label: "Create",
      context: "email",
      artifactType: "email",
      initialPrompt: "I need to write an email",
      offeredAtTurn: 1,
      offerSummary: "Write email",
    };
    const verdict = resolveConversationPriority({
      userText: "yes",
      lastAssistantText:
        "I can help you write that email — want to draft it together in Create?",
      currentTurn: 2,
      hasUniversalCreationSession: false,
      frictionlessPending: emailPending,
    });
    expect(verdict.winner).toBe("frictionless_pending");
    expect(verdict.deferFrictionlessYes).toBe(false);
    expect(verdict.bindAffirmationTo).toBe("pending");
  });

  it.each(["yes add more", "add more", "continue"])(
    '"%s" during active creation defers pending choice and frictionless yes',
    (text) => {
      const verdict = resolveConversationPriority({
        userText: text,
        lastAssistantText: "What should the subject line convey?",
        currentTurn: 5,
        hasUniversalCreationSession: true,
        pendingChoiceState: placeMenuState,
        frictionlessPending: salesFunnelPending,
      });
      expect(verdict.winner).toBe("continue_creation");
      expect(verdict.deferPendingChoice).toBe(true);
      expect(verdict.deferFrictionlessYes).toBe(true);
      expect(verdict.stalePendingsToClear).toContain("pending_choice");
    },
  );

  it('"continue" during active proposal/email/SOP session wins over stale menu', () => {
    const verdict = resolveConversationPriority({
      userText: "continue",
      lastAssistantText: "Who is this proposal for?",
      currentTurn: 4,
      hasUniversalCreationSession: true,
      pendingChoiceState: placeMenuState,
    });
    expect(verdict.winner).toBe("continue_creation");
    expect(verdict.continuationKind).toBe("continue");
    expect(verdict.deferPendingChoice).toBe(true);
  });

  it("warm-leads pending clears on brain dump topic shift — yes then binds to clear my mind", () => {
    const shiftClears = stalePendingsToClearOnTopicShift({
      userText: "I have too many ideas bouncing around in my head",
      lastAssistantText: "Want to build your sales funnel together?",
      currentTurn: 6,
      hasUniversalCreationSession: false,
      frictionlessPending: salesFunnelPending,
    });
    expect(shiftClears).toContain("frictionless");

    const yesVerdict = resolveConversationPriority({
      userText: "yes",
      lastAssistantText:
        "Let's clear your mind together — would that help right now?",
      currentTurn: 8,
      hasUniversalCreationSession: false,
      frictionlessPending: salesFunnelPending,
    });
    expect(yesVerdict.winner).toBe("accept_last_assistant");
    expect(yesVerdict.deferFrictionlessYes).toBe(true);
    expect(yesVerdict.stalePendingsToClear).toContain("frictionless");
  });

  it("numbered option choices still route to pending_choice when clearly selecting", () => {
    const verdict = resolveConversationPriority({
      userText: "2",
      lastAssistantText: "1. Coffee House\n2. Library\n3. Observatory",
      currentTurn: 4,
      hasUniversalCreationSession: false,
      pendingChoiceState: placeMenuState,
      frictionlessPending: salesFunnelPending,
    });
    expect(verdict.winner).toBe("pending_choice");
    expect(verdict.deferPendingChoice).toBe(false);
  });

  it("bare yes defers stale estate menu when assistant just offered clear my mind", () => {
    const verdict = resolveConversationPriority({
      userText: "yes",
      lastAssistantText: "Would you like to clear your mind together?",
      currentTurn: 9,
      hasUniversalCreationSession: false,
      pendingChoiceState: placeMenuState,
    });
    expect(verdict.winner).toBe("accept_last_assistant");
    expect(verdict.deferPendingChoice).toBe(true);
    expect(verdict.stalePendingsToClear).toContain("pending_choice");
  });
});

describe("detectContinuationKind", () => {
  it("detects add more and continue variants", () => {
    expect(detectContinuationKind("yes add more")).toBe("add_more");
    expect(detectContinuationKind("continue")).toBe("continue");
    expect(detectContinuationKind("yes")).toBe("yes");
  });
});

describe("isRestorationUserTurn", () => {
  it("recognizes brain dump / too many ideas phrasing", () => {
    expect(isRestorationUserTurn("I have too many ideas")).toBe(true);
    expect(isRestorationUserTurn("help me write an email")).toBe(false);
  });
});
