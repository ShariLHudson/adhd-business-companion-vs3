import { describe, expect, it } from "vitest";
import {
  getFounderDashboardData,
  selectActiveProjects,
  selectFounderState,
  selectMomentum,
  selectOpenDecisions,
  selectOpportunities,
  selectPainPoints,
  selectToday,
} from "./dashboardSelectors";
import {
  SAMPLE_FOUNDER_ID,
  sampleFounderEvents,
} from "./fixtures/dashboardSample";

const events = sampleFounderEvents();
const LEVELS = ["low", "medium", "high"];

describe("selectToday", () => {
  const today = selectToday(events);
  it("lists open tasks as priorities (completed task excluded)", () => {
    expect(today.topPriorities).toHaveLength(1);
    expect(today.topPriorities[0]!.taskId).toBe("task-2");
  });
  it("picks the in-progress task as active", () => {
    expect(today.activeTask?.taskId).toBe("task-2");
  });
  it("surfaces the next scheduled time block", () => {
    expect(today.nextTimeBlock).not.toBeNull();
    expect(today.nextTimeBlock?.durationMin).toBe(60);
  });
  it("has no ongoing focus session (it was completed)", () => {
    expect(today.currentFocusSession).toBeNull();
  });
  it("counts today's wins and blockers", () => {
    expect(today.wins).toHaveLength(2);
    expect(today.blockers).toHaveLength(2);
  });
});

describe("selectActiveProjects", () => {
  const projects = selectActiveProjects(events);
  it("returns the one active project with derived fields", () => {
    expect(projects).toHaveLength(1);
    const p = projects[0]!;
    expect(p.name).toBe("ADHD Sales Funnel");
    expect(p.nextAction).toBe("Draft welcome email");
    expect(p.progressEstimate).toBe(0.5);
    expect(p.linkedDocuments).toHaveLength(1);
    expect(p.scheduledBlocks).toHaveLength(1);
    expect(p.lastActivity).not.toBeNull();
  });
});

describe("selectMomentum", () => {
  const m = selectMomentum(events);
  it("counts today's completions and movement", () => {
    expect(m.tasksCompletedToday).toBe(1);
    expect(m.focusSessionsCompleted).toBe(1);
    expect(m.documentsCreated).toBe(1);
    expect(m.projectsMovedForward).toBe(1);
    expect(m.winsCaptured).toBe(2);
  });
});

describe("selectOpenDecisions", () => {
  const d = selectOpenDecisions(events);
  it("returns unresolved decisions with a recommended step", () => {
    expect(d).toHaveLength(1);
    expect(d[0]!.decisionId).toBe("dec-1");
    expect(d[0]!.recommendedNextStep.length).toBeGreaterThan(0);
  });
});

describe("selectOpportunities", () => {
  const o = selectOpportunities(events);
  it("maps status and keeps the source event", () => {
    expect(o).toHaveLength(1);
    expect(o[0]!.status).toBe("idea");
    expect(o[0]!.sourceEventId).toBe("e12");
  });
});

describe("selectPainPoints", () => {
  const p = selectPainPoints(events);
  it("aggregates recurring friction by category, ranked", () => {
    expect(p).toHaveLength(2);
    expect(p[0]!.category).toBe("overwhelm");
    expect(p[0]!.occurrences).toBe(2);
    expect(p[0]!.relatedProjectIds).toContain("proj-1");
    expect(p[0]!.suggestedSupportPath.length).toBeGreaterThan(0);
    expect(new Date(p[0]!.firstSeen) < new Date(p[0]!.lastSeen)).toBe(true);
  });
});

describe("selectFounderState", () => {
  const s = selectFounderState(events);
  it("returns simple support-indicator levels (never a diagnosis)", () => {
    for (const v of Object.values(s)) expect(LEVELS).toContain(v);
    expect(s.overwhelm).toBe("medium");
  });
});

describe("getFounderDashboardData", () => {
  it("returns one clean dashboard object with all sections", () => {
    const d = getFounderDashboardData(events, SAMPLE_FOUNDER_ID);
    expect(Object.keys(d).sort()).toEqual(
      [
        "activeProjects",
        "founderState",
        "momentum",
        "openDecisions",
        "opportunities",
        "painPoints",
        "today",
      ].sort(),
    );
  });

  it("scopes data to the founder id", () => {
    const d = getFounderDashboardData(events, "someone-else");
    expect(d.activeProjects).toHaveLength(0);
    expect(d.painPoints).toHaveLength(0);
  });

  it("returns empty states (not fake values) when there are no events", () => {
    const d = getFounderDashboardData([], SAMPLE_FOUNDER_ID);
    expect(d.activeProjects).toEqual([]);
    expect(d.openDecisions).toEqual([]);
    expect(d.opportunities).toEqual([]);
    expect(d.painPoints).toEqual([]);
    expect(d.today.topPriorities).toEqual([]);
    expect(d.today.activeTask).toBeNull();
    expect(d.momentum.winsCaptured).toBe(0);
    expect(d.founderState.momentum).toBe("low");
  });
});
