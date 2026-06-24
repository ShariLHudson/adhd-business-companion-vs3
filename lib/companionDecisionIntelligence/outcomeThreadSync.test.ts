import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildCompanionDecisionIntelligence } from "./companionDecisionIntelligence";
import {
  clearOutcomeThread,
  getOutcomeThread,
} from "../companionOutcomeThread";
import { PRODUCT_EXPANSION_SCENARIO } from "./productExpansionScenario";
import {
  pendingDecisionLabelForIntelligence,
  syncOutcomeThreadFromDecisionIntelligence,
} from "./outcomeThreadSync";
import { shouldOfferDecisionCompassForTurn } from "./decisionCompassOfferGate";

function messagesUpToUserTurn(userTurnCount: number) {
  const messages = [];
  let users = 0;
  let lastUser = "";
  for (const turn of PRODUCT_EXPANSION_SCENARIO.turns) {
    messages.push(turn);
    if (turn.role === "user") {
      users += 1;
      lastUser = turn.content;
      if (users >= userTurnCount) break;
    }
  }
  return { messages, lastUser };
}

describe("outcomeThreadSync", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    clearOutcomeThread();
  });

  it("sets pendingDecision for business expansion", () => {
    const { messages, lastUser } = messagesUpToUserTurn(1);
    const intel = buildCompanionDecisionIntelligence({
      messages,
      userText: lastUser,
      lastAssistantText: "",
    });

    syncOutcomeThreadFromDecisionIntelligence(intel, lastUser);
    const thread = getOutcomeThread();
    expect(thread?.pendingDecision).toBe("keep current, replace, or offer both");
    expect(pendingDecisionLabelForIntelligence(intel)).toBe(
      "keep current, replace, or offer both",
    );
  });

  it("registers Decision Compass pending action when offer-ready", () => {
    const { messages, lastUser } = messagesUpToUserTurn(3);
    const intel = buildCompanionDecisionIntelligence({
      messages,
      userText: lastUser,
      lastAssistantText: PRODUCT_EXPANSION_SCENARIO.turns[4]!.content,
    });

    expect(intel.shouldOfferTopResource).toBe(true);
    syncOutcomeThreadFromDecisionIntelligence(intel, lastUser);
    const thread = getOutcomeThread();
    expect(thread?.pendingAction).toMatch(/Decision Compass/i);
    expect(thread?.activeFeature).toBe("decision-compass");
  });
});

describe("decisionCompassOfferGate", () => {
  it("defers Decision Compass card on first expansion turn", () => {
    const { messages, lastUser } = messagesUpToUserTurn(1);
    const intel = buildCompanionDecisionIntelligence({
      messages,
      userText: lastUser,
      lastAssistantText: "",
    });

    expect(
      shouldOfferDecisionCompassForTurn({
        text: lastUser,
        decisionIntelligence: intel,
      }),
    ).toBe(false);
  });

  it("allows Decision Compass card after discovery complete", () => {
    const { messages, lastUser } = messagesUpToUserTurn(3);
    const intel = buildCompanionDecisionIntelligence({
      messages,
      userText: lastUser,
      lastAssistantText: PRODUCT_EXPANSION_SCENARIO.turns[4]!.content,
    });

    expect(
      shouldOfferDecisionCompassForTurn({
        text: lastUser,
        decisionIntelligence: intel,
      }),
    ).toBe(true);
  });
});
