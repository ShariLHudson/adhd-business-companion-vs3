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

  it("wires Adapt and progressive Plan journey into the shared Plan Adapt window", () => {
    const shared = readFileSync(
      resolve(process.cwd(), "components/companion/PlanAdaptSharedWindow.tsx"),
      "utf8",
    );
    expect(shared).toContain("AdaptMyDayCheckIn");
    expect(shared).toContain("ProgressivePlanMyDay");
    expect(shared).not.toContain("PlanMyDayCompleteWorkflow");
    expect(shared).not.toContain("AdjustMyDayPanel");
  });

  it("routes generic Plan My Day opens to the shared progressive Plan path", () => {
    const cpc = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(cpc).toContain("hasDeepLink");
    expect(cpc).toMatch(
      /if \(!hasDeepLink\) \{\s*openPlanAdaptSharedCore\("plan"\);/,
    );
    expect(cpc).toContain('case "plan-my-day":');
    expect(cpc).toContain('openPlanAdaptSharedCore("plan")');

    const progressive = readFileSync(
      resolve(process.cwd(), "components/companion/ProgressivePlanMyDay.tsx"),
      "utf8",
    );
    expect(progressive).toContain("plan-day-progressive");
    expect(progressive).toContain("on your mind today?");
    expect(progressive).toContain("Still about the same?");
    expect(progressive).not.toContain("Matched to Energy");
    expect(progressive).not.toContain("Suggested Order");
  });
});
