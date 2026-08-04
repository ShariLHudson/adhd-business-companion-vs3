import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  activityDayLabel,
  formatActivityAmount,
  groupActivityByDay,
  miniProgressBar,
} from "./outcomeGoalActivity";
import {
  createOutcomeGoal,
  deleteOutcomeGoalProgressEntry,
  getOutcomeGoal,
  recordOutcomeGoalProgress,
  resetOutcomeGoalsForTests,
  updateOutcomeGoalProgressEntry,
} from "./outcomeGoals";
import { getPrimaryGoalMetric } from "./outcomeGoals";
import { collectGoalActivityEntries } from "./outcomeGoalActivity";

describe("outcomeGoalActivity P0.54", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    resetOutcomeGoalsForTests();
  });

  it("groups activity by day without repeating goal title per row", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-24T15:00:00"));
    const goal = createOutcomeGoal({
      statement: "Launch Membership",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-06-30",
      definitionOfDone: "100 members",
    });
    const metricId = getPrimaryGoalMetric(goal).id;
    recordOutcomeGoalProgress(goal.id, {
      metricId,
      delta: 20,
      note: "Beta email campaign",
    });
    const entries = collectGoalActivityEntries(getOutcomeGoal(goal.id)!);
    const groups = groupActivityByDay(entries);
    expect(groups[0]?.label).toBe("Today");
    expect(groups[0]?.entries).toHaveLength(1);
    expect(formatActivityAmount(goal.metrics![0]!, 20)).toBe("+20 Members");
    vi.useRealTimers();
  });

  it("edits and deletes activity entries with persisted values", () => {
    const goal = createOutcomeGoal({
      statement: "Revenue goal",
      metric: "Revenue",
      trackingTypeId: "revenue",
      metricKind: "revenue",
      targetValue: 10_000,
      deadline: "2026-12-31",
      definitionOfDone: "10k",
    });
    const metricId = getPrimaryGoalMetric(goal).id;
    recordOutcomeGoalProgress(goal.id, { metricId, delta: 500 });
    const reloaded = getOutcomeGoal(goal.id)!;
    const logId = reloaded.metrics![0]!.progressLogs[0]!.id!;
    updateOutcomeGoalProgressEntry(goal.id, metricId, logId, {
      amount: 600,
      note: "Workshop sales",
    });
    expect(getOutcomeGoal(goal.id)?.metrics?.[0]?.currentValue).toBe(600);
    deleteOutcomeGoalProgressEntry(goal.id, metricId, logId);
    expect(getOutcomeGoal(goal.id)?.metrics?.[0]?.currentValue).toBe(0);
  });

  it("formats mini progress bar", () => {
    expect(miniProgressBar(41)).toContain("█");
    expect(miniProgressBar(41)).toContain("░");
  });

  it("labels today and yesterday", () => {
    const now = new Date("2026-06-24T12:00:00");
    expect(activityDayLabel("2026-06-24T10:00:00", now)).toBe("Today");
    expect(activityDayLabel("2026-06-23T10:00:00", now)).toBe("Yesterday");
  });
});
