import { describe, expect, it } from "vitest";
import {
  detectSparkVisualEngineViewRequest,
  sparkVisualEngineStudioViewId,
} from "./sparkVisualEngineStandard";

describe("detectSparkVisualEngineViewRequest", () => {
  it("opens mind map and process map from direct requests", () => {
    expect(detectSparkVisualEngineViewRequest("Create a mind map")?.id).toBe(
      "mind-map",
    );
    expect(detectSparkVisualEngineViewRequest("Make a flowchart")?.id).toBe(
      "process-map",
    );
    expect(sparkVisualEngineStudioViewId("Create a workflow")).toBe(
      "process-flow",
    );
  });

  it("opens timeline, decision, and relationship views", () => {
    expect(
      detectSparkVisualEngineViewRequest("Show this as a timeline")?.id,
    ).toBe("timeline");
    expect(
      detectSparkVisualEngineViewRequest("Create a decision tree")?.id,
    ).toBe("decision-view");
    expect(
      detectSparkVisualEngineViewRequest("Show the connections")?.id,
    ).toBe("relationship-map");
  });

  it("does not treat bare schedule as timeline", () => {
    expect(detectSparkVisualEngineViewRequest("Schedule this")).toBeNull();
  });

  it("does not treat bare brainstorm as possibility view", () => {
    expect(detectSparkVisualEngineViewRequest("brainstorm ideas")).toBeNull();
  });
});
