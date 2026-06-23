import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  computeInterventionEffectiveness,
  computeLearningStyleScores,
  getRelationshipMemory,
  syncRelationshipMemoryFromThread,
  updateRelationshipMemory,
} from "./companionAdaptiveUserEngine";
import {
  confidenceEngineHintForChat,
  countConfidenceWinsSince,
  recordConfidenceWin,
} from "./companionConfidenceEngine";
import {
  buildSprint5Intelligence,
  sprint5HintsForChat,
} from "./companionSprint5Intelligence";
import {
  buildTrustSnapshot,
  explainRecommendationHint,
  trustEngineHintForChat,
} from "./companionTrustEngine";

describe("companionSprint5Intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
  });

  it("records and surfaces confidence wins", () => {
    recordConfidenceWin({ kind: "task_completed", label: "Finished registration page" });
    recordConfidenceWin({ kind: "decision_made", label: "Chose workshop date" });
    expect(countConfidenceWinsSince(7)).toBe(2);
    const hint = confidenceEngineHintForChat();
    expect(hint).toMatch(/Evidence you may reference/i);
    expect(hint).toMatch(/registration page|followed through/i);
  });

  it("explains recommendations for trust", () => {
    const line = explainRecommendationHint({
      featureLabel: "Clear My Mind",
      friction: "cognitive overload",
    });
    expect(line).toMatch(/Clear My Mind/i);
    expect(line).toMatch(/cognitive overload/i);
  });

  it("trust hint includes follow-through and memory", () => {
    const hint = trustEngineHintForChat({
      snapshot: buildTrustSnapshot(),
      outcomeThread: {
        currentProblem: "workshop launch",
        pendingAction: "Open Clear My Mind",
        updatedAt: new Date().toISOString(),
      },
      recommendationExplanation: explainRecommendationHint({
        featureLabel: "Clear My Mind",
        friction: "too much on your mind",
      }),
    });
    expect(hint).toMatch(/TRUST ENGINE/i);
    expect(hint).toMatch(/workshop launch/i);
    expect(hint).toMatch(/NEVER reset/i);
  });

  it("syncs relationship memory from outcome thread", () => {
    syncRelationshipMemoryFromThread({
      currentGoal: "Launch workshop",
      currentProblem: "overwhelmed by tasks",
      updatedAt: new Date().toISOString(),
    });
    const mem = getRelationshipMemory();
    expect(mem.goals[0]).toMatch(/Launch workshop/i);
    expect(mem.challenges[0]).toMatch(/overwhelmed/i);
  });

  it("computes learning style scores", () => {
    const scores = computeLearningStyleScores();
    expect(scores.length).toBe(5);
    expect(scores[0]?.id).toBeTruthy();
  });

  it("builds sprint5 bundle with all three hints", () => {
    updateRelationshipMemory({ goals: ["Grow coaching practice"] });
    recordConfidenceWin({ kind: "momentum_progress", label: "Shipped newsletter" });
    const bundle = buildSprint5Intelligence({
      outcomeThread: {
        currentProblem: "marketing plan",
        updatedAt: new Date().toISOString(),
      },
      featureLabel: "Plan My Day",
      frictionLabel: "decision fatigue",
    });
    const merged = sprint5HintsForChat(bundle);
    expect(merged).toMatch(/TRUST ENGINE/i);
    expect(merged).toMatch(/CONFIDENCE ENGINE/i);
    expect(merged).toMatch(/ADAPTIVE USER INTELLIGENCE/i);
    expect(merged).toMatch(/Plan My Day/i);
  });

  it("intervention effectiveness returns empty without audit data", () => {
    expect(computeInterventionEffectiveness()).toEqual([]);
  });
});
