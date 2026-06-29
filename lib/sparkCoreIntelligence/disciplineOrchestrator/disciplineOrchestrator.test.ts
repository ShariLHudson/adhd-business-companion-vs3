import { describe, expect, it, beforeEach } from "vitest";

import {
  clearActivationLog,
  runExecutiveDisciplineOrchestrator,
  selectExecutiveDisciplines,
} from "./disciplineOrchestrator";

describe("Spark Core Executive Discipline Orchestrator v1.0", () => {
  const base = {
    turnId: "t1",
    threadId: "thread-1",
    memberMessage: "",
  };

  beforeEach(() => {
    clearActivationLog();
  });

  it("activates marketing campaign pack", () => {
    const result = runExecutiveDisciplineOrchestrator({
      ...base,
      memberMessage: "Help me plan a marketing campaign for my coaching offer.",
    });

    expect(result.ingress.scenario).toBe("marketing_campaign");
    expect(result.ingress.selectedDisciplines).toEqual([
      "marketing",
      "business-strategy",
      "wordsmith",
      "creative-direction",
    ]);
    expect(result.egress.unified.text).toBeTruthy();
    expect(result.egress.rawContributions).toBeUndefined();
  });

  it("activates pricing pack with internal conflict resolution", () => {
    const result = runExecutiveDisciplineOrchestrator({
      ...base,
      memberMessage: "Should I raise my pricing on the group program?",
    });

    expect(result.ingress.scenario).toBe("pricing_decision");
    expect(result.ingress.selectedDisciplines).toContain("finance");
    expect(result.ingress.selectedDisciplines).toContain("marketing");
    expect(result.internal.conflicts.length).toBeGreaterThan(0);
    expect(result.egress.unified.tradeoffNote).toBeTruthy();
    expect(result.egress.unified.text).toMatch(/test|margin/i);
  });

  it("activates sales call pack", () => {
    const result = runExecutiveDisciplineOrchestrator({
      ...base,
      memberMessage: "I have a sales call tomorrow — help me prepare.",
    });

    expect(result.ingress.scenario).toBe("sales_call");
    expect(result.ingress.selectedDisciplines).toEqual([
      "sales",
      "research",
      "wordsmith",
      "customer-experience",
    ]);
  });

  it("overwhelm uses conversation and focus support only", () => {
    const result = runExecutiveDisciplineOrchestrator({
      ...base,
      memberMessage: "I'm completely overwhelmed and can't think straight.",
      emotionalState: "overwhelmed",
    });

    expect(result.ingress.scenario).toBe("overwhelm_support");
    expect(result.ingress.selectedDisciplines).toEqual([]);
    expect(result.ingress.supportModes).toContain("conversation");
    expect(result.ingress.supportModes).toContain("focus_support");
    expect(result.egress.unified.text).toMatch(/one small piece|single next step/i);
  });

  it("activates launch pack without exceeding cap", () => {
    const result = runExecutiveDisciplineOrchestrator({
      ...base,
      memberMessage: "We're two weeks from product launch — what should I prioritize?",
    });

    expect(result.ingress.scenario).toBe("launch");
    expect(result.ingress.selectedDisciplines.length).toBeLessThanOrEqual(6);
    expect(result.ingress.selectedDisciplines).toContain("operations");
    expect(result.ingress.debateRequired).toBe(true);
  });

  it("research uses observatory and adds strategy when decision needed", () => {
    const researchOnly = runExecutiveDisciplineOrchestrator({
      ...base,
      memberMessage: "Research competitor pricing in the executive coaching market.",
    });
    expect(researchOnly.ingress.scenario).toBe("research");
    expect(researchOnly.ingress.estateSupport).toBe("observatory");
    expect(researchOnly.ingress.selectedDisciplines).toEqual(["research"]);

    const withDecision = selectExecutiveDisciplines(
      "Research the market and recommend which offer I should lead with.",
    );
    expect(withDecision.disciplines).toContain("research");
    expect(withDecision.disciplines).toContain("business-strategy");
  });

  it("never exposes raw disciplines unless requested", () => {
    const hidden = runExecutiveDisciplineOrchestrator({
      ...base,
      memberMessage: "Help me plan a marketing campaign.",
    });
    expect(hidden.egress.rawContributions).toBeUndefined();

    const exposed = runExecutiveDisciplineOrchestrator({
      ...base,
      memberMessage: "Help me plan a marketing campaign.",
      exposeDisciplines: true,
    });
    expect(exposed.egress.rawContributions?.length).toBeGreaterThan(0);
  });

  it("logs activation and scores discipline performance", () => {
    const result = runExecutiveDisciplineOrchestrator({
      ...base,
      memberMessage: "Should I raise my pricing?",
    });

    expect(result.internal.activationLog.activated.length).toBeGreaterThan(0);
    expect(result.internal.activationLog.skipped.length).toBeGreaterThan(0);
    expect(result.internal.performanceScores.length).toBe(
      result.ingress.selectedDisciplines.length,
    );
    expect(result.internal.performanceScores[0].relevanceScore).toBeGreaterThan(0);
  });

  it("simple questions activate no disciplines", () => {
    const result = runExecutiveDisciplineOrchestrator({
      ...base,
      memberMessage: "What is churn rate?",
    });

    expect(result.ingress.scenario).toBe("simple_question");
    expect(result.ingress.selectedDisciplines).toEqual([]);
  });

  it("runs executive debate internally for multi-discipline decisions", () => {
    const result = runExecutiveDisciplineOrchestrator({
      ...base,
      memberMessage: "Should I raise my pricing on the flagship offer?",
    });

    expect(result.internal.debateRounds?.length).toBeGreaterThan(0);
    expect(result.egress.unified.text).not.toContain("Finance says");
  });
});
