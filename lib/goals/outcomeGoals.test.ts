import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  archiveOutcomeGoal,
  completeOutcomeGoal,
  createOutcomeGoal,
  deleteOutcomeGoal,
  editOutcomeGoal,
  formatOutcomeProgressLabel,
  getPrimaryOutcomeGoal,
  goalProgressPercent,
  listArchivedOutcomeGoals,
  listCompletedOutcomeGoals,
  listOutcomeGoals,
  logOutcomeGoalProgress,
  listAllOutcomeGoals,
  recordOutcomeGoalProgress,
  resetOutcomeGoalsForTests,
  getOutcomeGoal,
  goalSatisfiesCompletionRule,
  metricProgressPercent,
  setPrimaryOutcomeGoal,
  suggestSupportingActivities,
  buildOutcomeGoalDashboard,
  archiveOutcomeGoalMetric,
  getActiveGoalMetrics,
  getPrimaryGoalMetric,
  getGoalMetrics,
} from "./outcomeGoals";
import {
  planItemAlignsWithGoal,
  planDayItemAlignsWithGoal,
} from "./goalActivityAlignment";
import type { PlanDayItem } from "../planMyDay/types";

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

  it("P0.28 preserves progress when editing target", () => {
    const goal = createOutcomeGoal({
      statement: "Sign 5 new clients",
      metric: "Clients",
      targetValue: 5,
      deadline: "2026-12-31",
      definitionOfDone: "5 signed clients",
    });
    logOutcomeGoalProgress(goal.id, 3);
    const edited = editOutcomeGoal(goal.id, { targetValue: 10 });
    expect(edited?.manualProgress).toBe(3);
    expect(edited?.targetValue).toBe(10);
    expect(formatOutcomeProgressLabel(edited!)).toBe("3 / 10 clients");
    expect(goalProgressPercent(edited!)).toBe(30);
    expect(edited?.progressLogs).toHaveLength(1);
  });

  it("P0.28 edits title and due date without resetting progress", () => {
    const goal = createOutcomeGoal({
      statement: "Old title",
      metric: "Clients",
      targetValue: 5,
      deadline: "2026-06-30",
      definitionOfDone: "Done",
    });
    logOutcomeGoalProgress(goal.id, 2);
    const edited = editOutcomeGoal(goal.id, {
      statement: "Sign 10 clients",
      deadline: "2026-12-31",
      notes: "Focus on referrals",
    });
    expect(edited?.statement).toBe("Sign 10 clients");
    expect(edited?.deadline).toBe("2026-12-31");
    expect(edited?.notes).toBe("Focus on referrals");
    expect(edited?.manualProgress).toBe(2);
  });

  it("P0.28 archives goal and keeps it in history", () => {
    const goal = createOutcomeGoal({
      statement: "Archive me",
      metric: "Items",
      targetValue: 1,
      deadline: "2026-12-31",
      definitionOfDone: "Done",
    });
    archiveOutcomeGoal(goal.id);
    expect(listOutcomeGoals()).toHaveLength(0);
    expect(listArchivedOutcomeGoals()).toHaveLength(1);
    expect(listArchivedOutcomeGoals()[0]?.status).toBe("archived");
  });

  it("P0.28 completes goal with completion date", () => {
    const goal = createOutcomeGoal({
      statement: "Complete me",
      metric: "Items",
      targetValue: 3,
      deadline: "2026-12-31",
      definitionOfDone: "Done",
    });
    completeOutcomeGoal(goal.id);
    expect(listOutcomeGoals()).toHaveLength(0);
    const done = listCompletedOutcomeGoals();
    expect(done).toHaveLength(1);
    expect(done[0]?.status).toBe("achieved");
    expect(done[0]?.completedAt).toBeTruthy();
  });

  it("P0.28 deletes goal permanently", () => {
    const goal = createOutcomeGoal({
      statement: "Delete me",
      metric: "Items",
      targetValue: 1,
      deadline: "2026-12-31",
      definitionOfDone: "Done",
    });
    deleteOutcomeGoal(goal.id);
    expect(listOutcomeGoals()).toHaveLength(0);
    expect(listAllOutcomeGoals()).toHaveLength(0);
  });

  it("P0.32 records progress with negative delta", () => {
    const goal = createOutcomeGoal({
      statement: "Get 100 Members",
      metric: "members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100 members",
      trackingTypeId: "custom",
    });
    logOutcomeGoalProgress(goal.id, 25);
    const corrected = recordOutcomeGoalProgress(goal.id, { delta: -3, note: "fix" });
    expect(corrected?.manualProgress).toBe(22);
    expect(goalProgressPercent(corrected!)).toBe(22);
  });

  it("Multi-Metric Goal Tracking — independent metric progress", () => {
    const goal = createOutcomeGoal({
      statement: "Launch membership program",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100 members and $10k revenue",
      trackingTypeId: "custom",
      completionRule: "all_metrics",
      metrics: [
        {
          label: "Members",
          trackingTypeId: "custom",
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
    const metrics = goal.metrics!;
    expect(metrics).toHaveLength(2);
    const membersId = metrics.find((m) => m.label === "Members")!.id;
    const revenueId = metrics.find((m) => m.label === "Revenue")!.id;

    recordOutcomeGoalProgress(goal.id, { metricId: membersId, delta: 25 });
    recordOutcomeGoalProgress(goal.id, { metricId: revenueId, delta: 2500 });

    const updated = getOutcomeGoal(goal.id)!;
    expect(updated.metrics!.find((m) => m.id === membersId)?.currentValue).toBe(25);
    expect(updated.metrics!.find((m) => m.id === revenueId)?.currentValue).toBe(2500);
    expect(metricProgressPercent(updated.metrics!.find((m) => m.id === membersId)!)).toBe(25);
    expect(goalSatisfiesCompletionRule(updated)).toBe(false);

    recordOutcomeGoalProgress(goal.id, { metricId: membersId, delta: 75 });
    recordOutcomeGoalProgress(goal.id, { metricId: revenueId, delta: 7500 });
    const done = getOutcomeGoal(goal.id)!;
    expect(goalSatisfiesCompletionRule(done)).toBe(true);
  });

  it("primary_metric completion rule only checks primary", () => {
    const goal = createOutcomeGoal({
      statement: "Grow audience",
      metric: "Followers",
      targetValue: 1000,
      deadline: "2026-12-31",
      definitionOfDone: "1k followers",
      trackingTypeId: "followers",
      completionRule: "primary_metric",
      metrics: [
        {
          label: "Followers",
          trackingTypeId: "followers",
          metricKind: "count",
          targetValue: 1000,
          isPrimary: true,
        },
        {
          label: "Revenue",
          trackingTypeId: "revenue",
          metricKind: "revenue",
          targetValue: 5000,
        },
      ],
    });
    const primaryId = goal.metrics!.find((m) => m.isPrimary)!.id;
    recordOutcomeGoalProgress(goal.id, { metricId: primaryId, setValue: 1000 });
    const updated = getOutcomeGoal(goal.id)!;
    expect(goalSatisfiesCompletionRule(updated)).toBe(true);
    expect(updated.metrics!.find((m) => !m.isPrimary)?.currentValue).toBe(0);
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

  it("matches plan items with explicit outcomeGoalId", () => {
    const goal = createOutcomeGoal({
      statement: "Get 100 Members",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100 members",
    });
    const item: PlanDayItem = {
      id: "t1",
      title: "Create Pinterest posts",
      column: "today",
      done: false,
      outcomeGoalId: goal.id,
    };
    expect(planDayItemAlignsWithGoal(item, goal)).toBe(true);
  });
});

describe("outcomeGoalDashboard", () => {
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

  it("builds dashboard snapshot with most improved metric", () => {
    const goal = createOutcomeGoal({
      statement: "Grow members",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "100 members",
    });
    const metricId = getActiveGoalMetrics(goal)[0]!.id;
    recordOutcomeGoalProgress(goal.id, { metricId, delta: 8 });

    const dash = buildOutcomeGoalDashboard([
      { whatHappened: "Big launch day", ts: new Date().toISOString() },
    ]);
    expect(dash.activeGoals).toBe(1);
    expect(dash.mostImprovedMetric?.delta).toBe(8);
    expect(dash.biggestWinThisPeriod).toBe("Big launch day");
  });

  it("archives a metric without deleting the goal", () => {
    const goal = createOutcomeGoal({
      statement: "Launch",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-12-31",
      definitionOfDone: "Live",
      metrics: [
        {
          label: "Members",
          trackingTypeId: "members",
          metricKind: "count",
          targetValue: 100,
          isPrimary: true,
        },
        {
          label: "Affiliates",
          trackingTypeId: "custom",
          metricKind: "count",
          targetValue: 20,
        },
      ],
    });
    const affiliateId = goal.metrics!.find((m) => m.label === "Affiliates")!.id;
    const updated = archiveOutcomeGoalMetric(goal.id, affiliateId);
    expect(updated).not.toBeNull();
    expect(getActiveGoalMetrics(updated!)).toHaveLength(1);
    expect(getGoalMetrics(updated!)).toHaveLength(2);
  });

  it("P0.53 creates goals with multiple trackers", () => {
    const goal = createOutcomeGoal({
      statement: "Launch Membership",
      metric: "Members",
      targetValue: 100,
      deadline: "2026-06-30",
      definitionOfDone: "Launch",
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
          targetValue: 10_000,
        },
        {
          label: "Email Subscribers",
          trackingTypeId: "email_subscribers",
          metricKind: "count",
          targetValue: 500,
        },
      ],
      completionRule: "all_metrics",
    });
    expect(getActiveGoalMetrics(goal)).toHaveLength(3);
    expect(goal.completionRule).toBe("all_metrics");
  });

  it("P0.53 record progress persists after reload from storage", () => {
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
    const updated = recordOutcomeGoalProgress(goal.id, {
      metricId,
      delta: 500,
      note: "Received payment from ABC Company.",
    });
    expect(updated).not.toBeNull();
    const reloaded = getOutcomeGoal(goal.id);
    expect(reloaded?.metrics?.[0]?.currentValue).toBe(500);
    expect(reloaded?.metrics?.[0]?.progressLogs).toHaveLength(1);
  });
});
