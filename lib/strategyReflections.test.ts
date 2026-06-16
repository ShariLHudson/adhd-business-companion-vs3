import { describe, expect, it } from "vitest";
import { pickStrategyReflection } from "./strategyReflections";

describe("pickStrategyReflection", () => {
  it("returns category reflections", () => {
    const line = pickStrategyReflection(
      "overwhelm",
      { id: "test", reflections: undefined },
      { openProjectCount: 0, brainDumpCount: 0, frequentStarter: false },
    );
    expect(line.length).toBeGreaterThan(10);
  });

  it("prefers personalized line for many open projects in overwhelm", () => {
    const line = pickStrategyReflection(
      "overwhelm",
      { id: "shrink-the-world" },
      { openProjectCount: 4, brainDumpCount: 0, frequentStarter: false },
    );
    expect(line).toBe("Remember, not everything needs to happen today.");
  });

  it("uses strategy-specific reflections when provided", () => {
    const line = pickStrategyReflection(
      "focus",
      { id: "custom", reflections: ["Custom reflection line."] },
      { openProjectCount: 0, brainDumpCount: 0, frequentStarter: false },
    );
    expect(line).toBe("Custom reflection line.");
  });
});
