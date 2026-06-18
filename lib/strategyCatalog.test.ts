import { describe, expect, it } from "vitest";
import { businessBuiltinStrategyCount, businessStrategyDropdownGroups } from "./strategyCatalog";

describe("businessStrategyDropdownGroups", () => {
  it("includes built-in business strategies by category", () => {
    const groups = businessStrategyDropdownGroups();
    expect(groups.length).toBeGreaterThan(0);
    const all = groups.flatMap((g) => g.options);
    expect(all.length).toBeGreaterThan(10);
    expect(businessBuiltinStrategyCount()).toBe(all.length);
    expect(all.some((o) => o.label.toLowerCase().includes("channel"))).toBe(
      true,
    );
  });
});
