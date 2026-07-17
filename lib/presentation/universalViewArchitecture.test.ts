import { describe, expect, it } from "vitest";
import { recommendUniversalView } from "./universalViewArchitecture";

describe("universal view architecture", () => {
  it("recommends presentation modes from day shape without Plan My Day special cases", () => {
    expect(recommendUniversalView({ projectHeavy: true }).mode).toBe("kanban");
    expect(recommendUniversalView({ appointmentCount: 3 }).mode).toBe("timeline");
    expect(recommendUniversalView({ taskCount: 2 }).mode).toBe("list");
  });
});
