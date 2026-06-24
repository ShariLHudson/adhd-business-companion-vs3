import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createOutcomeGoal,
  formatOutcomeProgressLabel,
  getPrimaryOutcomeGoal,
  goalProgressPercent,
  listOutcomeGoals,
  logOutcomeGoalProgress,
  resetOutcomeGoalsForTests,
  setPrimaryOutcomeGoal,
  suggestSupportingActivities,
} from "./outcomeGoals";
import { planItemAlignsWithGoal } from "./goalActivityAlignment";

describe("outcomeGoals", () => {
  beforeEach(() => {
    const storage: Record<string, string> = {};
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => {
        storage[k] = v;
      },
      removeItem: (k: string) => {
        delete storage[k];
      },
    });
  });

  afterEach(() => {
    resetOutcomeGoalsForTests();
    vi.unstubAllGlobals();
  });

  it("creates a structured outcome goal", () => {
    const goal = createOutcomeGoal({
      statement: "Sign 5 new clients",
      metric: "Clients",
      targetValue: 5,
      deadline: "2026-12-31",
      definitionOfDone: "5 signed clients recorded",
      supportingActivities: suggestSupportingActivities("Sign 5 new clients"),
    });
    expect(goal.statement).toBe("Sign 5 new clients");
    expect(goal.isPrimary).toBe(true);
    expect(listOutcomeGoals()).toHaveLength(1);
    expect(goal.supportingActivities.length).toBeGreaterThan(0);
  });

  it("logs self-reported revenue progress", () => {
    const goal = createOutcomeGoal({
      statement: "Earn $1000 this month",
      metric: "Revenue",
      targetValue: 1000,
      deadline: "2026-06-30",
      definitionOfDone: "$1000 logged",
    });
    expect(goal.metricKind).toBe("revenue");
    const updated = logOutcomeGoalProgress(goal.id, 250);
    expect(updated?.manualProgress).toBe(250);
    expect(goalProgressPercent(updated!)).toBe(25);
    expect(formatOutcomeProgressLabel(updated!)).toContain("$250");
  });

  it("sets primary outcome goal", () => {
    const first = createOutcomeGoal({
      statement: "First",
      metric: "Items",
      targetValue: 3,
      deadline: "2026-12-31",
      definitionOfDone: "Done",
    });
    const second = createOutcomeGoal({
      statement: "Second",
      metric: "Items",
      targetValue: 2,
      deadline: "2026-12-31",
      definitionOfDone: "Done",
    });
    expect(getPrimaryOutcomeGoal()?.id).toBe(first.id);
    setPrimaryOutcomeGoal(second.id);
    expect(getPrimaryOutcomeGoal()?.id).toBe(second.id);
  });
});

describe("goalActivityAlignment", () => {
  beforeEach(() => {
    const storage: Record<string, string> = {};
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => {
        storage[k] = v;
      },
      removeItem: (k: string) => {
        delete storage[k];
      },
    });
  });

  afterEach(() => {
    resetOutcomeGoalsForTests();
    vi.unstubAllGlobals();
  });

  it("matches plan items to supporting activities", () => {
    const goal = createOutcomeGoal({
      statement: "Sign 5 clients",
      metric: "Clients",
      targetValue: 5,
      deadline: "2026-12-31",
      definitionOfDone: "5 clients",
      supportingActivities: ["Follow-up emails", "Discovery calls"],
    });
    expect(planItemAlignsWithGoal("Send follow-up email to Sarah", goal)).toBe(
      true,
    );
    expect(planItemAlignsWithGoal("Organize desk", goal)).toBe(false);
  });
});
