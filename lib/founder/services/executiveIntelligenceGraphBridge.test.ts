import { describe, expect, it } from "vitest";

import {
  prepareFounderExecutiveIntelligenceGraph,
  prepareFounderGraphQuerySession,
} from "./executiveIntelligenceGraphBridge";

describe("Founder Executive Intelligence Graph bridge", () => {
  it("prepareFounderExecutiveIntelligenceGraph returns bootstrap", () => {
    const graph = prepareFounderExecutiveIntelligenceGraph();
    expect(graph.bootstrap.ecosystemAreas.length).toBeGreaterThan(4);
    expect(graph.principle).toContain("relationships");
  });

  it("prepareFounderGraphQuerySession returns nodes and insights", () => {
    const result = prepareFounderGraphQuerySession("Show everything related to ADHD restart");
    expect(result.session?.result.nodes.length).toBeGreaterThan(2);
    expect(result.session?.didntKnowThat.length).toBeGreaterThan(0);
  });
});
