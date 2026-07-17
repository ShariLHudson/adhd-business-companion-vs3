import { beforeEach, describe, expect, it, vi } from "vitest";

const memory = new Map<string, string>();

vi.stubGlobal("localStorage", {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memory.set(key, value);
  },
  removeItem: (key: string) => {
    memory.delete(key);
  },
  clear: () => memory.clear(),
});

import { parseMindCapture } from "./morningConversation";
import {
  buildCompleteDayPlan,
  clearPlanWorkflowStateForTests,
  detectErrandTask,
  estimateTaskMinutes,
  loadPlanWorkflowState,
  savePlanWorkflowState,
} from "./completePlanWorkflow";
import type { PlanDayItem } from "./types";

function item(id: string, title: string): PlanDayItem {
  return {
    id,
    title,
    column: "today",
    done: false,
  };
}

describe("complete Plan My Day workflow (125–127)", () => {
  beforeEach(() => {
    memory.clear();
    clearPlanWorkflowStateForTests();
  });

  it("parses comma and semicolon lists into separate tasks", () => {
    expect(
      parseMindCapture(
        "work on adhd app, pick up groceries/meds, water plants",
      ),
    ).toEqual([
      "work on adhd app",
      "pick up groceries/meds",
      "water plants",
    ]);
    expect(parseMindCapture("Email Sam; water plants")).toEqual([
      "Email Sam",
      "water plants",
    ]);
  });

  it("preserves original wording without inventing Other", () => {
    const parts = parseMindCapture(
      "work on adhd app, pick up groceries/meds, water plants",
    );
    expect(parts.join(" ")).not.toMatch(/Other/i);
    expect(parts[1]).toContain("groceries");
  });

  it("recognizes errands and estimates effort bands", () => {
    expect(detectErrandTask("pick up groceries/meds")).toBe(true);
    expect(detectErrandTask("work on adhd app")).toBe(false);
    expect(estimateTaskMinutes("water plants")).toBe(15);
    expect(estimateTaskMinutes("work on adhd app")).toBe(60);
    expect(estimateTaskMinutes("pick up groceries/meds")).toBe(45);
  });

  it("builds a plan with primary focus, order, first step, and parking when overloaded", () => {
    const items = [
      item("1", "work on adhd app"),
      item("2", "pick up groceries/meds"),
      item("3", "water plants"),
      item("4", "rewrite the website homepage"),
      item("5", "file taxes paperwork"),
    ];
    const plan = buildCompleteDayPlan({
      items,
      availableMinutes: 90,
      energy: "low",
      motivation: "low",
      planningStyle: "gentle",
    });
    expect(plan.primaryOutcomeId).toBeTruthy();
    expect(plan.orderedTaskIds.length).toBeGreaterThan(0);
    expect(plan.orderedTaskIds.length).toBeLessThanOrEqual(3);
    expect(plan.firstStepText).toMatch(/Open|Begin|Do|Gather/i);
    expect(plan.secondaryOutcomeIds.length).toBeLessThanOrEqual(2);
    expect(plan.fitMessage).toBeTruthy();
    expect(plan.styleRecommendation).toMatch(/Gentle|Balanced|Focused/i);
    expect(plan.primaryReason).toBeTruthy();
    expect(plan.effortById[plan.primaryOutcomeId!]).toBeTruthy();
    expect(plan.priorityBandById[plan.primaryOutcomeId!]).toBe("highest");
    expect(plan.energyFitById["5"]).toBe("low");
    expect(plan.recommendedView).toBeTruthy();
  });

  it("builds a flexible plan when time/energy/motivation are omitted", () => {
    const plan = buildCompleteDayPlan({
      items: [item("1", "email Sam"), item("2", "work on strategy")],
    });
    expect(plan.stage).toBe("planned");
    expect(plan.fitMessage).toMatch(/flexible|realistic/i);
    expect(plan.styleRecommendation).toMatch(/Balanced/i);
  });

  it("surfaces dependency notes without shaming", () => {
    const blocked: PlanDayItem = {
      id: "b1",
      title: "Call Carolyn",
      notes: "requires Find insurance paperwork",
      column: "today",
      done: false,
    };
    const plan = buildCompleteDayPlan({ items: [blocked, item("2", "water plants")] });
    expect(plan.dependencyNotes.some((n) => /Requires/i.test(n))).toBe(true);
  });

  it("keeps energy and motivation as separate inputs in saved workflow", () => {
    const saved = savePlanWorkflowState({
      ...loadPlanWorkflowState(),
      energy: "low",
      motivation: "high",
      stage: "constraints",
    });
    const loaded = loadPlanWorkflowState();
    expect(loaded.energy).toBe("low");
    expect(loaded.motivation).toBe("high");
    expect(saved.stage).toBe("constraints");
  });

  it("wires shared Plan child to parse and workflow UI", () => {
    const { readFileSync } = require("node:fs") as typeof import("node:fs");
    const { resolve } = require("node:path") as typeof import("node:path");
    const source = readFileSync(
      resolve(process.cwd(), "components/companion/PlanAdaptSharedWindow.tsx"),
      "utf8",
    );
    expect(source).toContain("parseMindCapture");
    expect(source).toContain("addQuickPlanItems");
    expect(source).toContain("PlanMyDayCompleteWorkflow");
    expect(source).toContain('onOpenAdapt={() => setActiveChild("adapt")}');
    expect(source).toContain("plan-adapt-shared-choices");
    expect(source).toContain("plan-adapt-shared-how-do-i");
  });
});
