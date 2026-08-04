import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createOutcomeGoal,
  recordOutcomeGoalProgress,
  resetOutcomeGoalsForTests,
} from "./outcomeGoals";
import {
  buildGoalSupportingActivity,
  calculateGoalMomentum,
  isDecisionEntry,
  isLessonEntry,
  prioritizeGoalsForCompanionWork,
} from "./goalIntelligence";
import { createSavedGrowthWin } from "../growthWinsStore";
import { saveProject } from "../companionStore";
import { packGoalLinks } from "./goalLinking";
import { completePlanItem, getPlanCompletionHistory } from "../planMyDay/planTaskCompletion";
import type { PlanDayItem } from "../planMyDay/types";

describe("goalIntelligence", () => {
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
    localStorage.removeItem("companion-saved-growth-wins-v1");
    localStorage.removeItem("companion-projects-v1");
    localStorage.removeItem("companion-plan-completion-history-v1");
    localStorage.removeItem("companion-plan-my-day-items-v1");
    vi.unstubAllGlobals();
  });

  it("counts supporting wins on goal dashboard activity", () => {
    const goal = createOutcomeGoal({
      statement: "Get 100 Members",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100 members",
    });
    createSavedGrowthWin({
      whatHappened: "Signed 2 new members",
      ts: new Date().toISOString(),
      icon: "🏆",
      attachments: [],
      ...packGoalLinks([goal.id]),
    });

    const activity = buildGoalSupportingActivity(goal);
    expect(activity.wins).toBe(1);
  });

  it("counts linked projects on goal activity", () => {
    const goal = createOutcomeGoal({
      statement: "Launch Ecosystem",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "Live",
    });
    saveProject({
      name: "Companion Intelligence",
      goal: "Ship",
      status: "in-progress",
      ...packGoalLinks([goal.id]),
    });

    const activity = buildGoalSupportingActivity(goal);
    expect(activity.projects).toBe(1);
  });

  it("classifies decisions and lessons", () => {
    expect(
      isDecisionEntry({
        title: "Hiring decision",
        category: "Major Life Events",
        whatHappened: "Decided not to hire yet",
      } as never),
    ).toBe(true);
    expect(
      isLessonEntry({
        title: "Pinterest insight",
        category: "Lessons Learned",
        whatDidILearn: "Pinterest beats Facebook",
      } as never),
    ).toBe(true);
  });

  it("calculates goal momentum separate from percent complete", () => {
    const goal = createOutcomeGoal({
      statement: "Grow members",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100 members",
    });
    const momentum = calculateGoalMomentum(goal);
    expect(["strong", "moderate", "stalled"]).toContain(momentum.level);
    expect(momentum.label.length).toBeGreaterThan(0);
  });

  it("prioritizes stalled goals for companion work recommendations", () => {
    const stalled = createOutcomeGoal({
      statement: "Stalled goal",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-01-01",
      definitionOfDone: "100",
    });
    const active = createOutcomeGoal({
      statement: "Healthy goal",
      metric: "Revenue",
      targetValue: 10000,
      deadline: "2027-12-31",
      definitionOfDone: "10k",
      trackingTypeId: "revenue",
    });
    recordOutcomeGoalProgress(stalled.id, { delta: 1 });
    recordOutcomeGoalProgress(active.id, { delta: 5000 });

    const ranked = prioritizeGoalsForCompanionWork();
    expect(ranked.length).toBe(2);
    expect(ranked[0]?.goal.id).toBe(stalled.id);
  });

  it("stores plan completion goal link for growth reports", () => {
    const goal = createOutcomeGoal({
      statement: "Get 100 Members",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100 members",
    });
    const items: PlanDayItem[] = [
      {
        id: "t1",
        title: "Create Pinterest posts",
        column: "today",
        done: false,
        outcomeGoalId: goal.id,
      },
    ];
    completePlanItem(items, "t1");
    const history = getPlanCompletionHistory();
    expect(history[0]?.outcomeGoalId).toBe(goal.id);
  });
});
