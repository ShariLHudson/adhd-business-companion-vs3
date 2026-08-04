import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildGrowthReportContent,
  growthItemSupportsGoal,
} from "./growthReports";
import {
  createOutcomeGoal,
  logOutcomeGoalProgress,
  resetOutcomeGoalsForTests,
} from "./goals/outcomeGoals";
import { createSavedGrowthWin } from "./growthWinsStore";
import { saveProject } from "./companionStore";

describe("growthReports goals", () => {
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
    vi.unstubAllGlobals();
  });

  it("includes active goals and progress in report", () => {
    const goal = createOutcomeGoal({
      statement: "Get 100 Members",
      metric: "members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100 members",
      trackingTypeId: "custom",
    });
    logOutcomeGoalProgress(goal.id, 22);
    logOutcomeGoalProgress(goal.id, 3);

    const content = buildGrowthReportContent({
      reportType: "weekly",
      reportStyle: "summary",
      includes: {
        goals: true,
        wins: false,
        evidence: false,
        highlights: false,
        journey: false,
        photos: false,
        files: false,
        testimonials: false,
        certifications: false,
        reflections: false,
      },
    });

    expect(content.goalSummary.activeGoals).toBe(1);
    expect(content.goals).toHaveLength(1);
    expect(content.goals[0]?.goal.statement).toBe("Get 100 Members");
    expect(content.goals[0]?.percent).toBe(25);
  });

  it("links wins that support a goal", () => {
    const goal = createOutcomeGoal({
      statement: "Get 5 Clients",
      metric: "Clients",
      targetValue: 5,
      deadline: "2026-12-31",
      definitionOfDone: "5 clients",
    });
    createSavedGrowthWin({
      whatHappened: "Signed client #2 today",
      ts: new Date().toISOString(),
      icon: "🏆",
      attachments: [],
    });

    const content = buildGrowthReportContent({
      reportType: "weekly",
      reportStyle: "summary",
      includes: {
        goals: true,
        wins: true,
        evidence: false,
        highlights: false,
        journey: false,
        photos: false,
        files: false,
        testimonials: false,
        certifications: false,
        reflections: false,
      },
    });

    expect(growthItemSupportsGoal("Signed client #2", goal)).toBe(true);
    expect(content.goals[0]?.linkedWins).toHaveLength(1);
  });

  it("summarizes multi-metric goals with linked projects", () => {
    const goal = createOutcomeGoal({
      statement: "Launch ADHD Business Ecosystem",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "Ecosystem live",
      metrics: [
        {
          label: "Members",
          trackingTypeId: "members",
          metricKind: "count",
          targetValue: 100,
          isPrimary: true,
        },
        {
          label: "Revenue",
          trackingTypeId: "revenue",
          metricKind: "revenue",
          targetValue: 10000,
        },
      ],
    });
    const membersId = goal.metrics!.find((m) => m.label === "Members")!.id;
    logOutcomeGoalProgress(goal.id, 22, undefined, membersId);

    saveProject({
      name: "Companion Intelligence",
      goal: "Ship companion",
      status: "in-progress",
      outcomeGoalId: goal.id,
    });

    createSavedGrowthWin({
      whatHappened: "Five new trial signups",
      outcomeGoalId: goal.id,
      ts: new Date().toISOString(),
      icon: "🏆",
      attachments: [],
    });

    const content = buildGrowthReportContent({
      reportType: "weekly",
      reportStyle: "detailed",
      includes: {
        goals: true,
        wins: true,
        evidence: false,
        highlights: false,
        journey: false,
        photos: false,
        files: false,
        testimonials: false,
        certifications: false,
        reflections: false,
      },
    });

    expect(content.goals[0]?.goal.metrics).toHaveLength(2);
    expect(content.goals[0]?.linkedProjects).toHaveLength(1);
    expect(content.goals[0]?.linkedProjects[0]?.name).toBe(
      "Companion Intelligence",
    );
    expect(content.goals[0]?.linkedWins).toHaveLength(1);
  });
});
