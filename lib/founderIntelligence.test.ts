import { beforeEach, describe, expect, it, vi } from "vitest";
import { captureBehaviorEvent, resetClosedLoopLearningForTests } from "./closedLoopLearning";
import {
  recordInterventionLifecycle,
  resetInterventionLearningForTests,
} from "./companionInterventionLearning";
import {
  recordMistake,
  resetMistakeRecoveryForTests,
} from "./companionMistakeRecovery";
import { ecosystemEventTracker } from "./ecosystem/eventTrackingEngine";
import {
  buildCompanionAccuracyHealth,
  buildFounderIntelligenceDashboard,
  buildRetentionRiskProfile,
  buildTrustHealth,
} from "./founderIntelligence";
import { buildEarlyWarnings, detectEmergingProblems } from "./founderEarlyWarning";

describe("founderIntelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    resetClosedLoopLearningForTests();
    resetInterventionLearningForTests();
    resetMistakeRecoveryForTests();
  });

  it("builds trust health from repair profile", () => {
    recordMistake({
      signalKind: "explicit_correction",
      misunderstanding: "wrong_intervention",
      userText: "That's not what I meant",
      interventionId: "decision_compass",
    });
    const health = buildTrustHealth();
    expect(health.trustLosses).toBeGreaterThan(0);
    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);
  });

  it("tracks companion accuracy from corrections", () => {
    recordMistake({
      signalKind: "explicit_correction",
      misunderstanding: "wrong_problem",
      userText: "You're missing the point",
    });
    captureBehaviorEvent({
      capability: "decision_compass",
      eventType: "offer_shown",
    });
    const accuracy = buildCompanionAccuracyHealth();
    expect(accuracy.explicitCorrections).toBeGreaterThan(0);
    expect(accuracy.score).toBeLessThan(100);
  });

  it("detects emerging dismissal problems", () => {
    for (let i = 0; i < 6; i++) {
      captureBehaviorEvent({
        capability: "decision_compass",
        eventType: "offer_dismissed",
      });
    }
    const emerging = detectEmergingProblems();
    expect(emerging.some((w) => w.title.includes("dismissal") || w.metric === "offer_dismissed")).toBe(
      true,
    );
  });

  it("flags repeated intervention failure in early warnings", () => {
    for (let i = 0; i < 8; i++) {
      recordInterventionLifecycle({
        interventionId: "decision_compass",
        stage: "recommended",
      });
      recordInterventionLifecycle({
        interventionId: "decision_compass",
        stage: "dismissed",
      });
    }
    const warnings = buildEarlyWarnings();
    expect(
      warnings.some(
        (w) =>
          w.interventionId === "decision_compass" ||
          w.title.includes("Decision Compass"),
      ),
    ).toBe(true);
  });

  it("builds retention risk profile with churn predictors", () => {
    for (let i = 0; i < 4; i++) {
      captureBehaviorEvent({
        capability: "clear_my_mind",
        eventType: "workspace_abandoned",
      });
    }
    const risk = buildRetentionRiskProfile();
    expect(risk.repeatedAbandonment).toBeGreaterThanOrEqual(4);
    expect(risk.churnPredictors.length).toBeGreaterThan(0);
  });

  it("builds full founder intelligence dashboard", () => {
    ecosystemEventTracker.track({
      userId: "local-user",
      eventType: "user.active",
      feature: "user",
    });
    recordMistake({
      signalKind: "frustration",
      misunderstanding: "wrong_intervention",
      userText: "Stop suggesting that",
      interventionId: "decision_compass",
    });

    const dashboard = buildFounderIntelligenceDashboard();
    expect(dashboard.ecosystemHealthScore).toBeGreaterThanOrEqual(0);
    expect(dashboard.trustScore).toBeDefined();
    expect(dashboard.companionAccuracyScore).toBeDefined();
    expect(dashboard.selfImprovementReadiness.safeForAutoOptimization).toContain(
      "recommendation_weighting",
    );
    expect(dashboard.selfImprovementReadiness.founderApprovalRequired).toContain(
      "system_prompts",
    );
    expect(dashboard.founderPriorities.length).toBeGreaterThanOrEqual(0);
    expect(dashboard.misfireProfile).toBeDefined();
  });
});
