import { describe, expect, it } from "vitest";
import {
  IDEA_LIFECYCLE_STAGES,
  nextIdeaLifecycleStage,
} from "./ideaLifecycleTypes";

describe("ideaLifecycleTypes", () => {
  it("orders stages from seed through harvested", () => {
    expect(IDEA_LIFECYCLE_STAGES.map((s) => s.id)).toEqual([
      "seed",
      "sprout",
      "growing",
      "flourishing",
      "harvested",
    ]);
  });

  it("advances lifecycle one stage at a time", () => {
    expect(nextIdeaLifecycleStage("seed")).toBe("sprout");
    expect(nextIdeaLifecycleStage("flourishing")).toBe("harvested");
    expect(nextIdeaLifecycleStage("harvested")).toBeNull();
  });
});
