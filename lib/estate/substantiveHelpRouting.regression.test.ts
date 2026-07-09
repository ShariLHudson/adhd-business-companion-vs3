import { describe, expect, it } from "vitest";

import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import { evaluateSurveyIntelligence } from "@/lib/surveyIntelligence";
import { evaluateEstatePlaceTurn } from "./estatePlaceNavigation";
import { resolveEstateIntent } from "./estateIntentBridge";
import { resolveEstatePlace } from "./resolveEstatePlace";
import {
  mapMemberDescriptionToCanonicalIds,
  repairInventedEstatePlaceList,
} from "./estatePlaceIdentityLock";
import { isConversationOnlyTurn } from "./estateConversationGuard";
import { isSubstantiveConversationHelpRequest } from "./substantiveConversationHelp";

const SUBSTANTIVE = [
  "how do I strategize a marketing campaign on Facebook",
  "what's a good pricing strategy for my new product",
  "help me think through a plan to grow my email list",
  "what should I focus on this quarter for my business",
  "give me ideas for improving customer retention",
  "i need to find a strategy for marketing apps on facebook",
  "help me figure out my next big goal",
] as const;

const LEGIT_NAV = [
  "take me to the celebration garden",
  "I want to go to the hall of accomplishments",
  "can you show me the journal",
] as const;

const STRATEGY_ANSWER_MENU = `Here are a few ideas to get started:
1. Clarify your audience and offer.
2. Pick one Facebook campaign objective.
3. Draft three ad angles and test them.`;

describe("substantive help vs room-routing regression", () => {
  it.each(SUBSTANTIVE)(
    "keeps substantive ask in conversation: %s",
    (text) => {
      expect(isSubstantiveConversationHelpRequest(text)).toBe(true);
      expect(isConversationOnlyTurn(text)).toBe(true);
      expect(resolveEstatePlace(text).kind).toBe("none");
      expect(resolveEstateIntent({ text }).suggestedPlaceIds).toEqual([]);
      expect(evaluateEstatePlaceTurn({ userText: text }).type).toBe("none");
      expect(mapMemberDescriptionToCanonicalIds(text)).toEqual([]);

      const primary = classifyPrimaryConversationTurn({ userText: text });
      expect(primary.type).not.toBe("DIRECT_COMMAND");
      expect(primary.type).not.toBe("IMPLIED_NEED");
      expect([
        "INFORMATION_OR_RESEARCH",
        "TASK_REQUEST",
        "RELATIONSHIP_CHAT",
        "EMOTIONAL_SUPPORT",
      ]).toContain(primary.type);

      const survey = evaluateSurveyIntelligence({
        userText: text,
        messages: [],
        decisionType: "strategy",
      });
      expect(survey.shouldOfferCreate).toBe(false);

      const repaired = repairInventedEstatePlaceList(STRATEGY_ANSWER_MENU, text);
      expect(repaired).toBe(STRATEGY_ANSWER_MENU);
      expect(repaired).not.toMatch(/Reading Nook|Greenhouse|Welcome Home/i);
    },
  );

  it("rejection after misfire stays in conversation (no room/survey loop)", () => {
    const rejections = [
      "that's not what I meant",
      "no, I want actual advice",
      "no not a survey but how to strategize a marketing campaign on facebook",
    ];
    for (const text of rejections) {
      expect(isSubstantiveConversationHelpRequest(text)).toBe(true);
      expect(evaluateEstatePlaceTurn({ userText: text }).type).toBe("none");
      expect(
        evaluateSurveyIntelligence({
          userText: text,
          messages: [],
          decisionType: "strategy",
        }).shouldOfferCreate,
      ).toBe(false);
      expect(resolveEstateIntent({ text }).suggestedPlaceIds).toEqual([]);
    }
  });

  it("repeat-topic persistence: three phrasings never emit room menus", () => {
    const thread = [
      "i need to find a strategy for marketing apps on facebook",
      "where did all the ideas go you just showed",
      "no not a survey but how to strategize a marketing campaign on facebook",
    ];
    for (const text of thread) {
      expect(evaluateEstatePlaceTurn({ userText: text }).type).toBe("none");
      expect(resolveEstatePlace(text).kind).toBe("none");
      expect(
        evaluateSurveyIntelligence({
          userText: text,
          messages: thread.map((content) => ({ role: "user" as const, content })),
          decisionType: "strategy",
        }).shouldOfferCreate,
      ).toBe(false);
    }
  });

  it.each(LEGIT_NAV)("still navigates legitimate place requests: %s", (text) => {
    expect(isSubstantiveConversationHelpRequest(text)).toBe(false);
    const turn = evaluateEstatePlaceTurn({ userText: text });
    expect(turn.type).toBe("navigate");
  });

  it("ambiguous quiet-place + business problem may still offer rooms", () => {
    const text =
      "I need a quiet place to think through a business problem";
    expect(isSubstantiveConversationHelpRequest(text)).toBe(false);
    const turn = evaluateEstatePlaceTurn({ userText: text });
    expect(["offer", "navigate"]).toContain(turn.type);
    if (turn.type === "offer") {
      expect(turn.placeIds.length).toBeGreaterThan(0);
      expect(turn.line).toMatch(/\d+\./);
    }
  });
});
