import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  beginDayDesignerFlow,
  buildDayPlan,
  buildSimpleDayPlanView,
  createAdaptiveDayPlan,
  processDayDesignerMessage,
  shouldStartDayDesigner,
} from "./index";
import { evaluatePlanningRules } from "./dayReasoning";
import { gatherDayDesignerContext, isOverloaded } from "./daySignals";
import { buildFounderDayDesignerReport } from "./founderDayDesignerReporting";
import { getDayDesignerStore, saveDayDesignerStore } from "./dayStore";

describe("day designer intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveDayDesignerStore({
      plans: [],
      founderSamples: [],
      activeSession: null,
      dismissedOn: null,
    });
  });

  it("detects plan-my-day trigger phrase", () => {
    expect(shouldStartDayDesigner("Help me plan my day")).toBe(true);
    expect(shouldStartDayDesigner("good morning")).toBe(false);
  });

  it("reduces plan when cognitive load is overloaded", () => {
    const context = gatherDayDesignerContext({
      cognitiveLoadLevel: "overloaded",
      emotionalState: "overwhelmed",
    });
    expect(isOverloaded(context)).toBe(true);
    const rules = evaluatePlanningRules(context, { energy: "medium" });
    expect(rules.find((r) => r.id === "reduce_when_overloaded")?.applied).toBe(
      true,
    );

    const plan = buildDayPlan({
      cognitiveLoadLevel: "overloaded",
      emotionalState: "overwhelmed",
      answers: { availableMinutes: 480, energy: "medium", mustDoToday: "a, b, c, d" },
    });
    expect(plan.suggestedBlocks.length).toBeLessThanOrEqual(4);
    expect(plan.reasoningSummary).toMatch(/small|margin|carrying/i);
  });

  it("offers tiny start when activation is frozen", () => {
    const plan = buildDayPlan({
      activationState: "frozen",
      emotionalState: "stuck",
      answers: { energy: "medium", mustDoToday: "Finish proposal" },
    });
    expect(
      plan.suggestedBlocks.some((b) => /starter|10-minute/i.test(b.title)),
    ).toBe(true);
  });

  it("builds simple plan view without large schedule", () => {
    const plan = buildDayPlan({
      emotionalState: "building",
      answers: {
        energy: "high",
        mustDoToday: "Write newsletter, Reply to client",
      },
    });
    const view = buildSimpleDayPlanView(plan);
    expect(view.todaysFocus.length).toBeGreaterThan(3);
    expect(view.firstStep.length).toBeGreaterThan(3);
    expect(view.canWait.length).toBeGreaterThan(0);
    expect(view.recoveryMargin).toBeTruthy();
    expect(view.adhdSupportTips.length).toBeGreaterThan(0);
  });

  it("walks one question at a time through the flow", () => {
    let session = beginDayDesignerFlow(new Date("2026-06-12T09:00:00.000Z"));
    expect(session.step).toBe("time");

    let result = processDayDesignerMessage(session, "about 3 hours");
    expect(result.session.step).toBe("energy");
    expect(result.question).toMatch(/energy/i);

    result = processDayDesignerMessage(result.session, "medium");
    expect(result.session.step).toBe("environment");

    result = processDayDesignerMessage(result.session, "quiet home");
    expect(result.session.step).toBe("priorities");

    result = processDayDesignerMessage(
      result.session,
      "Write blog post, send invoice",
      { emotionalState: "focused" },
    );
    expect(result.plan).not.toBeNull();
    expect(result.plan?.priorities.length).toBeGreaterThan(0);
    expect(getDayDesignerStore().plans.length).toBe(1);
  });

  it("uses non-shaming language in reasoning", () => {
    const plan = buildDayPlan({
      emotionalState: "overwhelmed",
      cognitiveLoadLevel: "heavy",
      answers: { energy: "low" },
    });
    expect(plan.reasoningSummary).not.toMatch(/fail|lazy|behind/i);
  });

  it("founder report includes planning patterns", () => {
    createAdaptiveDayPlan({
      cognitiveLoadLevel: "overloaded",
      answers: { energy: "low" },
    });
    const report = buildFounderDayDesignerReport(new Date("2026-06-12"));
    expect(report.recommendedFounderAction.length).toBeGreaterThan(10);
  });
});
