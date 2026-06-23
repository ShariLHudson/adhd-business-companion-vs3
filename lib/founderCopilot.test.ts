import { beforeEach, describe, expect, it, vi } from "vitest";
import { captureBehaviorEvent, resetClosedLoopLearningForTests } from "./closedLoopLearning";
import {
  recordInterventionLifecycle,
  resetInterventionLearningForTests,
} from "./companionInterventionLearning";
import { resetMistakeRecoveryForTests } from "./companionMistakeRecovery";
import type { FounderWarning } from "./founderEarlyWarning";
import {
  buildFounderCopilotOutput,
  computeSeverityScore,
  diagnoseWarning,
  generateFounderFixPrompt,
  generateFounderFixPromptFromWarning,
  prioritizeFounderIssues,
  priorityFromSeverity,
} from "./founderCopilot";

function sampleWarning(overrides?: Partial<FounderWarning>): FounderWarning {
  return {
    id: "warn-test-1",
    category: "high",
    title: "Decision Compass repeatedly failing",
    summary: "Recommended 12×, dismissed 10×, completed 0.",
    metric: "intervention_failure",
    interventionId: "decision_compass",
    detectedAt: new Date().toISOString(),
    trustImpact: 20,
    confidenceImpact: 15,
    retentionImpact: 18,
    businessImpact: 12,
    usersAffected: 12,
    ...overrides,
  };
}

describe("founderCopilot", () => {
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

  it("diagnoses intervention failure with high confidence", () => {
    const diagnosis = diagnoseWarning(sampleWarning());
    expect(diagnosis.whatHappened).toContain("dismissed");
    expect(diagnosis.whyItHappened.length).toBeGreaterThan(0);
    expect(diagnosis.confidence).toBe("high");
    expect(diagnosis.recommendedAction).toContain("Suppress");
    expect(diagnosis.consequenceOfInaction.length).toBeGreaterThan(10);
  });

  it("scores severity and assigns priority", () => {
    const warning = sampleWarning({
      category: "critical",
      trustImpact: 30,
      retentionImpact: 30,
      confidenceImpact: 25,
      businessImpact: 25,
      usersAffected: 20,
    });
    const score = computeSeverityScore(warning);
    expect(score).toBeGreaterThanOrEqual(60);
    expect(priorityFromSeverity(score)).toMatch(/critical|high/);
  });

  it("builds copilot output with files and systems", () => {
    const warning = sampleWarning();
    const diagnosis = diagnoseWarning(warning);
    const output = buildFounderCopilotOutput(warning, diagnosis);
    expect(output.filesToReview.length).toBeGreaterThan(0);
    expect(output.relatedSystems).toContain("Decision Compass");
    expect(output.confidencePercent).toBeGreaterThan(50);
  });

  it("prioritizes issues by severity score", () => {
    const low = sampleWarning({
      id: "low",
      trustImpact: 5,
      category: "medium",
    });
    const high = sampleWarning({
      id: "high",
      trustImpact: 28,
      category: "critical",
    });
    const ranked = prioritizeFounderIssues([low, high]);
    expect(ranked[0]?.warning.id).toBe("high");
    expect(ranked[0]?.severityScore).toBeGreaterThan(ranked[1]?.severityScore ?? 0);
  });

  it("generates paste-ready Cursor fix prompt", () => {
    const warning = sampleWarning();
    const [item] = prioritizeFounderIssues([warning]);
    const prompt = generateFounderFixPrompt(item!);
    expect(prompt.title).toContain("Fix:");
    expect(prompt.markdown).toContain("## Problem");
    expect(prompt.markdown).toContain("## Files To Review");
    expect(prompt.markdown).toContain("## Success Criteria");
    expect(prompt.markdown).toContain("decision_compass");
  });

  it("generates fix prompt from warning directly", () => {
    const prompt = generateFounderFixPromptFromWarning(
      sampleWarning({ metric: "workspace_abandoned", title: "Workspace abandonment rising" }),
    );
    expect(prompt.markdown).toContain("workspace_abandoned");
    expect(prompt.markdown).toContain("## Recommended Action");
  });

  it("detects wrong routing diagnosis for dismissal spikes", () => {
    for (let i = 0; i < 5; i++) {
      captureBehaviorEvent({
        capability: "clear_my_mind",
        eventType: "offer_dismissed",
      });
    }
    const diagnosis = diagnoseWarning(
      sampleWarning({
        metric: "offer_dismissed",
        title: "High offer dismissal volume",
        interventionId: undefined,
      }),
    );
    expect(diagnosis.recommendedAction.toLowerCase()).toContain("conversation");
  });

  it("links repeated failures to intervention lifecycle data", () => {
    for (let i = 0; i < 6; i++) {
      recordInterventionLifecycle({
        interventionId: "decision_compass",
        stage: "recommended",
      });
      recordInterventionLifecycle({
        interventionId: "decision_compass",
        stage: "dismissed",
      });
    }
    const diagnosis = diagnoseWarning(sampleWarning());
    expect(diagnosis.confidencePercent).toBeGreaterThanOrEqual(80);
  });
});
