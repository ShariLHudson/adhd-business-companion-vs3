import { describe, expect, it } from "vitest";
import {
  simulateMasterWorkflow,
  WORKFLOW_FOUNDER_ID as F,
} from "./fixtures/masterWorkflow";
import { getFounderDashboardData } from "./dashboardSelectors";
import {
  buildFounderMemory,
  detectPatterns,
  detectWins,
  getFounderIntelligence,
} from "./intelligence";
import { deliberate } from "./board";

const events = simulateMasterWorkflow();
const dash = getFounderDashboardData(events, F);
const intel = getFounderIntelligence(events, F);
const has = (type: string) => events.some((e) => e.type === type);

describe("Master Workflow — the ecosystem remembers across the founder's day", () => {
  it("STEP 1: stores a morning check-in (energy/focus/motivation)", () => {
    const checkin = events.find((e) => e.type === "checkin.recorded");
    expect(checkin?.data).toMatchObject({ energy: "medium", focus: "high" });
    expect(checkin?.data?.priorities).toContain("Launch Beta");
  });

  it("STEP 2/14: captures brain-dump items (priorities + reminders)", () => {
    expect(events.filter((e) => e.type === "note.captured").length).toBeGreaterThanOrEqual(4);
  });

  it("STEP 3: the three active projects are tracked", () => {
    const names = dash.activeProjects.map((p) => p.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "ADHD Business Ecosystem",
        "Sales Funnel",
        "Workshop Launch",
      ]),
    );
  });

  it("STEP 5: the decision is captured and stays open", () => {
    expect(dash.openDecisions.some((d) => /Founder Event Engine/i.test(d.text))).toBe(true);
  });

  it("STEP 7: a time block is scheduled against the project + task", () => {
    const tb = events.find(
      (e) => e.type === "timeblock.created" && e.refs?.projectId === "proj-app",
    );
    expect(tb?.data?.title).toBe("Founder Event Engine");
  });

  it("STEP 8/9/11: focus, document, and research events are logged", () => {
    expect(has("focus.completed")).toBe(true);
    expect(has("document.created")).toBe(true);
    expect(has("research.completed")).toBe(true);
  });

  it("STEP 13: the interruption becomes a captured opportunity", () => {
    expect(intel.opportunities.length).toBeGreaterThanOrEqual(1);
    expect(intel.opportunities.some((o) => /Founder Board/i.test(o.text))).toBe(true);
  });

  it("STEP 15: midday momentum reflects the morning's work", () => {
    expect(dash.momentum.tasksCompletedToday).toBeGreaterThanOrEqual(1);
    expect(dash.momentum.documentsCreated).toBeGreaterThanOrEqual(1);
    expect(dash.momentum.focusSessionsCompleted).toBeGreaterThanOrEqual(1);
  });

  it("STEP 16: repeated outreach avoidance is detected as a pattern (~5x)", () => {
    const p = detectPatterns(events).find((x) => x.type === "procrastination-language");
    expect(p).toBeTruthy();
    expect(p!.frequency).toBeGreaterThanOrEqual(5);
  });

  it("STEP 17: the board consults Sales + Productivity on outreach avoidance", () => {
    const res = deliberate("I keep avoiding the outreach emails", intel);
    const advisors = [res.primaryAdvisor, ...res.secondaryAdvisors];
    expect(advisors).toEqual(expect.arrayContaining(["sales", "productivity"]));
    expect(res.message.length).toBeGreaterThan(0);
  });

  it("STEP 18: finishing the SOP registers as a win", () => {
    expect(detectWins(events).some((w) => w.type === "document-finished")).toBe(true);
  });

  it("STEP 20: next day, the ecosystem still remembers everything", () => {
    const mem = buildFounderMemory(events);
    expect(mem.frequentProjects.some((p) => /ADHD Business/i.test(p.label))).toBe(true);
    // Decisions, opportunities, and pain points persist into the new day.
    expect(intel.opportunities.length).toBeGreaterThan(0);
    expect(dash.openDecisions.length).toBeGreaterThan(0);
    expect(intel.patterns.length).toBeGreaterThan(0);
    // Two check-ins on record (Monday + the next morning).
    expect(events.filter((e) => e.type === "checkin.recorded")).toHaveLength(2);
  });
});
