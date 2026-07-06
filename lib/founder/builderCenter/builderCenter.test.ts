import { describe, expect, it } from "vitest";

import { getBuilderCenterBootstrap } from "./services/builderCenterService";

describe("Executive Builder™ bootstrap", () => {
  it("returns entry points and build modes", () => {
    const boot = getBuilderCenterBootstrap();
    expect(boot.buildModes).toHaveLength(7);
    expect(boot.suggestedBuilds.length).toBeGreaterThan(3);
  });
});
