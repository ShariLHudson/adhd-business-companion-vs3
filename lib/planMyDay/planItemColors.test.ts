import { describe, expect, it } from "vitest";
import { addQuickPlanItem } from "./planDayItems";
import { inferPlanLifeDomain, planItemStyle } from "./planItemColors";

describe("planItemColors", () => {
  it("maps business tasks to blue", () => {
    expect(inferPlanLifeDomain("ADHD App")).toBe("business");
    expect(planItemStyle({ title: "Follow Up Emails" }).color).toBe("#4a6fa5");
  });

  it("uses explicit category over inference", () => {
    expect(planItemStyle({ title: "ADHD App", category: "health" }).domain).toBe(
      "health",
    );
  });

  it("maps health tasks to green", () => {
    expect(inferPlanLifeDomain("Ride Bike")).toBe("health");
  });

  it("maps research to learning purple", () => {
    expect(inferPlanLifeDomain("Research")).toBe("learning");
  });

  it("uses neutral styling when color coding is off", () => {
    const neutral = planItemStyle({ title: "Ride Bike" }, false);
    expect(neutral.color).toBe("#d4cdc3");
    expect(neutral.tint).toBe("#ffffff");
  });
});

describe("addQuickPlanItem", () => {
  it("accepts category and start time", () => {
    const result = addQuickPlanItem({
      title: "Call client",
      category: "business",
      startTime: "14:30",
    });
    const added = result[result.length - 1]!;
    expect(added.category).toBe("business");
    expect(added.startTime).toBe("14:30");
  });
});
