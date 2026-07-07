import { describe, expect, it } from "vitest";

import {
  getRoomPlacementProfile,
  selectDiscoveryKeyPlacement,
} from "./roomPlacementLibrary";

describe("roomPlacementLibrary", () => {
  it("returns greenhouse profile", () => {
    const profile = getRoomPlacementProfile("greenhouse");
    expect(profile?.roomId).toBe("greenhouse");
    expect(profile?.approvedLocations.length).toBeGreaterThan(0);
  });

  it("selects stable placement for discovery id", () => {
    const first = selectDiscoveryKeyPlacement({
      roomId: "greenhouse",
      discoveryId: "DISC-001",
    });
    const second = selectDiscoveryKeyPlacement({
      roomId: "greenhouse",
      discoveryId: "DISC-001",
    });

    expect(first).not.toBeNull();
    expect(second?.locationId).toBe(first?.locationId);
  });

  it("excludes seasonal-only locations by default", () => {
    const placement = selectDiscoveryKeyPlacement({
      roomId: "greenhouse",
      discoveryId: "DISC-001",
      activeSeasonId: null,
    });

    expect(placement?.locationId).not.toBe("flower-pot");
  });

  it("returns null for unknown room", () => {
    expect(
      selectDiscoveryKeyPlacement({
        roomId: "unknown-room",
        discoveryId: "DISC-001",
      }),
    ).toBeNull();
  });
});
