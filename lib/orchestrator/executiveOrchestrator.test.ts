import { describe, expect, it, beforeEach } from "vitest";

import {
  calculateROI,
  createInitiative,
  executiveOrchestratorService,
  prepareAssignments,
  prepareAutomationCandidates,
  prepareChecklist,
  prepareImplementation,
  prepareMonitoring,
  resetRuntimeOrchestrator,
  reviewInitiative,
  SAMPLE_EXECUTIVE_INITIATIVES,
  executiveControlPrinciples,
} from "./index";

describe("Executive Orchestrator™", () => {
  beforeEach(() => {
    resetRuntimeOrchestrator();
  });

  it("sample initiatives cover required scenarios", () => {
    expect(SAMPLE_EXECUTIVE_INITIATIVES.length).toBeGreaterThanOrEqual(7);
    const titles = SAMPLE_EXECUTIVE_INITIATIVES.map((i) => i.title.toLowerCase());
    expect(titles.some((t) => t.includes("listening rooms"))).toBe(true);
    expect(titles.some((t) => t.includes("voice"))).toBe(true);
    expect(titles.some((t) => t.includes("workshop"))).toBe(true);
    expect(titles.some((t) => t.includes("pinterest"))).toBe(true);
    expect(titles.some((t) => t.includes("executive brief"))).toBe(true);
    expect(titles.some((t) => t.includes("onboarding"))).toBe(true);
    expect(titles.some((t) => t.includes("companion"))).toBe(true);
  });

  it("creates initiatives via public API", () => {
    const created = createInitiative({
      title: "Test Initiative",
      category: "executive",
      goal: "Test orchestration",
      purpose: "Validate API",
      businessValue: "Architecture",
      expectedOutcome: "Stored",
    });
    expect(created.id).toMatch(/^init-runtime-/);
    expect(executiveOrchestratorService.list().some((i) => i.id === created.id)).toBe(true);
  });

  it("prepares implementation plans as drafts only", () => {
    const impl = prepareImplementation("init-listening-rooms");
    expect(impl?.executivePlan.status).toBe("draft");
    expect(impl?.plans.developmentPlan.length).toBeGreaterThan(0);
    expect(impl?.orchestration.status).toBe("draft");
  });

  it("prepares checklist and assignments", () => {
    const checklist = prepareChecklist("init-voice-companion");
    expect(checklist?.items.length).toBeGreaterThanOrEqual(5);

    const assignments = prepareAssignments("init-workshop-launch");
    expect(assignments.length).toBeGreaterThanOrEqual(2);
    expect(assignments.some((a) => a.assigneeKind === "founder")).toBe(true);
  });

  it("identifies automation candidates and delegation modes", () => {
    const candidates = prepareAutomationCandidates("init-pinterest-strategy");
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.some((c) => c.founderCanPrepare)).toBe(true);
    expect(candidates.some((c) => c.mustShariDo)).toBe(true);

    const summary = executiveOrchestratorService.automationSummary("init-pinterest-strategy");
    expect(summary.prepare + summary.futureAutomation).toBeGreaterThan(0);
  });

  it("calculates ROI with recommendation", () => {
    const result = calculateROI("init-executive-brief");
    expect(result?.roi.founderTimeSavedHours).toBeGreaterThan(0);
    expect(result?.recommendation.length).toBeGreaterThan(10);
  });

  it("prepares monitoring and progress updates", () => {
    const monitoring = prepareMonitoring("init-listening-rooms");
    expect(monitoring?.briefFeedItems.length).toBeGreaterThan(0);

    const updated = executiveOrchestratorService.updateProgress("init-listening-rooms", {
      percentComplete: 72,
    });
    expect(updated?.percentComplete).toBe(72);
  });

  it("reviews initiatives and links decisions", () => {
    const review = reviewInitiative("init-listening-rooms");
    expect(review?.narrative.length).toBeGreaterThan(0);

    const decision = executiveOrchestratorService.linkedDecision("init-voice-companion");
    expect(decision?.id).toBe("ed-voice-companion");
  });

  it("enforces executive control principles", () => {
    const principles = executiveControlPrinciples();
    expect(principles.some((p) => p.includes("explicit approval"))).toBe(true);

    const approval = executiveOrchestratorService.approval("init-voice-companion");
    expect(approval?.blocked).toBe(true);
  });

  it("remembers outcome to institutional memory", () => {
    const stored = executiveOrchestratorService.rememberOutcome("init-listening-rooms");
    expect(stored?.institutionalMemoryId).toMatch(/^mem-runtime-/);
  });
});
