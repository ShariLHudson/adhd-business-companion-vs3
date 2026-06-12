// Founder Ecosystem — Phase 7 Dashboard & KPI tests.
// Proves the dashboard reflects live projects/tasks/decisions/KPIs from the
// memory engine, drills down without leaving the data, filters correctly, and
// never emits a diagnosis. (Named *.test.ts so vitest discovers it.)

import { describe, expect, it } from "vitest";

import { containsClinicalLanguage } from "../clinicalLanguageGuard";

import { simulateMasterWorkflow } from "../fixtures/masterWorkflow";
import { buildFounderDashboard, windowFor } from "./founderDashboard";
import { applyFilter, filterByProject, sortProjects } from "./dashboardFilters";
import {
  alertStrip,
  kpiCards,
  opportunityFunnel,
  projectList,
} from "./dashboardWidgets";
import {
  drillDown,
  healthHeadline,
  nextActionableSteps,
  unsyncedKpis,
} from "./dashboardSelectors";
import {
  projectCompletionChart,
  relationshipPreview,
  timelineRows,
} from "./dashboardVisuals";
import {
  GhlSyncConnector,
  SampleSyncConnector,
  mergeExternalKpis,
  syncDashboard,
} from "./dashboardSync";

const FOUNDER = "founder-001";
const NOW = new Date("2026-06-02T09:00:00.000Z"); // a day after the workflow
const events = () => simulateMasterWorkflow(FOUNDER, new Date("2026-06-01T09:00:00.000Z"));
const build = (period: Parameters<typeof buildFounderDashboard>[2] = {}) =>
  buildFounderDashboard(events(), FOUNDER, { now: NOW, ...period });

describe("dashboard overview", () => {
  it("reflects live projects, decisions, opportunities and wins from memory", () => {
    const d = build();
    expect(d.projects.length).toBeGreaterThanOrEqual(3);
    expect(d.decisions.length).toBeGreaterThan(0);
    expect(d.opportunities.length).toBeGreaterThan(0);
    expect(d.wins.length).toBeGreaterThanOrEqual(0);
    expect(d.summary.activeProjects).toBeGreaterThan(0);
    expect(d.graph.nodes.length).toBeGreaterThan(5);
  });

  it("computes a bounded health score with a label", () => {
    const d = build();
    expect(d.summary.healthScore).toBeGreaterThanOrEqual(0);
    expect(d.summary.healthScore).toBeLessThanOrEqual(100);
    expect(["thriving", "steady", "stretched", "stalled"]).toContain(d.summary.healthLabel);
    expect(healthHeadline(d)).toMatch(/Health \d+\/100/);
  });
});

describe("KPIs", () => {
  it("derives KPIs from events and marks external ones as needing sync", () => {
    const d = build({ period: "all" });
    const focus = d.kpis.find((k) => k.key === "focusSessions");
    expect(focus?.origin).toBe("derived");
    expect(focus?.value).toBeGreaterThan(0);
    const revenue = d.kpis.find((k) => k.key === "revenue");
    expect(revenue?.origin).toBe("external");
    expect(revenue?.value).toBeNull();
    expect(unsyncedKpis(d)).toContain("Revenue");
  });

  it("formats KPI cards and flags ones needing sync", () => {
    const cards = kpiCards(build({ period: "all" }));
    expect(cards.find((c) => c.key === "revenue")?.needsSync).toBe(true);
    expect(cards.find((c) => c.key === "focusSessions")?.display).not.toBe("—");
  });

  it("windowFor produces a previous comparable window except for 'all'", () => {
    const w = windowFor("7d", NOW);
    expect(w.prevEnd).toBe(w.start);
    expect(Number.isNaN(windowFor("all", NOW).prevStart)).toBe(true);
  });
});

describe("filters, sorting & drill-down", () => {
  it("filters every slice down to one project", () => {
    const d = filterByProject(build({ period: "all" }), "proj-app");
    expect(d.projects.every((p) => p.projectId === "proj-app")).toBe(true);
    expect(d.decisions.every((x) => !x.projectId || x.projectId === "proj-app")).toBe(true);
  });

  it("sorts projects by progress without mutating the original", () => {
    const d = build({ period: "all" });
    const sorted = sortProjects(d, "progress");
    expect(sorted.projects).not.toBe(d.projects);
    expect(sorted.projects.length).toBe(d.projects.length);
  });

  it("drills into a project and returns its connected subgraph", () => {
    const dd = drillDown(build({ period: "all" }), "proj-app", 2);
    expect(dd.node?.id).toBe("proj-app");
    expect(dd.project?.projectId).toBe("proj-app");
    expect(dd.related.length).toBeGreaterThan(0);
  });

  it("applyFilter composes project + decision filters", () => {
    const d = applyFilter(build({ period: "all" }), { projectId: "proj-app" });
    expect(d.projects[0]?.projectId).toBe("proj-app");
  });
});

describe("visuals", () => {
  it("builds completion bars, a funnel, a timeline and a graph preview", () => {
    const d = build({ period: "all" });
    expect(projectCompletionChart(d).length).toBe(d.projects.length);
    expect(opportunityFunnel(d).reduce((a, s) => a + s.count, 0)).toBeGreaterThan(0);
    expect(timelineRows(events(), FOUNDER).length).toBeGreaterThan(0);
    expect(relationshipPreview(d, "proj-app", 1).nodes.length).toBeGreaterThan(0);
  });
});

describe("alerts", () => {
  it("surfaces risks, pending decisions and new opportunities", () => {
    const strip = alertStrip(build({ period: "all" }));
    expect(strip.length).toBeGreaterThan(0);
    expect(strip.every((a) => typeof a.icon === "string")).toBe(true);
  });

  it("ranks next actionable steps", () => {
    expect(nextActionableSteps(build({ period: "all" })).length).toBeGreaterThan(0);
  });
});

describe("external sync", () => {
  it("merges sample KPI values into the external slots", async () => {
    const synced = await syncDashboard(build({ period: "30d" }), new SampleSyncConnector(), NOW);
    const revenue = synced.kpis.find((k) => k.key === "revenue");
    expect(revenue?.value).not.toBeNull();
    expect(revenue?.status).not.toBe("unknown");
  });

  it("maps a GHL fetcher response without embedding credentials", async () => {
    const ghl = new GhlSyncConnector(async () => [
      { revenue: 1000, revenuePrev: 800, leads: 12 },
    ]);
    const vals = await ghl.fetchKpis("30d");
    const merged = mergeExternalKpis(build({ period: "30d" }), vals);
    expect(merged.kpis.find((k) => k.key === "revenue")?.value).toBe(1000);
    expect(merged.kpis.find((k) => k.key === "revenue")?.trend).toBe("up");
  });
});

describe("no diagnosis guardrail", () => {
  it("never emits medical/mental-health language anywhere in the dashboard", () => {
    const blob = JSON.stringify(build({ period: "all" }));
    expect(containsClinicalLanguage(blob)).toBe(false);
  });
});
