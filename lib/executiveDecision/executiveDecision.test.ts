import { describe, expect, it, beforeEach } from "vitest";

import {
  compareOptions,
  createDecision,
  executiveDecisionService,
  prepareApproval,
  prepareImplementation,
  prepareMonitoring,
  recommendOption,
  rememberOutcome,
  resetRuntimeExecutiveDecisions,
  reviewDecision,
  SAMPLE_DECISION_RELATIONSHIPS,
  SAMPLE_EXECUTIVE_DECISIONS,
  executiveControlSummary,
} from "./index";

describe("Executive Decision Lifecycle", () => {
  beforeEach(() => {
    resetRuntimeExecutiveDecisions();
  });

  it("sample decisions cover Listening Rooms scenarios", () => {
    expect(SAMPLE_EXECUTIVE_DECISIONS.length).toBeGreaterThanOrEqual(6);
    expect(SAMPLE_DECISION_RELATIONSHIPS.length).toBeGreaterThanOrEqual(4);

    const mission = executiveDecisionService.sampleRepository().forMission("listening-rooms");
    expect(mission.length).toBeGreaterThanOrEqual(5);
    expect(mission.some((d) => d.question.includes("Voice Companion"))).toBe(true);
    expect(mission.some((d) => d.question.includes("workshop"))).toBe(true);
    expect(mission.some((d) => d.question.includes("automate"))).toBe(true);
    expect(mission.some((d) => d.question.includes("launch"))).toBe(true);
  });

  it("creates decisions and advances lifecycle metadata", () => {
    const created = createDecision({
      title: "Test decision",
      question: "Should we test?",
      category: "executive",
      opportunity: "Validate lifecycle API.",
      whyItMatters: "Architecture test.",
    });
    expect(created.id).toMatch(/^ed-runtime-/);
    expect(created.currentStep).toBe("discover");
    expect(executiveDecisionService.lifecycle(created.id)?.percentComplete).toBeGreaterThan(0);
  });

  it("compares options with criteria matrix", () => {
    const comparison = compareOptions("ed-voice-companion");
    expect(comparison).not.toBeNull();
    expect(comparison!.options.length).toBe(3);
    expect(comparison!.summary).toContain("Compared");
  });

  it("recommends one option with plain-English guidance", () => {
    const rec = recommendOption("ed-voice-companion");
    expect(rec).not.toBeNull();
    expect(rec!.recommendedOptionId).toBe("opt-voice-limited");
    expect(rec!.why.length).toBeGreaterThan(10);

    const guidance = executiveDecisionService.founderGuidance("ed-voice-companion");
    expect(guidance?.options.length).toBe(3);
    expect(guidance?.recommendation).toContain("Limited voice");
  });

  it("prepares plan and implementation as drafts only", () => {
    const plan = executiveDecisionService.preparePlan("ed-launch-workshop");
    expect(plan?.status).toBe("draft");
    expect(plan?.missionUpdates.length).toBeGreaterThan(0);

    const impl = prepareImplementation("ed-automate-onboarding");
    expect(impl?.status).toBe("awaiting_approval");
    expect(impl?.phases[0].tasks.every((t) => t.status === "draft")).toBe(true);
  });

  it("enforces approval flow and executive control principle", () => {
    const stages = prepareApproval("ed-automate-onboarding");
    const founderStage = stages.find((s) => s.requiresExplicitApproval);
    expect(founderStage?.status).toBe("pending");
    expect(founderStage?.blockedActions).toContain("send_communications");
    expect(executiveDecisionService.isBlocked("ed-automate-onboarding")).toBe(true);

    const principles = executiveControlSummary();
    expect(principles.some((p) => p.includes("Founder may NOT"))).toBe(true);
  });

  it("prepares monitoring and review", () => {
    const monitoring = prepareMonitoring("ed-lr-estate-scene");
    expect(monitoring?.checkpoints.length).toBeGreaterThan(0);
    expect(monitoring?.metrics.length).toBeGreaterThan(0);

    const review = reviewDecision("ed-launch-now-or-wait");
    expect(review?.worked).toBe(true);
    expect(review?.narrative.length).toBeGreaterThan(0);
  });

  it("remembers outcome into institutional memory", () => {
    const stored = rememberOutcome("ed-launch-now-or-wait");
    expect(stored).not.toBeNull();
    expect(stored!.institutionalMemoryId).toMatch(/^mem-runtime-/);
    expect(stored!.graphNodeIds.length).toBeGreaterThan(0);
  });
});
