// Founder Ecosystem — Phase 6 Memory & Relationship Graph tests.
// Proves the engine derives a connected graph and answers the five context
// questions a founder should never have to remember — all from the event
// stream, with nothing manually entered.

import { describe, expect, it } from "vitest";

import { containsClinicalLanguage } from "../clinicalLanguageGuard";

import { simulateMasterWorkflow } from "../fixtures/masterWorkflow";
import {
  buildFounderMemory,
  whatAmIWorkingOn,
  whatDecisionsLedHere,
  whatHappenedTo,
  whatOpportunitiesExist,
  whatShouldHappenNext,
  whyAmIWorkingOn,
} from "./founderMemoryEngine";
import {
  documentsForProject,
  everythingRelatedTo,
  tasksForProject,
} from "./memoryQueries";
import {
  currentRisks,
  mostImportantContext,
  opportunityNetwork,
  recentDecisions,
  recentWins,
} from "./memorySelectors";
import { sampleGraph, sampleMemory, SAMPLE_FOUNDER_ID } from "./sampleGraphData";

const FOUNDER = "founder-001";
const NOW = new Date("2026-06-01T09:00:00.000Z");
const events = () => simulateMasterWorkflow(FOUNDER, NOW);

describe("relationship graph", () => {
  it("connects projects, tasks, documents, decisions and opportunities", () => {
    const m = buildFounderMemory(events(), FOUNDER);
    const g = m.graph;

    expect(g.nodes.some((n) => n.type === "founder")).toBe(true);
    expect(g.nodes.filter((n) => n.type === "project").length).toBeGreaterThanOrEqual(3);
    expect(g.nodes.some((n) => n.type === "decision")).toBe(true);
    expect(g.nodes.some((n) => n.type === "opportunity")).toBe(true);
    expect(g.nodes.some((n) => n.type === "win")).toBe(true);
    // No dangling edges.
    const ids = new Set(g.nodes.map((n) => n.id));
    for (const e of g.edges) {
      expect(ids.has(e.from)).toBe(true);
      expect(ids.has(e.to)).toBe(true);
    }
  });

  it("links the SOP document and its task to the app project", () => {
    const m = buildFounderMemory(events(), FOUNDER);
    expect(documentsForProject(m.graph, "proj-app").map((d) => d.id)).toContain(
      "doc-sop",
    );
    expect(tasksForProject(m.graph, "proj-app").map((t) => t.id)).toContain(
      "task-sop",
    );
  });

  it("can reach everything connected to a project", () => {
    const m = buildFounderMemory(events(), FOUNDER);
    const related = everythingRelatedTo(m.graph, "proj-app", 2);
    expect(related.length).toBeGreaterThan(0);
  });
});

describe("the five questions a founder shouldn't have to remember", () => {
  const m = buildFounderMemory(events(), FOUNDER);

  it("What am I working on?", () => {
    const active = whatAmIWorkingOn(m);
    expect(active).not.toBeNull();
    expect(active!.name.length).toBeGreaterThan(0);
  });

  it("Why am I working on it?", () => {
    const why = whyAmIWorkingOn(m, "proj-app");
    expect(why).toMatch(/Event Engine|Launch|Funnel|Users/i);
  });

  it("What decisions led here?", () => {
    const decisions = whatDecisionsLedHere(m, "proj-app");
    expect(decisions.length).toBeGreaterThan(0);
    expect(decisions[0].decision).toMatch(/Event Engine/i);
  });

  it("What opportunities exist?", () => {
    const opps = whatOpportunitiesExist(m);
    expect(opps.length).toBeGreaterThan(0);
    expect(opps[0].origin.length).toBeGreaterThan(0);
  });

  it("What should happen next?", () => {
    expect(whatShouldHappenNext(m)).toBeTypeOf("string");
  });

  it("What happened to that idea? (recall by fuzzy text)", () => {
    const found = whatHappenedTo(m, "Founder Board");
    expect(found).not.toBeNull();
    expect(found!.id).toBe("opp-board");
  });
});

describe("memory selectors", () => {
  const m = buildFounderMemory(events(), FOUNDER);

  it("surfaces recent decisions and wins", () => {
    expect(recentDecisions(m).length).toBeGreaterThan(0);
    expect(recentWins(m, 3650).length).toBeGreaterThan(0);
  });

  it("groups opportunities into a network", () => {
    expect(opportunityNetwork(m).length).toBeGreaterThan(0);
  });

  it("reports current risks without diagnosing", () => {
    const blob = JSON.stringify(currentRisks(m));
    expect(containsClinicalLanguage(blob)).toBe(false);
  });

  it("names the single most important context", () => {
    const ctx = mostImportantContext(m);
    expect(ctx.project).not.toBeNull();
  });
});

describe("sample graph data", () => {
  it("builds a populated graph and memory from the master workflow", () => {
    expect(sampleGraph().nodes.length).toBeGreaterThan(5);
    const m = sampleMemory();
    expect(m.projects.length).toBeGreaterThanOrEqual(3);
    expect(SAMPLE_FOUNDER_ID).toBe("founder-sample");
  });
});
