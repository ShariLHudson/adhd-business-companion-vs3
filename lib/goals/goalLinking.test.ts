import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createOutcomeGoal,
  resetOutcomeGoalsForTests,
} from "./outcomeGoals";
import {
  evidenceSupportsGoal,
  itemLinkedToGoal,
  planItemSupportsGoal,
  projectSupportsGoal,
  winSupportsGoal,
  packGoalLinks,
} from "./goalLinking";
import type { PlanDayItem } from "../planMyDay/types";

describe("goalLinking", () => {
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

  it("links wins via explicit outcomeGoalId", () => {
    const goal = createOutcomeGoal({
      statement: "Launch Ecosystem",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100 members",
    });
    expect(
      winSupportsGoal(
        { whatHappened: "Random win", outcomeGoalId: goal.id } as never,
        goal,
      ),
    ).toBe(true);
    expect(itemLinkedToGoal({ outcomeGoalId: goal.id }, goal.id)).toBe(true);
  });

  it("links plan items via explicit outcomeGoalId", () => {
    const goal = createOutcomeGoal({
      statement: "Get 100 Members",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100 members",
    });
    const item: PlanDayItem = {
      id: "plan-1",
      title: "Organize desk",
      column: "today",
      done: false,
      outcomeGoalId: goal.id,
    };
    expect(planItemSupportsGoal(item, goal)).toBe(true);
  });

  it("links projects via explicit outcomeGoalId", () => {
    const goal = createOutcomeGoal({
      statement: "Launch Ecosystem",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100 members",
    });
    expect(
      projectSupportsGoal(
        {
          id: "p1",
          name: "Companion",
          goal: "Ship features",
          status: "in-progress",
          outcomeGoalId: goal.id,
        } as never,
        goal,
      ),
    ).toBe(true);
  });

  it("falls back to text matching for evidence", () => {
    const goal = createOutcomeGoal({
      statement: "Get 5 Clients",
      metric: "Clients",
      targetValue: 5,
      deadline: "2026-12-31",
      definitionOfDone: "5 clients",
    });
    expect(
      evidenceSupportsGoal(
        {
          whatHappened: "Signed client #2",
          whyItMattered: "",
          whatThisProves: "",
        } as never,
        goal,
      ),
    ).toBe(true);
  });

  it("supports multiple explicit goal ids", () => {
    const g1 = createOutcomeGoal({
      statement: "Goal A",
      metric: "A",
      targetValue: 10,
      deadline: "2026-12-31",
      definitionOfDone: "done",
    });
    const g2 = createOutcomeGoal({
      statement: "Goal B",
      metric: "B",
      targetValue: 10,
      deadline: "2026-12-31",
      definitionOfDone: "done",
    });
    const links = packGoalLinks([g1.id, g2.id]);
    expect(winSupportsGoal({ whatHappened: "Win", ...links } as never, g2)).toBe(
      true,
    );
    expect(itemLinkedToGoal(links, g1.id)).toBe(true);
  });
});
