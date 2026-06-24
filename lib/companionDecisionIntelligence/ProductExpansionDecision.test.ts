import { describe, expect, it } from "vitest";
import type { ChatTurn } from "../companionIntelligence";
import {
  buildCompanionDecisionIntelligence,
} from "./companionDecisionIntelligence";
import { isForbiddenResetMessage } from "./acceptedIntentLock";
import { companionEntryLayerHintForChat } from "../companionEntry";
import { resolveCompanionAcceptanceTurn } from "../companionIntelligenceRouter";
import {
  evaluateProductExpansionTurn,
  PRODUCT_EXPANSION_SCENARIO,
} from "./productExpansionScenario";
import { countAssistantQuestions } from "../companionActionBias";
import { syncOutcomeThreadFromDecisionIntelligence } from "./outcomeThreadSync";

function messagesUpToTurn(turns: ChatTurn[], userTurnCount: number): {
  messages: ChatTurn[];
  lastUser: string;
  lastAssistant: string;
} {
  const messages: ChatTurn[] = [];
  let users = 0;
  let lastUser = "";
  let lastAssistant = "";
  for (const turn of turns) {
    messages.push(turn);
    if (turn.role === "user") {
      users += 1;
      lastUser = turn.content;
      if (users >= userTurnCount) break;
    } else {
      lastAssistant = turn.content;
    }
  }
  return { messages, lastUser, lastAssistant };
}

describe("ProductExpansionDecision", () => {
  it("defers solutions on first turn — discovery before options", () => {
    const { messages, lastUser } = messagesUpToTurn(
      PRODUCT_EXPANSION_SCENARIO.turns,
      1,
    );
    const intel = buildCompanionDecisionIntelligence({
      messages,
      userText: lastUser,
      lastAssistantText: "",
    });

    expect(intel.situation.decisionType).toBe("business_expansion");
    expect(intel.experienceMode).toBe("discovery");
    expect(intel.shouldDeferSolutions).toBe(true);
    expect(intel.shouldOfferTopResource).toBe(false);
    expect(intel.complexity.level).not.toBe("low");
    expect(companionEntryLayerHintForChat(lastUser)).toMatch(
      /PROGRESSIVE DISCOVERY/i,
    );
  });

  it("identifies actual business expansion situation — not simple product choice", () => {
    const { messages, lastUser, lastAssistant } = messagesUpToTurn(
      PRODUCT_EXPANSION_SCENARIO.turns,
      2,
    );
    const evalTurn = evaluateProductExpansionTurn(
      messages,
      lastUser,
      lastAssistant,
    );

    expect(evalTurn.decisionType).toBe("business_expansion");
    expect(evalTurn.experienceMode).toBe("discovery");
    expect(evalTurn.shouldDeferSolutions).toBe(true);
  });

  it("asks enough discovery without overanalyzing through mid-conversation", () => {
    const { messages, lastUser, lastAssistant } = messagesUpToTurn(
      PRODUCT_EXPANSION_SCENARIO.turns,
      2,
    );
    const questions = countAssistantQuestions(messages);
    expect(questions).toBeGreaterThanOrEqual(1);
    expect(questions).toBeLessThanOrEqual(4);

    const intel = buildCompanionDecisionIntelligence({
      messages,
      userText: lastUser,
      lastAssistantText: lastAssistant,
    });
    expect(intel.complexity.discoveryComplete).toBe(false);
  });

  it("evaluates Decision Compass as candidate after sufficient context", () => {
    const { messages, lastUser, lastAssistant } = messagesUpToTurn(
      PRODUCT_EXPANSION_SCENARIO.turns,
      3,
    );
    const evalTurn = evaluateProductExpansionTurn(
      messages,
      lastUser,
      lastAssistant,
    );

    expect(evalTurn.decisionCompassCandidate).toBe(true);
    expect(evalTurn.decisionCompassOfferReady).toBe(true);
    expect(evalTurn.recommendationReady).toBe(true);
    expect(evalTurn.experienceMode).toBe("decision");
  });

  it("continues after user acceptance without conversation reset", () => {
    const turns = PRODUCT_EXPANSION_SCENARIO.turns;
    const messages = turns.slice(0, -1);
    const lastAssistant = turns[turns.length - 2]!.content;
    const lastUser = "Yes";

    const intelBeforeAccept = buildCompanionDecisionIntelligence({
      messages: messages.slice(0, -1),
      userText: turns[turns.length - 3]!.content,
      lastAssistantText: turns[turns.length - 4]!.content,
    });
    const thread = syncOutcomeThreadFromDecisionIntelligence(
      intelBeforeAccept,
      turns[turns.length - 3]!.content,
    );

    const resolution = resolveCompanionAcceptanceTurn({
      userText: lastUser,
      lastAssistantText: lastAssistant,
      currentTurn: messages.length + 1,
      workflow: null,
      outcomeThread: thread,
      pendingInput: {
        workspacePanel: null,
        record: null,
        pendingAction: null,
        createConsent: null,
      },
    });

    expect(resolution.kind).toBe("workflow");
    if (resolution.kind === "workflow") {
      expect(resolution.continuation.action).toBe("open_section");
      if (resolution.continuation.action === "open_section") {
        expect(resolution.continuation.section).toBe("decision-compass");
      }
      expect(isForbiddenResetMessage(resolution.continuation.message)).toBe(
        false,
      );
      expect(resolution.continuation.message).not.toMatch(
        /what(?:'s| is) next/i,
      );
      expect(resolution.continuation.message).not.toMatch(
        /next piece you want to look at/i,
      );
    }

    const intel = buildCompanionDecisionIntelligence({
      messages: [...messages, { role: "user", content: lastUser }],
      userText: lastUser,
      lastAssistantText: lastAssistant,
      outcomeThread: {
        pendingDecision: "keep current, replace, or offer both",
        updatedAt: new Date().toISOString(),
      },
    });
    expect(intel.acceptance?.accepted).toBe(true);
    expect(intel.experienceMode).toBe("action");
  });

  it("reaches actionable recommendation readiness and preserves trust signals", () => {
    const { messages, lastUser, lastAssistant } = messagesUpToTurn(
      PRODUCT_EXPANSION_SCENARIO.turns,
      3,
    );
    const intel = buildCompanionDecisionIntelligence({
      messages,
      userText: lastUser,
      lastAssistantText: lastAssistant,
    });

    expect(intel.situation.riskLevel).toBe("high");
    expect(intel.situation.situationId).toBe("product-expansion-uncertainty");
    expect(intel.topResource?.id).toBe("decision_compass");
    expect(intel.complexity.discoveryComplete).toBe(true);
    expect(intel.complexity.discoveryQuestionsAsked).toBeLessThanOrEqual(4);
  });
});
