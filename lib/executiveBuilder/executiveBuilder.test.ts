import { describe, expect, it } from "vitest";

import {
  composeBuildSession,
  composeBuildFromBlueprintId,
  EXECUTIVE_BUILDER_PRINCIPLE,
  getBuilderBootstrap,
} from "./index";

describe("Executive Builder engine", () => {
  it("exposes builder principle", () => {
    expect(EXECUTIVE_BUILDER_PRINCIPLE).toContain("blueprint");
  });

  it("composeBuildSession returns full blueprint with phases and packets", () => {
    const session = composeBuildSession("Shame-Free Restart Listening Room", "executive-build");
    expect(session).not.toBeNull();
    expect(session!.blueprint.phases.length).toBeGreaterThan(10);
    expect(session!.blueprint.workPackets.length).toBeGreaterThan(0);
    expect(session!.blueprint.implementationOptions).toHaveLength(3);
    expect(session!.blueprint.prepOutputs.length).toBeGreaterThan(0);
  });

  it("composeBuildFromBlueprintId respects build mode", () => {
    const session = composeBuildFromBlueprintId("blueprint-research-pipeline", "quick-build");
    expect(session?.blueprint.buildMode).toBe("quick-build");
  });

  it("bootstrap includes entry points and modes", () => {
    const boot = getBuilderBootstrap();
    expect(boot.entryPoints.length).toBeGreaterThan(5);
    expect(boot.buildModes.length).toBe(7);
  });
});
