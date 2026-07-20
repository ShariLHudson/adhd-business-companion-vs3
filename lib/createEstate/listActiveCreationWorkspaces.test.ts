import { describe, expect, it } from "vitest";
import { creationWorkspacePhaseLabel } from "./listActiveCreationWorkspaces";
import {
  PLATFORM_UNIVERSAL_CREATION_RULE,
  PLATFORM_UNIVERSAL_CREATION_SURFACES,
} from "./platformCreationRule";

describe("056 — active Creation Workspaces + platform rule", () => {
  it("labels lifecycle phases for Continue Existing Work", () => {
    expect(creationWorkspacePhaseLabel("planning")).toBe("Planning");
    expect(creationWorkspacePhaseLabel("discovery")).toBe("Discovery");
    expect(creationWorkspacePhaseLabel("follow_up")).toBe("Follow-up");
  });

  it("binds every major surface to one Universal Creation Engine", () => {
    expect(PLATFORM_UNIVERSAL_CREATION_SURFACES).toEqual(
      expect.arrayContaining([
        "chamber",
        "board",
        "create",
        "projects",
        "shari",
        "search",
        "dashboard",
        "cartography",
        "visual_thinking",
      ]),
    );
    expect(PLATFORM_UNIVERSAL_CREATION_RULE).toMatch(
      /one Universal Creation Engine/i,
    );
  });
});
