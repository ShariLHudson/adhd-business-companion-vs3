import { describe, expect, it } from "vitest";

import { getIntegrationCenterBootstrap } from "./index";

describe("Integration Center", () => {
  it("returns bootstrap with connected systems", () => {
    const bootstrap = getIntegrationCenterBootstrap();
    expect(bootstrap.connectedCount).toBeGreaterThan(5);
    expect(bootstrap.groupCount).toBeGreaterThan(7);
  });
});
