import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createOutcomeGoal,
  getOutcomeGoal,
  recordOutcomeGoalProgress,
  resetOutcomeGoalsForTests,
} from "./outcomeGoals";
import {
  buildGoalCoachingIntelligence,
  metricChangeIndicator,
} from "./goalCoachingIntelligence";

describe("goalCoachingIntelligence", () => {
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

  it("shows upward change indicator from last log", () => {
    const goal = createOutcomeGoal({
      statement: "Grow members",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100 members",
    });
    recordOutcomeGoalProgress(goal.id, { delta: 12 });
    const live = getOutcomeGoal(goal.id)!;
    const metric = live.metrics[0]!;
    const change = metricChangeIndicator(metric);
    expect(change.direction).toBe("up");
    expect(change.label).toContain("↑ +12");
    expect(change.label).toContain("since last update");
  });

  it("shows flat indicator when no logs exist", () => {
    const goal = createOutcomeGoal({
      statement: "New goal",
      metric: "Leads",
      targetValue: 50,
      deadline: "2026-12-31",
      definitionOfDone: "50 leads",
    });
    const metric = goal.metrics[0]!;
    const change = metricChangeIndicator(metric);
    expect(change.direction).toBe("flat");
    expect(change.label).toBe("→ no change yet");
  });

  it("shows downward adjustment indicator", () => {
    const metric = {
      id: "m1",
      label: "Revenue",
      trackingTypeId: "revenue" as const,
      metricKind: "revenue" as const,
      targetValue: 10000,
      currentValue: 97,
      isPrimary: true,
      progressLogs: [
        {
          id: "log-1",
          amount: 100,
          loggedAt: "2026-06-20T12:00:00",
          metricId: "m1",
        },
        {
          id: "log-2",
          amount: -3,
          loggedAt: "2026-06-24T12:00:00",
          metricId: "m1",
        },
      ],
    };
    const change = metricChangeIndicator(metric);
    expect(change.direction).toBe("down");
    expect(change.label).toContain("↓ -3");
  });

  it("builds coaching intelligence with emotionally safe copy", () => {
    const now = new Date("2026-06-24T12:00:00");
    const goal = createOutcomeGoal({
      statement: "Launch course",
      metric: "Sales",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100 sales",
    });
    const intel = buildGoalCoachingIntelligence(goal, now);
    const allText = [
      intel.progressSummary,
      ...intel.whatsWorking,
      ...intel.whatsBlocking,
      ...intel.suggestedActions,
      intel.nextBestAction,
      intel.patternInsight ?? "",
    ].join(" ");

    expect(intel.nextBestAction.length).toBeGreaterThan(0);
    expect(intel.suggestedActions.length).toBeGreaterThan(0);
    expect(allText.toLowerCase()).not.toContain("you failed");
    expect(allText.toLowerCase()).not.toContain("you are behind");
    expect(allText.toLowerCase()).not.toContain("you should");
  });

  it("suggests recording progress when goal is quiet", () => {
    const now = new Date("2026-06-24T12:00:00");
    const goal = createOutcomeGoal({
      statement: "Quiet goal",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100",
    });
    recordOutcomeGoalProgress(goal.id, {
      delta: 1,
      loggedAt: "2026-06-10T12:00:00",
    });
    const live = getOutcomeGoal(goal.id)!;
    const intel = buildGoalCoachingIntelligence(live, now);
    expect(intel.whatsBlocking.some((l) => l.includes("hasn't been updated"))).toBe(
      true,
    );
    expect(intel.suggestedActions).toContain("Record progress");
    expect(intel.nextBestAction).toContain("progress");
  });

  it("includes metric change map for all active trackers", () => {
    const goal = createOutcomeGoal({
      statement: "Multi tracker",
      metric: "Revenue",
      targetValue: 10000,
      deadline: "2026-12-31",
      definitionOfDone: "Done",
      metrics: [
        {
          label: "Revenue",
          trackingTypeId: "revenue",
          metricKind: "revenue",
          targetValue: 10000,
          isPrimary: true,
        },
        {
          label: "Leads",
          trackingTypeId: "leads",
          metricKind: "count",
          targetValue: 50,
          isPrimary: false,
        },
      ],
      completionRule: "all_metrics",
    });
    recordOutcomeGoalProgress(goal.id, { delta: 5, metricId: goal.metrics[0]!.id });
    const live = getOutcomeGoal(goal.id)!;
    const intel = buildGoalCoachingIntelligence(live);
    expect(Object.keys(intel.metricChanges)).toHaveLength(2);
    expect(intel.metricChanges[live.metrics[0]!.id]?.direction).toBe("up");
    expect(intel.metricChanges[live.metrics[1]!.id]?.direction).toBe("flat");
  });
});
