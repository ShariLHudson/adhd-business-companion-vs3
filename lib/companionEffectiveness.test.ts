import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildCompanionEffectivenessScore,
  computeLearningStyleEffectiveness,
  getPredictiveRiskFramework,
  getUserOutcomeProfile,
  recordLearningStyleOffer,
  recordPredictiveRiskSignal,
  recordUserOutcome,
  resetEffectivenessForTests,
} from "./companionEffectiveness";
import { seedInterventionLearningDemoData } from "./companionInterventionLearning";

describe("companionEffectiveness", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    resetEffectivenessForTests();
  });

  it("records user outcomes across categories", () => {
    recordUserOutcome({
      category: "actions",
      label: "Published LinkedIn post",
      businessType: "post_published",
      interventionId: "create_workspace",
    });
    recordUserOutcome({
      category: "confidence",
      label: "Posted despite fear",
      interventionId: "visibility_support",
    });

    const profile = getUserOutcomeProfile();
    expect(profile.outcomes.length).toBe(2);
    expect(profile.mostSuccessfulInterventions).toContain("create_workspace");
  });

  it("measures learning style by action not preference alone", () => {
    for (let i = 0; i < 10; i++) {
      recordLearningStyleOffer({ style: "visual", accepted: i < 7, completed: i < 3 });
    }
    for (let i = 0; i < 10; i++) {
      recordLearningStyleOffer({
        style: "conversational",
        accepted: true,
        completed: i < 8,
      });
    }

    const styles = computeLearningStyleEffectiveness();
    const visual = styles.find((s) => s.style === "visual")!;
    const conversational = styles.find((s) => s.style === "conversational")!;

    expect(visual.acceptanceRate).toBe(70);
    expect(visual.completionRate).toBeLessThan(50);
    expect(conversational.acceptanceRate).toBe(100);
    expect(conversational.completionRate).toBe(80);
    expect(conversational.actionRate).toBeGreaterThan(visual.actionRate);
  });

  it("buildCompanionEffectivenessScore aggregates dimensions", () => {
    seedInterventionLearningDemoData();
    recordUserOutcome({
      category: "momentum",
      label: "Returned after stall",
      interventionId: "clear_my_mind",
    });
    recordUserOutcome({
      category: "decisions",
      label: "Chose workshop pricing",
      businessType: "decision_made",
    });

    const score = buildCompanionEffectivenessScore();
    expect(score.overall).toBeGreaterThan(50);
    expect(score.dimensions.interventionSuccess).toBeGreaterThan(50);
    expect(score.dimensions.businessMovement).toBeGreaterThan(45);
    expect(score.passed).toBe(true);
  });

  it("stores predictive risk framework without predicting", () => {
    recordPredictiveRiskSignal("burnoutRisk");
    recordPredictiveRiskSignal("visibilityAvoidanceRisk");
    const framework = getPredictiveRiskFramework();
    expect(framework.burnoutRisk.enabled).toBe(false);
    expect(framework.burnoutRisk.signalCount).toBe(1);
    expect(framework.visibilityAvoidanceRisk.signalCount).toBe(1);
  });

  it("updates user outcome profile summaries", () => {
    recordUserOutcome({
      category: "completions",
      label: "Finished launch checklist",
      interventionId: "plan_my_day",
    });
    const profile = getUserOutcomeProfile();
    expect(profile.mostSuccessfulInterventions[0]).toBe("plan_my_day");
  });
});
