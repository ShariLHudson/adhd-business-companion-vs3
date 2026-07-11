import { describe, expect, it, beforeEach } from "vitest";

import {
  connectGraph,
  createGraphNode,
  findClusters,
  findGraphRelated,
  findShortestPath,
  graphMemory,
  graphTimeline,
  intelligenceGraphService,
  queryIntelligenceGraph,
  resetRuntimeGraph,
  SAMPLE_GRAPH_NODES,
  SAMPLE_GRAPH_RELATIONSHIPS,
} from "./index";

describe("Companion Intelligence Graph", () => {
  beforeEach(() => {
    resetRuntimeGraph();
  });

  it("sample graph connects Listening Rooms chain", () => {
    expect(SAMPLE_GRAPH_NODES.length).toBeGreaterThanOrEqual(15);
    expect(SAMPLE_GRAPH_RELATIONSHIPS.length).toBeGreaterThanOrEqual(15);

    const path = findShortestPath("node-listening-rooms", "node-ghl-gentle-restart");
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
  });

  it("creates nodes and relationships in runtime store", () => {
    const a = createGraphNode({
      kind: "project",
      title: "Test Project",
      summary: "Sample project node.",
      missionIds: ["listening-rooms"],
    });
    const b = createGraphNode({
      kind: "feature",
      title: "Test Feature",
      summary: "Sample feature.",
      missionIds: ["listening-rooms"],
    });
    const rel = connectGraph({
      fromId: a.id,
      toId: b.id,
      kind: "requires",
      reason: "Feature depends on project.",
    });
    expect(rel).not.toBeNull();
    expect(rel!.kind).toBe("requires");
    expect(intelligenceGraphService.listNodes().some((n) => n.id === a.id)).toBe(true);
  });

  it("queries graph by natural language and mission", () => {
    const lr = queryIntelligenceGraph("Show everything related to Listening Rooms");
    expect(lr.nodes.some((n) => n.id === "node-listening-rooms")).toBe(true);
    expect(lr.relationships.length).toBeGreaterThan(0);

    const fatigue = queryIntelligenceGraph("Show everything we ever learned about Decision Fatigue");
    expect(fatigue.nodes.some((n) => n.tags.includes("decision-fatigue"))).toBe(true);
  });

  it("traverses related items and finds clusters", () => {
    const related = findGraphRelated("node-mission-lr");
    expect(related.nodes.length).toBeGreaterThan(3);

    const clusters = findClusters(3);
    expect(clusters.some((c) => c.label.includes("listening-rooms"))).toBe(true);
  });

  it("mission view connects research, workshops, content, and lessons", () => {
    const view = intelligenceGraphService.missionView("listening-rooms");
    expect(view.missionNode).not.toBeNull();
    expect(view.research.length).toBeGreaterThan(0);
    expect(view.workshops.length + view.courses.length).toBeGreaterThan(0);
    expect(view.content.length).toBeGreaterThan(0);
    expect(view.lessons.length).toBeGreaterThan(0);
    expect(view.decisions.length).toBeGreaterThan(0);
  });

  it("content memory and founder memory views connect lineage", () => {
    const content = intelligenceGraphService.contentMemory("node-newsletter-restart");
    expect(content).not.toBeNull();
    expect(content!.campaignsUsed.length + content!.funnelsPromoted.length).toBeGreaterThan(0);

    const founder = intelligenceGraphService.founderMemory();
    expect(founder.decisions.length).toBeGreaterThan(0);
    expect(founder.journalEntries.length).toBeGreaterThan(0);
    expect(founder.lessons.length).toBeGreaterThan(0);
  });

  it("timeline and executive memory preserve institutional history", () => {
    const events = graphTimeline("node-decision-invest-restart");
    expect(events.some((e) => e.kind === "created")).toBe(true);

    const ecosystem = graphTimeline();
    expect(ecosystem.length).toBeGreaterThan(0);

    const memory = graphMemory("node-decision-invest-restart");
    expect(memory).not.toBeNull();
    if (memory && !Array.isArray(memory)) {
      const explained = intelligenceGraphService.explainDecision(memory.decisionNodeId);
      expect(explained?.narrative.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("workshops inspired by customer requests are discoverable", () => {
    const workshops = intelligenceGraphService.workshopsFromCustomerVoice();
    expect(workshops.some((w) => w.id === "node-workshop-fatigue")).toBe(true);
  });
});
