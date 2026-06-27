import { describe, expect, it } from "vitest";
import {
  BOARD_INTELLIGENCE_DATA_SOURCES,
  COMPANION_INTELLIGENCE_PIPELINE_ORDER,
  FOUNDER_INTELLIGENCE_LEARNING_DOMAINS,
  FUTURE_FIRST_CORE_PRINCIPLE,
  INTELLIGENCE_PATTERN_LABELS,
} from "./types";
import {
  ECOSYSTEM_MAJOR_SYSTEMS,
  getEcosystemMajorSystem,
  learningSignalsForSystem,
} from "./systems";
import {
  mapVisualThinkingStageToEcosystem,
  isValidEcosystemPipelineAdvance,
} from "./pipeline";
import {
  evaluateFutureFirstFeature,
  evaluateRegisteredSystem,
  FUTURE_FIRST_BUILDING_RULE,
} from "./evaluation";

describe("companionIntelligenceEcosystem", () => {
  it("defines the companion intelligence pipeline", () => {
    expect(COMPANION_INTELLIGENCE_PIPELINE_ORDER[0]).toBe("user_situation");
    expect(COMPANION_INTELLIGENCE_PIPELINE_ORDER).toContain("pattern_recognition");
    expect(COMPANION_INTELLIGENCE_PIPELINE_ORDER.at(-1)).toBe("future_intelligence");
  });

  it("maps visual thinking stages onto ecosystem pipeline", () => {
    expect(mapVisualThinkingStageToEcosystem("understand")).toBe("understanding");
    expect(mapVisualThinkingStageToEcosystem("feed_founder")).toBe(
      "future_intelligence",
    );
  });

  it("validates pipeline advance — intelligence owns the flow", () => {
    expect(
      isValidEcosystemPipelineAdvance("understanding", "framework_selection"),
    ).toBe(true);
    expect(isValidEcosystemPipelineAdvance("insights", "understanding")).toBe(
      false,
    );
  });

  it("defines intelligence analytics pattern categories", () => {
    expect(INTELLIGENCE_PATTERN_LABELS.overwhelm).toBe("Overwhelm Patterns");
    expect(INTELLIGENCE_PATTERN_LABELS.founder_decision).toMatch(
      /Founder Decision/i,
    );
    expect(Object.keys(INTELLIGENCE_PATTERN_LABELS)).toHaveLength(10);
  });

  it("registers major systems with three-layer value", () => {
    expect(ECOSYSTEM_MAJOR_SYSTEMS.length).toBeGreaterThanOrEqual(8);
    for (const system of ECOSYSTEM_MAJOR_SYSTEMS) {
      const evalResult = evaluateRegisteredSystem(system.id);
      expect(evalResult.aligned).toBe(true);
      expect(system.learningSignals.length).toBeGreaterThan(0);
      expect(system.intelligencePatterns.length).toBeGreaterThan(0);
    }
  });

  it("Business Canvas passes the final three-question test", () => {
    const canvas = getEcosystemMajorSystem("business-canvas")!;
    expect(canvas.threeLayer.userValue).toMatch(/how their business works/i);
    expect(canvas.threeLayer.intelligenceCaptures).toContain("Audience patterns");
    expect(canvas.threeLayer.futureEnables).toContain("Living Canvas");
    expect(canvas.threeLayer.futureEnables).toContain("What-If Analysis");
    expect(learningSignalsForSystem("business-canvas")).toContain(
      "Business model patterns",
    );
  });

  it("Decision Tree captures decision learning signals", () => {
    const tree = getEcosystemMajorSystem("decision-tree")!;
    expect(tree.learningSignals).toContain("Risk tolerance");
    expect(tree.learningSignals).toContain("Decision style");
  });

  it("Plan My Day and Clear My Mind capture capacity and overwhelm signals", () => {
    expect(learningSignalsForSystem("plan-my-day")).toContain("Energy patterns");
    expect(learningSignalsForSystem("clear-my-mind")).toContain(
      "Overwhelm triggers",
    );
  });

  it("rejects features missing any of the three layers", () => {
    const incomplete = evaluateFutureFirstFeature({
      userValue: "Helps today",
      intelligenceCaptures: [],
      futureEnables: ["Living Canvas"],
    });
    expect(incomplete.aligned).toBe(false);
    expect(incomplete.blockers.some((b) => /intelligence value/i.test(b))).toBe(
      true,
    );
  });

  it("documents founder and board intelligence foundations", () => {
    expect(FOUNDER_INTELLIGENCE_LEARNING_DOMAINS.length).toBe(6);
    expect(BOARD_INTELLIGENCE_DATA_SOURCES).toContain("Business Canvas data");
    expect(BOARD_INTELLIGENCE_DATA_SOURCES).toContain("Visual Thinking data");
    expect(FUTURE_FIRST_CORE_PRINCIPLE.userExperience).toContain("Momentum");
    expect(FUTURE_FIRST_BUILDING_RULE).toMatch(/Do not build future features now/i);
  });
});
