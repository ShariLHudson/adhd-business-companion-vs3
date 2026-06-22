import { describe, expect, it } from "vitest";
import {
  INITIAL_RELIEF_CLUSTER_EXPANSION,
  reliefClusterHideThoughts,
  reliefClusterShowThoughts,
  reliefClusterTap,
} from "./reliefClusterExpansion";

describe("reliefClusterExpansion", () => {
  it("cluster tap shows acknowledgement only (thoughts not visible yet)", () => {
    const next = reliefClusterTap(INITIAL_RELIEF_CLUSTER_EXPANSION, "Health");
    expect(next.activeClusterId).toBe("Health");
    expect(next.thoughtsVisibleClusterId).toBeNull();
  });

  it("View Thoughts reveals thoughts for the active cluster", () => {
    const open = reliefClusterTap(INITIAL_RELIEF_CLUSTER_EXPANSION, "Health");
    const shown = reliefClusterShowThoughts(open, "Health");
    expect(shown.thoughtsVisibleClusterId).toBe("Health");
  });

  it("Hide Thoughts collapses the list but keeps cluster selected", () => {
    const open = reliefClusterTap(INITIAL_RELIEF_CLUSTER_EXPANSION, "Health");
    const shown = reliefClusterShowThoughts(open, "Health");
    const hidden = reliefClusterHideThoughts(shown);
    expect(hidden.activeClusterId).toBe("Health");
    expect(hidden.thoughtsVisibleClusterId).toBeNull();
  });

  it("only one cluster opens at a time", () => {
    const health = reliefClusterTap(INITIAL_RELIEF_CLUSTER_EXPANSION, "Health");
    const withThoughts = reliefClusterShowThoughts(health, "Health");
    const business = reliefClusterTap(withThoughts, "Business");
    expect(business.activeClusterId).toBe("Business");
    expect(business.thoughtsVisibleClusterId).toBeNull();
  });

  it("tapping the active cluster closes it", () => {
    const open = reliefClusterTap(INITIAL_RELIEF_CLUSTER_EXPANSION, "Health");
    const closed = reliefClusterTap(open, "Health");
    expect(closed).toEqual(INITIAL_RELIEF_CLUSTER_EXPANSION);
  });

  it("expanded thoughts are not auto-dismissed by state transitions", () => {
    const open = reliefClusterTap(INITIAL_RELIEF_CLUSTER_EXPANSION, "Health");
    const shown = reliefClusterShowThoughts(open, "Health");
    expect(shown.thoughtsVisibleClusterId).toBe("Health");
    expect(shown.activeClusterId).toBe("Health");
  });
});
