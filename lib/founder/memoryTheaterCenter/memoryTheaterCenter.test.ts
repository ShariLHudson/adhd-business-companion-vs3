import { describe, expect, it } from "vitest";

import { getMemoryTheaterCenterBootstrap } from "./services/memoryTheaterCenterService";

describe("Memory Theater Center", () => {
  it("returns entry points and wisdom libraries", () => {
    const bootstrap = getMemoryTheaterCenterBootstrap();
    expect(bootstrap.entryPoints.length).toBeGreaterThan(5);
    expect(bootstrap.featuredReplayId).toBe("replay-workshop-decision");
  });
});
