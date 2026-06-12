import { describe, expect, it } from "vitest";

import type { FounderEvent } from "@/lib/ecosystem/events";

import { buildFounderAnalyticsReport } from "./analyticsEngine";

describe("analyticsEngine", () => {
  it("builds KPIs and filters by timeframe", () => {
    const now = new Date("2026-06-09T12:00:00.000Z");
    const events: FounderEvent[] = [
      {
        id: "e1",
        founderId: "f1",
        type: "project.created",
        ts: "2026-06-08T10:00:00.000Z",
        refs: { projectId: "p1" },
        data: { title: "Launch funnel" },
      },
      {
        id: "e2",
        founderId: "f1",
        type: "workspace.opened",
        ts: "2026-06-08T11:00:00.000Z",
        refs: { workspace: "create" },
      },
      {
        id: "e3",
        founderId: "f1",
        type: "document.exported",
        ts: "2026-06-08T12:00:00.000Z",
        data: { provider: "google-doc" },
      },
    ];

    const report = buildFounderAnalyticsReport({
      events,
      workspace: {
        projects: [
          {
            id: "p1",
            kind: "project",
            title: "Launch funnel",
            description: "",
            status: "done",
            createdAt: "2026-06-01T00:00:00.000Z",
            updatedAt: "2026-06-08T00:00:00.000Z",
          },
        ],
        experiments: [],
        notes: [],
      },
      tracking: { issues: [], experiments: [] },
      apiUsage: [
        {
          id: "a1",
          endpoint: "/api/founder/guidance",
          model: "gpt-4o-mini",
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
          ts: "2026-06-08T13:00:00.000Z",
        },
      ],
      filters: { timeframe: "week", projectId: null, workspace: null },
      now,
    });

    expect(report.summary.completionRate).toBe(100);
    expect(report.summary.googleExports).toBe(1);
    expect(report.summary.apiTokens).toBe(150);
    expect(report.kpis.length).toBeGreaterThan(5);
    expect(report.workspaceUsage.some((w) => w.label === "create")).toBe(true);
    expect(report.projectProgress).toBeDefined();
    expect(report.experimentInsights).toBeDefined();
    expect(report.experimentSuccessRate).toBeDefined();
    expect(report.alerts).toBeDefined();
  });

  it("narrows data when project filter is set", () => {
    const now = new Date("2026-06-09T12:00:00.000Z");
    const events: FounderEvent[] = [
      {
        id: "e1",
        founderId: "f1",
        type: "project.created",
        ts: "2026-06-08T10:00:00.000Z",
        refs: { projectId: "p1" },
        data: { title: "A" },
      },
      {
        id: "e2",
        founderId: "f1",
        type: "project.created",
        ts: "2026-06-08T10:00:00.000Z",
        refs: { projectId: "p2" },
        data: { title: "B" },
      },
    ];

    const filtered = buildFounderAnalyticsReport({
      events,
      workspace: null,
      tracking: { issues: [], experiments: [] },
      apiUsage: [],
      filters: { timeframe: "week", projectId: "p1", workspace: null },
      now,
    });

    expect(filtered.projectsOverTime.reduce((s, p) => s + p.value, 0)).toBe(1);
  });
});
