import { describe, expect, it } from "vitest";

import {
  assessSparkEstateProjectIntelligenceNeeds,
  assessSparkEstateProjectLifecycleCompliance,
  buildSparkEstateProjectLifecycleView,
  detectSparkEstateProjectCapture,
  formatSparkEstateProjectLifecycleReport,
  inferSparkEstateProjectLifecycleStage,
  resolveSparkEstateProjectEntryPoint,
  SPARK_ESTATE_PROJECT_ADHD_RULES,
  SPARK_ESTATE_PROJECT_LIFECYCLE_PRINCIPLE,
  SPARK_ESTATE_PROJECT_LIFECYCLE_STAGES,
  SPARK_ESTATE_PROJECT_LIFECYCLE_SUCCESS_JOURNEY,
  SPARK_ESTATE_PROJECT_NEXT_STEP_QUESTION,
  startSparkEstateProjectFromCapture,
  verifySparkEstateIntelligentProjectLifecycleEngine,
} from "./sparkEstateIntelligentProjectLifecycleEngine";

describe("sparkEstateIntelligentProjectLifecycleEngine", () => {
  it("defines eight lifecycle stages and the success journey", () => {
    expect(SPARK_ESTATE_PROJECT_LIFECYCLE_STAGES).toHaveLength(8);
    expect(SPARK_ESTATE_PROJECT_LIFECYCLE_PRINCIPLE).toContain("not just a task list");
    expect(SPARK_ESTATE_PROJECT_LIFECYCLE_SUCCESS_JOURNEY.from).toContain(
      "create something",
    );
    expect(SPARK_ESTATE_PROJECT_LIFECYCLE_SUCCESS_JOURNEY.to).toContain(
      "completed something valuable",
    );
    expect(SPARK_ESTATE_PROJECT_NEXT_STEP_QUESTION).toBe("What do I do next?");
  });

  it("captures project ideas from spec examples", () => {
    for (const example of SPARK_ESTATE_PROJECT_LIFECYCLE_STAGES[0].examples) {
      expect(detectSparkEstateProjectCapture(example).isProject).toBe(true);
    }
    expect(detectSparkEstateProjectCapture("How is your day?").isProject).toBe(false);
  });

  it("builds a lifecycle view with milestones and ADHD guidance", () => {
    const view = buildSparkEstateProjectLifecycleView({
      text: "I need to create a course.",
    });
    expect(view.currentStage).toBe("capture");
    expect(view.milestones.length).toBeGreaterThan(2);
    expect(view.entryPoint).toContain("Chamber");
    expect(view.recommendedCards.length).toBeGreaterThanOrEqual(0);
    expect(view.adhdGuidance).toContain("one next step");
  });

  it("supports multi-intelligence sales funnel projects", () => {
    const needs = assessSparkEstateProjectIntelligenceNeeds("I need a sales funnel.");
    expect(needs).toContain("Marketing Intelligence");
    expect(needs).toContain("Content Intelligence");
    expect(needs).toContain("Project Intelligence");
    expect(needs).toContain("Momentum Intelligence");
    expect(resolveSparkEstateProjectEntryPoint({
      text: "I need to plan my workshop.",
    })).toContain("Chamber");
  });

  it("bridges chamber project engine and infers build stage for active projects", () => {
    const project = startSparkEstateProjectFromCapture({
      name: "Client onboarding",
      desiredOutcome: "Create a reusable client onboarding process",
      whyItMatters: "Save time with every new client",
      nextAction: "List the five steps a new client experiences",
    });
    expect(project.status).toBe("active-focus");
    expect(inferSparkEstateProjectLifecycleStage({ project })).toBe("build");
    expect(SPARK_ESTATE_PROJECT_ADHD_RULES).toHaveLength(4);
  });

  it("verifies lifecycle compliance and formats a readable report", () => {
    const verification = verifySparkEstateIntelligentProjectLifecycleEngine();
    const compliance = assessSparkEstateProjectLifecycleCompliance();
    expect(verification.stages).toBe(8);
    expect(verification.lifecycleReady).toBe(true);
    expect(verification.captureReady).toBe(true);
    expect(compliance.chamberEngineBridgeReady).toBe(true);
    expect(compliance.completionBridgeReady).toBe(true);

    const report = formatSparkEstateProjectLifecycleReport();
    expect(report).toContain("Lifecycle stages");
    expect(report).toContain("Project cards");
    expect(report).toContain("Compliance checks");
  });
});
