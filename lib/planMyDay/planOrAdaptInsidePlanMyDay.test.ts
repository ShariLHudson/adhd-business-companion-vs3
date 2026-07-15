/**
 * Adapt My Day must be a real path inside Plan My Day — not Welcome Card wording only.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resolvePlanOrAdaptChoices } from "@/lib/dailyAdaptation";

describe("Plan or Adapt inside Plan My Day", () => {
  it("recommends Plan when no plan exists and Adapt when a plan exists", () => {
    const noPlan = resolvePlanOrAdaptChoices({ hasPlanToday: false });
    expect(noPlan.find((c) => c.id === "plan-my-day")?.recommended).toBe(true);
    expect(noPlan.find((c) => c.id === "adapt-my-day")?.recommended).toBe(false);

    const withPlan = resolvePlanOrAdaptChoices({ hasPlanToday: true });
    expect(withPlan.find((c) => c.id === "adapt-my-day")?.recommended).toBe(true);
    expect(withPlan.find((c) => c.id === "plan-my-day")?.recommended).toBe(false);
  });

  it("wires AdaptMyDayCheckIn and path chooser into PlanMyDayPanel", () => {
    const panel = readFileSync(
      resolve(process.cwd(), "components/companion/PlanMyDayPanel.tsx"),
      "utf8",
    );
    expect(panel).toContain("AdaptMyDayCheckIn");
    expect(panel).toContain("PlanOrAdaptPathChooser");
    expect(panel).toContain('data-testid="plan-day-adapt-my-day"');
    expect(panel).not.toContain("AdjustMyDayPanel");
  });
});
