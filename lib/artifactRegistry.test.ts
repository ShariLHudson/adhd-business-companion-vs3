import { describe, expect, it } from "vitest";
import {
  detectRegistryArtifact,
  isRegistryArtifactExecution,
  registryArtifactLabel,
} from "./artifactRegistry";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";

describe("artifactRegistry", () => {
  it("detects sales funnel and execution intent", () => {
    const text = "I need to create a sales funnel";
    expect(detectRegistryArtifact(text)).toBe("funnel");
    expect(isRegistryArtifactExecution(text)).toBe(true);
    expect(registryArtifactLabel("funnel")).toBe("funnel");
  });

  it("returns frictionless local reply without relationship reflection", () => {
    const decision = resolveFrictionlessAction({
      userText: "I need to create a sales funnel",
      currentTurn: 1,
    });
    expect(decision.suppressRelationship).toBe(true);
    expect(decision.localReply).toMatch(/map out the funnel|Create/i);
    expect(decision.localReply).not.toMatch(/I've noticed/i);
    expect(decision.workspaceOffer?.section).toBe("content-generator");
  });
});
