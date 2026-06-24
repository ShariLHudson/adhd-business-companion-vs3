import { describe, expect, it } from "vitest";
import { buildRelationshipIntelligencePriorityBlock } from "./relationshipIntelligencePrompt";
import { buildRelationshipLeadParagraph } from "./relationshipResponseContract";
import { resolveIntentRouting } from "./intentRoutingIntelligence";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";
import {
  isSelfUnderstandingIntent,
  RELATIONSHIP_INTELLIGENCE_OUT_OF_SCOPE,
  shouldSuppressRelationshipIntelligenceForUserText,
} from "./relationshipIntelligenceBoundaries";

describe("relationshipIntelligenceBoundaries (P0.17)", () => {
  const forbiddenCases = [
    "I want to write a book about ADHD and my experiences.",
    "How do I create a marketing plan?",
    "What is a mind map?",
    "I need to write an email.",
    "What is a sales funnel?",
    "Help me create a proposal.",
    "Help me build a sales funnel.",
    "How do I create an SOP?",
    "I need to focus.",
    "I want calming music.",
  ] as const;

  const allowedCases = [
    "Why do I procrastinate?",
    "What patterns do you notice?",
    "Why do I start but not finish?",
    "What is my biggest strength?",
    "What has changed about me?",
    "Why do I keep getting overwhelmed?",
    "Why am I a good starter but poor finisher?",
    "What blind spots do I have?",
    "How do I tend to make decisions?",
  ] as const;

  it.each(forbiddenCases)("suppresses relationship for: %s", (userText) => {
    expect(isSelfUnderstandingIntent(userText)).toBe(false);
    expect(shouldSuppressRelationshipIntelligenceForUserText(userText)).toBe(true);
    const routing = resolveIntentRouting({ userText });
    expect(routing.suppressRelationshipIntelligence).toBe(true);
    const frictionless = resolveFrictionlessAction({ userText, currentTurn: 1 });
    expect(frictionless.suppressRelationship).toBe(true);
    expect(buildRelationshipIntelligencePriorityBlock(userText)).toBeNull();
    expect(
      buildRelationshipLeadParagraph(userText, new Date(), {
        suppressForRouting: false,
      }),
    ).toBeNull();
  });

  it.each(allowedCases)("allows relationship for: %s", (userText) => {
    expect(isSelfUnderstandingIntent(userText)).toBe(true);
    expect(shouldSuppressRelationshipIntelligenceForUserText(userText)).toBe(false);
    const routing = resolveIntentRouting({ userText });
    expect(routing.suppressRelationshipIntelligence).toBe(false);
  });

  it("exports audit failure token", () => {
    expect(RELATIONSHIP_INTELLIGENCE_OUT_OF_SCOPE).toBe(
      "RELATIONSHIP_INTELLIGENCE_OUT_OF_SCOPE",
    );
  });
});
