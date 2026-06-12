import { describe, expect, it } from "vitest";

import { buildExperimentMetricsReport } from "./experimentMetricsEngine";
import { parseMilestones } from "./milestones";

describe("experimentMetricsEngine", () => {
  it("parses milestones from test plan", () => {
    const ms = parseMilestones("1. Ship variant A\n- Measure signup\n* Document results");
    expect(ms).toHaveLength(3);
  });

  it("builds per-experiment metrics and aggregate stats", () => {
    const now = new Date("2026-06-09T12:00:00.000Z");
    const report = buildExperimentMetricsReport({
      events: [],
      workspace: null,
      tracking: {
        issues: [],
        experiments: [
          {
            id: "fe-1",
            title: "Onboarding CTA test",
            hypothesis: "Bigger CTA improves signup",
            testPlan: "1. Deploy\n2. Measure\n3. Compare",
            expectedOutcome: "10% lift",
            result: "No lift",
            status: "failed",
            relatedProjectId: "p1",
            relatedProjectTitle: "Launch",
            createdAt: "2026-06-01T10:00:00.000Z",
            updatedAt: "2026-06-08T10:00:00.000Z",
          },
          {
            id: "fe-2",
            title: "API caching",
            hypothesis: "Cache reduces latency",
            testPlan: "1. Add cache\n2. Benchmark",
            expectedOutcome: "Faster",
            result: "40% faster",
            status: "successful",
            createdAt: "2026-06-02T10:00:00.000Z",
            updatedAt: "2026-06-07T10:00:00.000Z",
          },
        ],
      },
      apiUsage: [
        {
          id: "a1",
          endpoint: "/api/founder/guidance",
          model: "gpt-4o-mini",
          promptTokens: 500,
          completionTokens: 200,
          totalTokens: 700,
          ts: "2026-06-08T11:00:00.000Z",
          experimentId: "fe-1",
        },
      ],
      intelligenceStore: {
        issues: [],
        opportunities: [],
        links: [
          {
            id: "l1",
            projectId: "p1",
            targetKind: "google_doc",
            label: "Launch brief",
            url: "https://docs.google.com/example",
          },
        ],
        activity: {},
      },
      filters: {
        timeframe: "month",
        projectId: null,
        status: "all",
        tag: null,
      },
      now,
    });

    expect(report.experiments).toHaveLength(2);
    expect(report.aggregate.total).toBe(2);
    expect(report.aggregate.successful).toBe(1);
    expect(report.aggregate.failed).toBe(1);
    const failed = report.experiments.find((e) => e.id === "fe-1");
    expect(failed?.apiTokens).toBe(700);
    expect(failed?.googleDocLinks[0]?.label).toBe("Launch brief");
    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.pendingActions.length).toBeGreaterThanOrEqual(0);
    expect(failed?.taskCount).toBeGreaterThanOrEqual(1);
    expect(report.alerts).toBeDefined();
    expect(report.anomalies).toBeDefined();
    expect(report.suggestedKpis.length).toBeGreaterThan(0);
    expect(report.experiments[0]?.timeline.length).toBeGreaterThan(0);
  });

  it("filters by status and tag", () => {
    const now = new Date("2026-06-09T12:00:00.000Z");
    const base = {
      events: [],
      workspace: null,
      intelligenceStore: { issues: [], opportunities: [], links: [], activity: {} },
      apiUsage: [],
      now,
    };

    const filtered = buildExperimentMetricsReport({
      ...base,
      tracking: {
        issues: [],
        experiments: [
          {
            id: "fe-1",
            title: "Onboarding test",
            hypothesis: "onboarding",
            testPlan: "step",
            expectedOutcome: "x",
            result: "",
            status: "testing",
            createdAt: "2026-06-08T10:00:00.000Z",
            updatedAt: "2026-06-08T10:00:00.000Z",
          },
        ],
      },
      filters: {
        timeframe: "week",
        projectId: null,
        status: "testing",
        tag: "onboarding",
      },
    });

    expect(filtered.experiments).toHaveLength(1);

    const empty = buildExperimentMetricsReport({
      ...base,
      tracking: { issues: [], experiments: [] },
      filters: {
        timeframe: "week",
        projectId: null,
        status: "successful",
        tag: null,
      },
    });
    expect(empty.experiments).toHaveLength(0);
  });
});
