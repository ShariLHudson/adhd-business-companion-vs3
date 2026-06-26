import { describe, expect, it } from "vitest";
import { CompanionBrain } from "@/lib/companionBrain";
import { mapFixtureToCompanionMemory } from "@/lib/planMyDay/companionBrainClient/mapFixtureToMemory";
import { NORMAL_TUESDAY } from "@/lib/planMyDay/dailyCompanionCycle/fixtures/simulations";
import type { PlanDayItem } from "@/lib/planMyDay/types";
import {
  applyPlanSwap,
  gatherPlanAdjustmentPresentation,
  hidePlanItemForToday,
} from "./planAdjustment";

function item(
  id: string,
  title: string,
  column: PlanDayItem["column"],
): PlanDayItem {
  return { id, title, column, done: false };
}

describe("gatherPlanAdjustmentPresentation", () => {
  it("offers swaps from ready items without touching reality", () => {
    const memory = mapFixtureToCompanionMemory(NORMAL_TUESDAY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const items = [
      item("1", "Finish LinkedIn post", "today"),
      item("2", "Outline newsletter", "ready"),
      item("3", "Email client", "ready"),
    ];
    const presentation = gatherPlanAdjustmentPresentation(items, judgment);
    expect(presentation.offers.length).toBeGreaterThan(0);
    const linkedInOffer = presentation.offers.find((o) =>
      /linkedin/i.test(o.currentTitle),
    );
    expect(linkedInOffer?.alternatives.some((a) => /newsletter/i.test(a.title))).toBe(
      true,
    );
  });

  it("includes brain proposals not yet on the board", () => {
    const memory = mapFixtureToCompanionMemory(NORMAL_TUESDAY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const items = [item("1", "Only task", "today")];
    const presentation = gatherPlanAdjustmentPresentation(items, judgment);
    const allAlts = [
      ...presentation.offers.flatMap((o) => o.alternatives),
      ...presentation.extras,
    ];
    if (judgment.proposals.length > 0) {
      expect(allAlts.length).toBeGreaterThan(0);
    }
  });
});

describe("applyPlanSwap", () => {
  it("moves focus item to ready and promotes alternative", () => {
    const memory = mapFixtureToCompanionMemory(NORMAL_TUESDAY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const items = [
      item("1", "Finish LinkedIn post", "today"),
      item("2", "Outline newsletter", "ready"),
    ];
    const next = applyPlanSwap(items, "1", {
      id: "item-2",
      title: "Outline newsletter",
      source: "ready",
      sourceLabel: "Ready",
      itemId: "2",
      reason: "test",
    }, judgment);
    expect(next.find((i) => i.id === "1")?.column).toBe("ready");
    expect(next.find((i) => i.id === "2")?.column).toBe("today");
  });
});

describe("hidePlanItemForToday", () => {
  it("parks item without deleting", () => {
    const items = [item("1", "Task", "today")];
    const next = hidePlanItemForToday(items, "1");
    expect(next.find((i) => i.id === "1")?.column).toBe("parked");
  });
});
