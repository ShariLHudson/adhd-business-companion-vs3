import { describe, expect, it } from "vitest";
import {
  CLEAR_MY_MIND_UNFOLD_DELAYS,
  CLEAR_MY_MIND_UNFOLD_ORDER,
  maxUnfoldStep,
  nextUnfoldStep,
  unfoldReached,
  unfoldStepIndex,
} from "./clearMyMindUnfold";

describe("clearMyMindUnfold", () => {
  it("orders steps from idle through possibility", () => {
    expect(CLEAR_MY_MIND_UNFOLD_ORDER).toEqual([
      "idle",
      "received",
      "reflecting",
      "holding",
      "connections",
      "patterns",
      "possibility",
    ]);
  });

  it("delays increase monotonically after received", () => {
    const delays = Object.values(CLEAR_MY_MIND_UNFOLD_DELAYS);
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]!).toBeGreaterThanOrEqual(delays[i - 1]!);
    }
  });

  it("unfoldReached compares by order", () => {
    expect(unfoldReached("patterns", "holding")).toBe(true);
    expect(unfoldReached("holding", "patterns")).toBe(false);
    expect(unfoldReached("possibility", "possibility")).toBe(true);
  });

  it("maxUnfoldStep keeps the later step", () => {
    expect(maxUnfoldStep("holding", "connections")).toBe("connections");
    expect(maxUnfoldStep("patterns", "holding")).toBe("patterns");
  });

  it("nextUnfoldStep advances one step", () => {
    expect(nextUnfoldStep("reflecting")).toBe("holding");
    expect(nextUnfoldStep("possibility")).toBeNull();
  });

  it("unfoldStepIndex matches order position", () => {
    expect(unfoldStepIndex("idle")).toBe(0);
    expect(unfoldStepIndex("possibility")).toBe(
      CLEAR_MY_MIND_UNFOLD_ORDER.length - 1,
    );
  });
});
