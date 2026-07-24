import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearShariConversationThread,
  storeShariConversationThread,
  buildShariConversationThread,
} from "./conversationContinuity";
import { runShariCognitivePipeline } from "./cognitivePipeline";
import { validateConversationExcellence } from "./conversationExcellence";
import { reviewConversationDelight } from "./conversationDelight";
import { reviewAgainstGeneralAiBaseline } from "./generalAiBaseline";
import { SHARI_GOLDEN_RESPONSE_CASES } from "./goldenResponseSuite";

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  vi.stubGlobal("window", {
    sessionStorage: {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => {
        memory.set(k, v);
      },
      removeItem: (k: string) => {
        memory.delete(k);
      },
    },
  });
  clearShariConversationThread();
});

describe("Phase 2 response composer + wisdom", () => {
  it("selects principle_then_steps opening for Loom teaching", () => {
    const turn = runShariCognitivePipeline("How do I create a Loom video?");
    expect(turn.primaryProfessionalRole).toBe("teacher");
    expect(turn.composition.openingApproach).toBe("principle_then_steps");
    expect(turn.composition.primaryResponseShape).toBe("step_by_step");
    expect(turn.wisdom.highestLeverageInsight).toMatch(/five seconds|promise/i);
    expect(turn.promptHints).toMatch(/RESPONSE COMPOSITION/i);
  });

  it("selects consulting composition for craft booth", () => {
    const turn = runShariCognitivePipeline(
      "How do I best set up my vendor booth for a craft fair?",
    );
    expect(turn.primaryProfessionalRole).toBe("consultant");
    expect(turn.composition.primaryResponseShape).toBe(
      "consulting_recommendation",
    );
    expect(turn.composition.commonMistakeRequirement).toBe(true);
    expect(turn.wisdom.likelyMistakes.length).toBeGreaterThan(0);
  });

  it("advisor composition requires recommendation for $600 decision", () => {
    const turn = runShariCognitivePipeline(
      "Should I spend $600 on this craft fair booth?",
    );
    expect(turn.primaryProfessionalRole).toBe("advisor");
    expect(turn.composition.recommendationRequirement).toBe(true);
    expect(turn.composition.openingApproach).toBe(
      "recommendation_then_reasoning",
    );
    expect(turn.wisdom.keyJudgment).toMatch(/conditional|missing/i);
  });

  it("coach composition does not intercept as teacher for overwhelm", () => {
    const turn = runShariCognitivePipeline(
      "I feel overwhelmed and do not know where to start.",
    );
    expect(turn.primaryProfessionalRole).toBe("coach");
    expect(turn.composition.primaryResponseShape).toBe("coaching_exchange");
    expect(turn.composition.openingApproach).toBe("reflection_then_question");
  });

  it("fails generic category-list and passes substantive composed answer", () => {
    const turn = runShariCognitivePipeline(
      "How do I best set up my vendor booth for a craft fair?",
    );
    const weak = validateConversationExcellence({
      request: turn.decision.rawRequest,
      answer:
        "Consider layout, signage, accessibility, lighting, and engagement. Which would you like to explore?",
      decision: turn.decision,
      context: {
        ...turn.context,
        knownContextAvailable: true,
        knownProducts: ["journals", "mugs", "beaded pens"],
        relevantContextKeys: ["legacy.sells"],
        contextConfidence: 0.9,
      },
      questionPolicy: turn.questionPolicy,
      primaryRole: turn.primaryProfessionalRole,
      composition: turn.composition,
      wisdom: turn.wisdom,
    });
    expect(weak.excellent).toBe(false);
    expect(weak.baseline.shariIsWeaker || !weak.delight?.passes).toBe(true);

    const strongAnswer = [
      "A successful craft-fair booth works like a small store: people should understand what you sell within three to five seconds.",
      "",
      "Because you sell journals, mugs, and beaded pens, I would group the booth into themed gift collections rather than one row per product type.",
      "",
      "1. Place a hero gift set at eye level.",
      "2. Keep prices readable and checkout obvious.",
      "3. Leave one clear empty space so the table invites people in.",
      "",
      "Common mistake: packing every SKU flat so nothing becomes the story.",
      "",
      "If you tell me booth size, I can tighten the packing list.",
    ].join("\n");

    const strong = validateConversationExcellence({
      request: turn.decision.rawRequest,
      answer: strongAnswer,
      decision: turn.decision,
      context: {
        ...turn.context,
        knownContextAvailable: true,
        knownProducts: ["journals", "mugs", "beaded pens"],
        relevantContextKeys: ["legacy.sells"],
        contextConfidence: 0.9,
      },
      questionPolicy: turn.questionPolicy,
      primaryRole: turn.primaryProfessionalRole,
      composition: turn.composition,
      wisdom: turn.wisdom,
    });
    expect(strong.beatsOrMatchesGeneralAi).toBe(true);
    expect(strong.delight?.passes).toBe(true);
    expect(strong.score).toBeGreaterThanOrEqual(7);
  });

  it("personalized but thin answers still fail baseline", () => {
    const turn = runShariCognitivePipeline(
      "How do I best set up my vendor booth for a craft fair?",
    );
    const context = {
      ...turn.context,
      knownContextAvailable: true,
      knownProducts: ["journals"],
      relevantContextKeys: ["legacy.sells"],
      contextConfidence: 0.9,
    };
    const baseline = reviewAgainstGeneralAiBaseline({
      decision: turn.decision,
      context,
      draft: "Since you sell journals, which area would you like to explore?",
    });
    expect(baseline.shariIsWeaker).toBe(true);
    expect(
      baseline.personalizationWithoutSubstance ||
        baseline.comparativeScore < 5,
    ).toBe(true);
  });

  it("delight review detects saved effort and felt understanding", () => {
    const turn = runShariCognitivePipeline("How do I create a Loom video?");
    const baseline = reviewAgainstGeneralAiBaseline({
      decision: turn.decision,
      context: turn.context,
      draft: "Open Loom, pick screen+camera, record promise→path→ask, trim, share.",
    });
    const delight = reviewConversationDelight({
      decision: turn.decision,
      answer: [
        "Viewers decide in the first five seconds — open with the promise.",
        "",
        "1. Open Loom and choose screen + camera.",
        "2. Say the one thing they will understand by the end.",
        "3. Show the path once, then stop and title it.",
        "",
        "Common mistake: a long hello before anything useful.",
      ].join("\n"),
      context: turn.context,
      primaryRole: turn.primaryProfessionalRole,
      composition: turn.composition,
      wisdom: turn.wisdom,
      baseline,
    });
    expect(delight.savedEffortScore).toBeGreaterThanOrEqual(6);
    expect(delight.feltUnderstoodScore).toBeGreaterThanOrEqual(5);
    expect(delight.delightSignals.length).toBeGreaterThan(0);
  });

  it("follow-up preserves composition topic via pipeline continuity", () => {
    const first = runShariCognitivePipeline(
      "How do I best set up my vendor booth for a craft fair?",
    );
    storeShariConversationThread(
      buildShariConversationThread({
        decision: first.decision,
        answer: "Booth guidance with zones and packing.",
        conversationId: "test-conv-phase2",
        primaryProfessionalRole: first.primaryProfessionalRole,
        supportingProfessionalRoles: first.supportingProfessionalRoles,
      }),
    );
    const follow = runShariCognitivePipeline("What should go on the table?", {
      conversationId: "test-conv-phase2",
    });
    expect(follow.isFollowUp).toBe(true);
    expect(follow.primaryProfessionalRole).toBe("consultant");
    expect(follow.composition.openingApproach).toBe(
      "contextual_observation_then_guidance",
    );
  });

  it("golden suite roles and forbidden openings align with pipeline", () => {
    for (const c of SHARI_GOLDEN_RESPONSE_CASES.filter((x) => !x.followUp)) {
      const turn = runShariCognitivePipeline(c.request);
      expect(turn.primaryProfessionalRole).toBe(c.expectedRole);
      expect(turn.composition.forbiddenPatterns.length).toBeGreaterThan(0);
      if (c.expectedWisdomSignals.length) {
        const blob = JSON.stringify(turn.wisdom).toLowerCase();
        const hit = c.expectedWisdomSignals.some((s) =>
          blob.includes(s.toLowerCase()),
        );
        expect(hit).toBe(true);
      }
    }
  });
});
