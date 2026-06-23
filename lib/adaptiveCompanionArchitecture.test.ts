import { describe, expect, it } from "vitest";
import {
  ADAPTIVE_COMPANION_LAYERS,
  evaluateArchitectureHealth,
  formatArchitectureHealthText,
  getArchitectureLayer,
  getBehavioralCategoryIds,
  validateFutureFeature,
} from "./adaptiveCompanionArchitecture";
import { ALL_VALIDATION_SCENARIOS } from "./companionValidationScenarios";

describe("adaptiveCompanionArchitecture", () => {
  it("registers all eight trademark layers", () => {
    expect(ADAPTIVE_COMPANION_LAYERS.length).toBe(8);
    const ids = ADAPTIVE_COMPANION_LAYERS.map((l) => l.id);
    expect(ids).toContain("user_intelligence");
    expect(ids).toContain("behavioral_intelligence");
    expect(ids).toContain("intervention_intelligence");
    expect(ids).toContain("trust_relationship_intelligence");
    expect(ids).toContain("predictive_intelligence");
    expect(ids).toContain("ecosystem_intelligence");
    expect(ids).toContain("board_intelligence");
    expect(ids).toContain("continuous_learning");
  });

  it("derives behavioral categories from scenario data, not hardcoded lists", () => {
    const categories = getBehavioralCategoryIds();
    expect(categories.length).toBeGreaterThanOrEqual(10);
    expect(categories).toContain("visibility_marketing");
    expect(categories).toContain("sales_conversations");

    const health = evaluateArchitectureHealth();
    const sum = Object.values(health.behavioralCategories).reduce((a, b) => a + b, 0);
    expect(sum).toBe(ALL_VALIDATION_SCENARIOS.length);
    expect(health.behavioralScenarioCount).toBeGreaterThanOrEqual(47);
  });

  it("future feature gate rejects incomplete proposals", () => {
    const rejected = validateFutureFeature({
      improvesUserOutcomes: true,
      improvesTrust: true,
      improvesConfidence: false,
      reducesFriction: true,
      improvesMomentum: true,
      fitsOneCompanionPhilosophy: true,
      evolvesWithoutArchitecturalDebt: true,
    });
    expect(rejected.approved).toBe(false);
    expect(rejected.blockers).toContain("Does it improve confidence?");

    const approved = validateFutureFeature({
      improvesUserOutcomes: true,
      improvesTrust: true,
      improvesConfidence: true,
      reducesFriction: true,
      improvesMomentum: true,
      fitsOneCompanionPhilosophy: true,
      evolvesWithoutArchitecturalDebt: true,
    });
    expect(approved.approved).toBe(true);
    expect(approved.blockers).toHaveLength(0);
  });

  it("health snapshot is observable and formatted", () => {
    const snapshot = evaluateArchitectureHealth();
    expect(snapshot.layers.length).toBe(8);
    expect(snapshot.fragmentationRisks.length).toBeGreaterThan(0);
    expect(snapshot.unificationPriorities.length).toBeGreaterThan(0);

    const text = formatArchitectureHealthText(snapshot);
    expect(text).toMatch(/Adaptive Companion Architecture/);
    expect(text).toMatch(/visibility_marketing/);
  });

  it("each layer documents modularity requirements", () => {
    for (const layer of ADAPTIVE_COMPANION_LAYERS) {
      expect(layer.canonicalModules.length).toBeGreaterThan(0);
      expect(layer.modularity).toBeGreaterThanOrEqual(1);
      expect(layer.modularity).toBeLessThanOrEqual(5);
      expect(getArchitectureLayer(layer.id)).toBe(layer);
    }
  });
});
