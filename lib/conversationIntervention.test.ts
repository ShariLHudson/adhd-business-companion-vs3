import { describe, expect, it } from "vitest";

import { evaluateActivation, shouldSurfaceActivationOffer } from "./activation/activationEngine";
import {
  assistantContainsQuestion,
  isWorkloadStressWithoutBlocker,
  resolveCompanionCardUiState,
  shouldSuppressActivationForTurn,
  shouldSuppressInterventionSurfaces,
  shouldSuppressSecondaryCards,
} from "./conversationIntervention";
import {
  evaluateCompanionTurn,
  governorAllowsToolSuggestion,
  governorAllowsWorkspaceOffer,
} from "./companionGovernor";
import { resolveIntent } from "./intentStabilizer";
import type { WorkspaceOpenSnapshot } from "./workspaceExecution";

const SNAP: WorkspaceOpenSnapshot = {
  panel: null,
  activeSection: "home",
  revealSeq: 0,
};

const LAUNCH_STRESS_INPUT =
  "I have lots to do before Friday's launch and am pretty stressed.";

const ASSISTANT_DISCOVERY =
  "It sounds like you're feeling a lot of pressure with Friday's launch coming up. What specific tasks are weighing on you the most right now?";

describe("conversationIntervention", () => {
  it("detects workload stress without stuck language", () => {
    expect(isWorkloadStressWithoutBlocker(LAUNCH_STRESS_INPUT)).toBe(true);
    expect(shouldSuppressActivationForTurn(LAUNCH_STRESS_INPUT)).toBe(true);
  });

  it("suppresses secondary cards after assistant asks a question", () => {
    const messages = [
      { role: "user", content: LAUNCH_STRESS_INPUT },
      { role: "assistant", content: ASSISTANT_DISCOVERY },
    ];
    expect(assistantContainsQuestion(ASSISTANT_DISCOVERY)).toBe(true);
    expect(
      shouldSuppressSecondaryCards({
        messages,
        userText: LAUNCH_STRESS_INPUT,
      }),
    ).toBe(true);
  });

  it("suppresses even when assistant empathy has no question yet", () => {
    const messages = [
      { role: "user", content: LAUNCH_STRESS_INPUT },
      {
        role: "assistant",
        content:
          "It sounds like you're feeling a lot of pressure with Friday's launch coming up.",
      },
    ];
    expect(
      shouldSuppressSecondaryCards({
        messages,
        userText: LAUNCH_STRESS_INPUT,
      }),
    ).toBe(true);
  });
});

describe("activation — launch stress QA", () => {
  it("does not surface clarity card for stress + workload without stuck language", () => {
    const snap = evaluateActivation({
      text: LAUNCH_STRESS_INPUT,
      emotionalState: "emotional",
      cognitiveLoadLevel: "moderate",
      projectsMissingNextAction: 2,
    });
    expect(shouldSurfaceActivationOffer(snap)).toBe(false);
    expect(snap.companionOffer).toBe("");
  });
});

describe("companion card gating — launch stress manual QA", () => {
  it("one assistant response, no cards", () => {
    const messages = [
      { role: "user", content: LAUNCH_STRESS_INPUT },
      { role: "assistant", content: ASSISTANT_DISCOVERY },
    ];
    const activation = evaluateActivation({
      text: LAUNCH_STRESS_INPUT,
      emotionalState: "emotional",
      projectsMissingNextAction: 2,
    });
    const ui = resolveCompanionCardUiState({
      userText: LAUNCH_STRESS_INPUT,
      messages,
      activationOffer: activation.companionOffer,
      pendingAction: false,
      actionBridge: false,
      toolCard: false,
    });
    expect(messages.filter((m) => m.role === "assistant")).toHaveLength(1);
    expect(ui.showActivation).toBe(false);
    expect(ui.showPendingAction).toBe(false);
    expect(ui.showActionBridge).toBe(false);
    expect(ui.showToolCard).toBe(false);
  });

  it("would show activation only when user explicitly stuck and assistant did not ask", () => {
    const stuck = "I'm stuck and don't know what to do first.";
    const messages = [
      { role: "user", content: stuck },
      {
        role: "assistant",
        content: "That sounds frustrating. Let's find one small step.",
      },
    ];
    const activation = evaluateActivation({
      text: stuck,
      emotionalState: "stuck",
    });
    const ui = resolveCompanionCardUiState({
      userText: stuck,
      messages,
      activationOffer: activation.companionOffer,
      pendingAction: false,
      actionBridge: false,
      toolCard: false,
    });
    expect(shouldSuppressActivationForTurn(stuck)).toBe(false);
    expect(
      shouldSurfaceActivationOffer(activation, stuck, messages),
    ).toBe(true);
    expect(ui.showActivation).toBe(
      shouldSurfaceActivationOffer(activation, stuck, messages),
    );
  });
});

describe("distress card master gate — I am overwhelmed.", () => {
  const text = "I am overwhelmed.";

  it("governor suppresses cards, workspace offers, and tool suggestions", () => {
    const surface = evaluateCompanionTurn({
      userText: text,
      lastAssistantText: "",
      workspacePanel: null,
      workspaceSnap: SNAP,
      resolvedIntent: resolveIntent(text),
    });
    expect(surface.outcome).toBe("chat_only");
    expect(surface.suppressCards).toBe(true);
    expect(surface.lane).toBe("emotional_support");
    expect(governorAllowsWorkspaceOffer(surface)).toBe(false);
    expect(governorAllowsToolSuggestion(surface)).toBe(false);
  });

  it("suppresses activation and all companion card surfaces", () => {
    expect(shouldSuppressActivationForTurn(text)).toBe(true);

    const messages = [{ role: "user", content: text }];
    expect(
      shouldSuppressSecondaryCards({
        messages,
        userText: text,
      }),
    ).toBe(true);

    const activation = evaluateActivation({
      text,
      emotionalState: "emotional",
      cognitiveLoadLevel: "overloaded",
    });
    expect(shouldSurfaceActivationOffer(activation, text)).toBe(false);
    const ui = resolveCompanionCardUiState({
      userText: text,
      messages,
      activationOffer: "",
      pendingAction: true,
      actionBridge: true,
      toolCard: true,
      governorSuppressesCards: true,
    });
    expect(ui.showActivation).toBe(false);
    expect(ui.showPendingAction).toBe(false);
    expect(ui.showActionBridge).toBe(false);
    expect(ui.showToolCard).toBe(false);

    const uiIfOfferLeaked = resolveCompanionCardUiState({
      userText: text,
      messages,
      activationOffer: activation.companionOffer || "hypothetical offer",
      pendingAction: true,
      actionBridge: true,
      toolCard: true,
      governorSuppressesCards: true,
    });
    expect(uiIfOfferLeaked.showActivation).toBe(false);
    expect(uiIfOfferLeaked.showPendingAction).toBe(false);
    expect(uiIfOfferLeaked.showActionBridge).toBe(false);
    expect(uiIfOfferLeaked.showToolCard).toBe(false);
  });
});

describe("first-turn distress — activation reduce-scope card", () => {
  function distressActivation(text: string) {
    return evaluateActivation({
      text,
      emotionalState: "emotional",
      cognitiveLoadLevel: "overloaded",
    });
  }

  it("1 — first-turn I am overwhelmed: chat only, no reduce-scope card", () => {
    const text = "I am overwhelmed";
    const messages = [{ role: "user", content: text }];
    const activation = distressActivation(text);
    expect(activation.companionOffer).toMatch(/carrying a lot/i);
    expect(
      shouldSurfaceActivationOffer(activation, text, messages),
    ).toBe(false);
    expect(
      shouldSuppressInterventionSurfaces({
        userText: text,
        messages,
        governorSuppressesCards: true,
      }),
    ).toBe(true);
    expect(
      resolveCompanionCardUiState({
        userText: text,
        messages,
        activationOffer: activation.companionOffer,
        pendingAction: false,
        actionBridge: false,
        toolCard: false,
        governorSuppressesCards: true,
      }).showActivation,
    ).toBe(false);
  });

  it("2 — first-turn I am stressed and can't handle this: no cards", () => {
    const text = "I am stressed and can't handle this";
    const messages = [{ role: "user", content: text }];
    const activation = distressActivation(text);
    expect(
      shouldSurfaceActivationOffer(activation, text, messages),
    ).toBe(false);
    expect(
      shouldSuppressInterventionSurfaces({
        userText: text,
        messages,
        governorSuppressesCards: true,
      }),
    ).toBe(true);
  });

  it("3 — follow-up help me sort it: reduce-scope support allowed", () => {
    const followUp = "Can you help me sort it?";
    const messages = [
      { role: "user", content: "I am overwhelmed" },
      { role: "assistant", content: "That sounds really heavy." },
      { role: "user", content: followUp },
    ];
    const activation = distressActivation("I am overwhelmed");
    expect(activation.companionOffer).toMatch(/carrying a lot/i);
    expect(
      shouldSuppressInterventionSurfaces({
        userText: followUp,
        messages,
        governorSuppressesCards: false,
      }),
    ).toBe(false);
    expect(
      shouldSurfaceActivationOffer(activation, followUp, messages),
    ).toBe(true);
  });

  it("4 — follow-up what should I do first: prioritization support allowed", () => {
    const followUp = "What should I do first?";
    const messages = [
      { role: "user", content: "I am overwhelmed" },
      { role: "assistant", content: "I'm here with you." },
      { role: "user", content: followUp },
    ];
    const activation = evaluateActivation({
      text: followUp,
      emotionalState: "unclear",
      cognitiveLoadLevel: "heavy",
    });
    expect(
      shouldSuppressInterventionSurfaces({
        userText: followUp,
        messages,
        governorSuppressesCards: false,
      }),
    ).toBe(false);
    expect(
      shouldSurfaceActivationOffer(activation, followUp, messages),
    ).toBe(Boolean(activation.companionOffer.trim()));
  });
});
