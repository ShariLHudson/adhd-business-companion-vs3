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

  it("wires Adapt and complete Plan workflow into the shared Plan Adapt window", () => {
    const shared = readFileSync(
      resolve(process.cwd(), "components/companion/PlanAdaptSharedWindow.tsx"),
      "utf8",
    );
    expect(shared).toContain("AdaptMyDayCheckIn");
    expect(shared).toContain("PlanMyDayCompleteWorkflow");
    expect(shared).toContain("PlanDaySimpleList");
    expect(shared).toContain("PlanDaySimpleAdd");
    expect(shared).not.toContain("AdjustMyDayPanel");
  });

  it("routes generic Plan My Day opens to the shared complete workflow", () => {
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

    const workflow = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/PlanMyDayCompleteWorkflow.tsx",
      ),
      "utf8",
    );
    expect(workflow).toContain("aria-pressed");
    expect(workflow).toContain("plan-day-style-recommendation");
    expect(workflow).toContain("Today&apos;s Most Important Task");
    expect(workflow).toContain("plan-day-energy-groups");
  });
});
