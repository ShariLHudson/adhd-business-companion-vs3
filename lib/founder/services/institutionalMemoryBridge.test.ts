import { describe, expect, it } from "vitest";

import {
  founderMissionMemories,
  founderProductEvolution,
  founderRecallDecisionHistory,
  founderRediscover,
  getFounderInstitutionalMemoryBundle,
} from "./institutionalMemoryBridge";

describe("Founder Institutional Memory bridge", () => {
  it("bundle assembles mission memories with graph context", () => {
    const bundle = getFounderInstitutionalMemoryBundle("listening-rooms");
    expect(bundle.product).toBe("founder");
    expect(bundle.memoryCount).toBeGreaterThan(5);
    expect(bundle.decisions.length).toBeGreaterThan(0);
    expect(bundle.lessons.length).toBeGreaterThan(0);
    expect(bundle.integrity.valid).toBe(true);
    expect(bundle.graphNodeCount).toBeGreaterThan(0);
  });

  it("recalls decision reasoning for founder", () => {
    const reasoning = founderRecallDecisionHistory();
    expect(reasoning).not.toBeNull();
    expect(reasoning!.whyDecided).toBeTruthy();
  });

  it("rediscovers institutional knowledge", () => {
    const result = founderRediscover("Have we thought about decision fatigue before?");
    expect(result.memories.length).toBeGreaterThan(0);
  });

  it("scopes mission memories and product evolution", () => {
    expect(founderMissionMemories("listening-rooms").length).toBeGreaterThan(5);
    const evolution = founderProductEvolution("listening-rooms");
    expect(evolution?.originalVision).toBeTruthy();
  });
});
