import { describe, expect, it } from "vitest";

import {
  getFounderContentGraph,
  getFounderCustomerGraph,
  getFounderIntelligenceGraphBundle,
  getFounderMissionGraph,
  getFounderResearchGraph,
} from "./intelligenceGraphBridge";

describe("Founder Intelligence Graph bridge", () => {
  it("getFounderMissionGraph returns connected mission view", () => {
    const view = getFounderMissionGraph("listening-rooms");
    expect(view.missionId).toBe("listening-rooms");
    expect(view.research.length).toBeGreaterThan(0);
  });

  it("research, customer, and content graph helpers scope by mission", () => {
    expect(getFounderResearchGraph("listening-rooms").length).toBeGreaterThan(0);
    expect(getFounderCustomerGraph("listening-rooms").length).toBeGreaterThan(0);
    expect(getFounderContentGraph("listening-rooms").length).toBeGreaterThan(0);
  });

  it("bundle assembles founder graph surfaces", () => {
    const bundle = getFounderIntelligenceGraphBundle();
    expect(bundle.product).toBe("founder");
    expect(bundle.listeningRooms.nodes.length).toBeGreaterThan(0);
    expect(bundle.growth.nodes).toBeGreaterThan(10);
  });
});
