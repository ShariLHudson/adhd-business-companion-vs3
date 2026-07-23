import { describe, expect, it } from "vitest";
import { SAMPLE_FIRE_TODAY_PORTFOLIO } from "@/lib/founder/repositories/sample/fireData";
import { FIRE_BRIEF_SECTION_ORDER } from "@/lib/founder/types/fireBriefDetail";
import {
  buildExecutiveBriefDetail,
  withExecutiveBriefDetail,
} from "./buildExecutiveBriefDetail";
import { composeTodayFirePortfolio } from "./composeTodayFirePortfolio";

describe("buildExecutiveBriefDetail", () => {
  it("includes every supported report section in order", () => {
    const portfolio = composeTodayFirePortfolio({ dateKey: "2026-07-23" });
    const detail = buildExecutiveBriefDetail({ portfolio });

    expect(detail.sections.map((s) => s.id)).toEqual([...FIRE_BRIEF_SECTION_ORDER]);
    expect(detail.reportName).toBe("Spark Estate Executive Intelligence Brief");
    expect(detail.fullDateDisplay).toMatch(/2026/);
    expect(detail.overview.topDevelopments.length).toBeGreaterThan(0);
    expect(detail.overview.topActions.length).toBeGreaterThan(0);
    expect(detail.overview.iznaPriorityAssignment).toBeTruthy();
  });

  it("maps founder alerts into three readable levels", () => {
    const portfolio = withExecutiveBriefDetail({
      ...SAMPLE_FIRE_TODAY_PORTFOLIO,
      alerts: [
        {
          id: "a1",
          priorityLevel: "attention",
          title: "Decide today",
          explanation: "Blocks progress",
          recommendedAction: "Choose a path",
        },
        {
          id: "a2",
          priorityLevel: "awareness",
          title: "Watch this",
          explanation: "May matter",
          recommendedAction: "Keep an eye on it",
        },
        {
          id: "a3",
          priorityLevel: "noted",
          title: "FYI",
          explanation: "Context only",
          recommendedAction: "No action",
        },
      ],
    });
    const alerts = portfolio.executiveBriefDetail?.sections.find(
      (s) => s.id === "founder_alerts",
    )?.alerts;
    expect(alerts?.map((a) => a.level)).toEqual([
      "needs_attention_today",
      "watch_closely",
      "worth_knowing",
    ]);
    expect(alerts?.[0]?.decisionNeeded).toBe(true);
    expect(alerts?.[2]?.decisionNeeded).toBe(false);
  });

  it("keeps complete Izna instructions", () => {
    const detail = buildExecutiveBriefDetail({
      portfolio: composeTodayFirePortfolio({ dateKey: "2026-07-23" }),
    });
    const izna = detail.sections.find((s) => s.id === "izna_work_package");
    const assignment = izna?.iznaAssignments?.[0];
    expect(assignment?.steps.length).toBeGreaterThan(2);
    expect(assignment?.definitionOfDone.length).toBeGreaterThan(10);
    expect(assignment?.expectedDeliverables.length).toBeGreaterThan(0);
    expect(assignment?.returnToFounder.length).toBeGreaterThan(5);
  });

  it("groups action plan into Today / This Week / Watch", () => {
    const detail = buildExecutiveBriefDetail({
      portfolio: composeTodayFirePortfolio({ dateKey: "2026-07-23" }),
    });
    const plan = detail.sections.find((s) => s.id === "founder_action_plan");
    const horizons = new Set(plan?.actionPlan?.map((a) => a.horizon));
    expect(horizons.has("today")).toBe(true);
    expect(
      horizons.has("this_week") || horizons.has("watch"),
    ).toBe(true);
  });

  it("reports changed-since-yesterday when comparison exists", () => {
    const today = composeTodayFirePortfolio({ dateKey: "2026-07-23" });
    const yesterday = {
      ...composeTodayFirePortfolio({ dateKey: "2026-07-22" }),
      primaryFocus: "Yesterday focus was different entirely.",
    };
    const detail = buildExecutiveBriefDetail({
      portfolio: today,
      yesterdayPortfolio: yesterday,
    });
    expect(detail.overview.changedSinceYesterday.length).toBeGreaterThan(0);
  });

  it("does not drop detail when legacy portfolio has no executiveBriefDetail", () => {
    const legacy = { ...SAMPLE_FIRE_TODAY_PORTFOLIO };
    delete (legacy as { executiveBriefDetail?: unknown }).executiveBriefDetail;
    const detail = buildExecutiveBriefDetail({ portfolio: legacy });
    expect(detail.sections).toHaveLength(16);
  });
});
