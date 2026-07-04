import { describe, expect, it } from "vitest";
import {
  isThoughtfulConversationRequest,
  resolveCompanionResponseRoute,
} from "./companionLatencyProfiler";
import type { IntentRoutingDecision } from "./intentRoutingIntelligence";
import type { FrictionlessActionDecision } from "./frictionlessActionLayer";

const noneFrictionless: FrictionlessActionDecision = {
  category: "none",
  suppressRelationship: false,
  suppressRecap: false,
  suppressReflectionFirst: false,
  responseHint: null,
  localReply: null,
  pendingAction: null,
  toolSuggestion: null,
  workspaceOffer: null,
  intentRouting: null,
};

const defaultRouting: IntentRoutingDecision = {
  category: "conversation",
  learnFastPath: false,
  suppressRelationshipIntelligence: false,
  suppressReflectionFirst: false,
  suppressConversationSummary: false,
} as IntentRoutingDecision;

describe("companionLatencyProfiler thoughtful routing", () => {
  it("detects coaching and advice questions", () => {
    expect(
      isThoughtfulConversationRequest(
        "how can i connect with someone i don't know",
      ),
    ).toBe(true);
    expect(isThoughtfulConversationRequest("i need some financial advice")).toBe(
      true,
    );
  });

  it("routes thoughtful questions on the fast streaming path", () => {
    const route = resolveCompanionResponseRoute({
      userText: "i need some financial advice",
      routing: defaultRouting,
      frictionless: noneFrictionless,
    });
    expect(route.routeClass).toBe("fast");
    expect(route.skipHeavyLayers).toBe(true);
    expect(route.routeReason).toBe("thoughtful_coaching_question");
  });

  it("keeps default conversation on the fast path", () => {
    const route = resolveCompanionResponseRoute({
      userText: "things feel messy today",
      routing: { ...defaultRouting, category: "conversation" },
      frictionless: noneFrictionless,
    });
    expect(route.routeReason).toBe("coach_intent");
    expect(route.routeClass).toBe("fast");
    expect(route.skipHeavyLayers).toBe(true);
  });
});
