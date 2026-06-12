import { describe, expect, it } from "vitest";

import type { FounderEvent } from "@/lib/ecosystem/events";

import {
  buildAnalyticsAlerts,
  buildExperimentInsights,
  buildProjectProgress,
} from "./insightsEngine";

describe("insightsEngine", () => {
  const now = new Date("2026-06-09T12:00:00.000Z");

  it("computes project progress and behind-schedule alerts", () => {
    const events: FounderEvent[] = [
      {
        id: "t1",
        founderId: "f1",
        type: "task.created",
        ts: "2026-06-01T10:00:00.000Z",
        refs: { projectId: "p1", taskId: "task-1" },
      },
      {
        id: "t2",
        founderId: "f1",
        type: "task.completed",
        ts: "2026-06-08T10:00:00.000Z",
        refs: { projectId: "p1", taskId: "task-1" },
      },
    ];

    const progress = buildProjectProgress(
      events,
      {
        projects: [
          {
            id: "p1",
            kind: "project",
            title: "Launch",
            description: "due: 2026-06-01",
            status: "active",
            createdAt: "2026-05-01T00:00:00.000Z",
            updatedAt: "2026-06-08T00:00:00.000Z",
          },
        ],
        experiments: [],
        notes: [],
      },
      [],
      now,
    );

    expect(progress[0]?.percentComplete).toBe(100);
    expect(progress[0]?.velocityPerWeek).toBe(1);
    expect(progress[0]?.behindSchedule).toBe(true);

    const alerts = buildAnalyticsAlerts({
      projectProgress: progress,
      experimentInsights: [],
      apiTokens: 100,
      apiCalls: 2,
      timeframe: "week",
    });

    expect(alerts.some((a) => a.category === "deadline")).toBe(true);
  });

  it("lists failed experiments and high API usage alerts", () => {
    const insights = buildExperimentInsights(
      {
        issues: [],
        experiments: [
          {
            id: "e1",
            title: "Onboarding tweak",
            hypothesis: "h",
            testPlan: "p",
            expectedOutcome: "o",
            result: "No lift",
            status: "failed",
            createdAt: "2026-06-07T10:00:00.000Z",
            updatedAt: "2026-06-08T10:00:00.000Z",
          },
        ],
      },
      { timeframe: "week", projectId: null, workspace: null },
      now,
    );

    expect(insights[0]?.success).toBe(false);

    const alerts = buildAnalyticsAlerts({
      projectProgress: [],
      experimentInsights: insights,
      apiTokens: 25_000,
      apiCalls: 5,
      timeframe: "week",
    });

    expect(alerts.some((a) => a.category === "experiment")).toBe(true);
    expect(alerts.some((a) => a.category === "api")).toBe(true);
  });
});
