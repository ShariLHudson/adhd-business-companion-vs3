import { describe, expect, it } from "vitest";

import {
  composeGraphQuerySession,
  composeNodeExecutiveView,
  EXECUTIVE_GRAPH_PRINCIPLE,
  getExecutiveGraphBootstrap,
} from "./index";

describe("Executive Intelligence Graph™ engine", () => {
  it("exposes graph principle", () => {
    expect(EXECUTIVE_GRAPH_PRINCIPLE).toContain("relationships");
  });

  it("composeGraphQuerySession returns connected nodes", () => {
    const session = composeGraphQuerySession("Show everything connected to Listening Rooms");
    expect(session).not.toBeNull();
    expect(session!.result.nodes.length).toBeGreaterThan(3);
    expect(session!.discoveryInsights.length).toBeGreaterThan(0);
  });

  it("composeNodeExecutiveView returns executive detail with pathway", () => {
    const view = composeNodeExecutiveView("node-listening-rooms");
    expect(view).not.toBeNull();
    expect(view!.detail.pathway.length).toBeGreaterThan(5);
    expect(view!.detail.opportunities.length).toBeGreaterThan(0);
  });

  it("getExecutiveGraphBootstrap includes ecosystem and insights", () => {
    const bootstrap = getExecutiveGraphBootstrap();
    expect(bootstrap.ecosystemAreas.length).toBeGreaterThan(4);
    expect(bootstrap.didntKnowThat.length).toBeGreaterThan(2);
  });
});
