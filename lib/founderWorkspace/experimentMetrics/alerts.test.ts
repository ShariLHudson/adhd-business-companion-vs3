import { describe, expect, it } from "vitest";

import { buildExperimentMetricAlerts } from "./alerts";
import type { ExperimentMetricRow } from "./types";

const baseRow = (overrides: Partial<ExperimentMetricRow>): ExperimentMetricRow => ({
  id: "e1",
  title: "Test",
  source: "tracked",
  status: "testing",
  tags: [],
  success: null,
  completionRate: 50,
  milestoneCount: 2,
  milestonesCompleted: 1,
  avgDaysPerMilestone: null,
  durationDays: 3,
  apiCalls: 1,
  apiTokens: 100,
  estimatedCostUsd: 0.01,
  timeInvestedMinutes: 60,
  googleDocLinks: [],
  result: "",
  bottleneck: null,
  taskCount: 2,
  tasksCompleted: 1,
  insightsFlagged: 0,
  projectActivityCount: 0,
  googleDocUpdates: 0,
  projectDelayed: false,
  customKpis: [],
  timeline: [],
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-08T00:00:00.000Z",
  ...overrides,
});

describe("buildExperimentMetricAlerts", () => {
  it("fires alerts for low completion and high API usage", () => {
    const alerts = buildExperimentMetricAlerts(
      [
        baseRow({ completionRate: 20, apiTokens: 6000 }),
        baseRow({ id: "e2", projectDelayed: true, title: "Delayed" }),
      ],
      [],
    );
    expect(alerts.some((a) => a.category === "completion")).toBe(true);
    expect(alerts.some((a) => a.category === "api")).toBe(true);
    expect(alerts.some((a) => a.category === "project")).toBe(true);
  });
});
