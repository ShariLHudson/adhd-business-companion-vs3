import { describe, expect, it } from "vitest";
import { isKnowledgeQuestion, measureLearnFastPath } from "./knowledgeIntelligence";
import {
  resolveFrictionlessAction,
  resolveFrictionlessContinuation,
} from "./frictionlessActionLayer";
import { resolveIntentRouting } from "./intentRoutingIntelligence";
import { buildRelationshipLeadParagraph } from "./relationshipResponseContract";

describe("knowledgeIntelligence", () => {
  const learnCases = [
    "What is a sales funnel?",
    "What is a lead magnet?",
    "Explain ADHD paralysis",
    "Difference between a funnel and a website",
    "Tell me about nurture sequences",
    "How do funnels work?",
  ] as const;

  it.each(learnCases)("detects learn intent for %s", (userText) => {
    expect(isKnowledgeQuestion(userText)).toBe(true);
    const decision = resolveIntentRouting({ userText });
    expect(decision.category).toBe("learn");
    expect(decision.learnFastPath).toBe(true);
    expect(decision.suppressRelationshipIntelligence).toBe(true);
    expect(decision.suppressRelationshipLead).toBe(true);
    expect(decision.suppressReflectionFirst).toBe(true);
    expect(decision.suppressWisdomIntelligence).toBe(true);
    expect(decision.suppressTransformationIntelligence).toBe(true);
    expect(decision.suppressObservationEngine).toBe(true);
    expect(
      buildRelationshipLeadParagraph(userText, new Date(), {
        suppressForRouting: true,
      }),
    ).toBeNull();
  });

  it("does not treat build requests as knowledge questions", () => {
    expect(isKnowledgeQuestion("I need to create a sales funnel")).toBe(false);
    const decision = resolveIntentRouting({
      userText: "I need to create a sales funnel",
    });
    expect(decision.category).not.toBe("learn");
    expect(decision.learnFastPath).toBe(false);
    expect(decision.suppressRelationshipIntelligence).toBe(true);
  });

  it("reports fast-path layer savings", () => {
    const metrics = measureLearnFastPath();
    expect(metrics.learnFastPath).toBe(true);
    expect(metrics.layersSkipped.length).toBeGreaterThan(4);
    expect(metrics.estimatedPromptTokensSaved).toBeGreaterThan(1000);
  });
});

describe("create continuation — yes opens Create", () => {
  const artifactOffers = [
    "I need to create a sales funnel",
    "help me build an SOP",
    "write a marketing plan",
    "i need to write an email",
  ] as const;

  it.each(artifactOffers)("pending yes after %s opens Create", (userText) => {
    const routing = resolveIntentRouting({ userText });
    const action = resolveFrictionlessAction({
      userText,
      currentTurn: 3,
    });
    expect(action.localReply).toBeTruthy();
    expect(action.pendingAction?.type).toBe("open_workspace");
    expect(action.pendingAction?.target).toBe("content-generator");

    const continuation = resolveFrictionlessContinuation(
      "yes",
      action.pendingAction!,
      4,
    );
    expect(continuation?.execute).toBe(true);
    expect(continuation?.ack).toMatch(/Create/i);
  });
});
