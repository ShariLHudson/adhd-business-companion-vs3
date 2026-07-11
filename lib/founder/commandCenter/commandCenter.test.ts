import { describe, expect, it } from "vitest";

import {
  ATTENTION_LEVEL_LABELS,
  classifyAttention,
  composeAttention,
  composeCommandCenter,
  composeExecutiveDesk,
  composeFocus,
  composeLeverage,
  composeToday,
  groupByAttentionLevel,
  calculateFocusScore,
} from "./index";

describe("Executive Command Center", () => {
  it("composes full command center from existing intelligence", () => {
    const center = composeCommandCenter({ missionId: "listening-rooms" });
    expect(center.product).toBe("founder");
    expect(center.sources.length).toBeGreaterThanOrEqual(10);
    expect(center.desk.todaysMission.id).toBe("listening-rooms");
    expect(center.today.morning.greeting).toMatch(/Shari/i);
    expect(center.today.morning.calmClose).toContain("wait");
  });

  it("desk limits competing attention", () => {
    const desk = composeExecutiveDesk("listening-rooms");
    expect(desk.todaysMission.name).toContain("Listening");
    expect(desk.executiveBriefHeadline.length).toBeGreaterThan(0);
    expect(desk.topOpportunities.length).toBeLessThanOrEqual(3);
    expect(desk.recommendedNextAction.label.length).toBeGreaterThan(0);
  });

  it("classifies attention into NOW NEXT WATCH LIBRARY", () => {
    const attention = composeAttention("listening-rooms");
    expect(attention.byLevel.now.length).toBeGreaterThan(0);
    expect(ATTENTION_LEVEL_LABELS.now).toContain("today");
    expect(attention.ignore.length).toBeGreaterThan(0);

    const item = classifyAttention({
      id: "t",
      title: "Test",
      summary: "s",
      level: "watch",
      source: "test",
    });
    expect(groupByAttentionLevel([item]).watch).toHaveLength(1);
  });

  it("calculates focus score and recommends simplification", () => {
    const focus = composeFocus("listening-rooms");
    expect(focus.focus.score).toBeGreaterThanOrEqual(0);
    expect(focus.focus.score).toBeLessThanOrEqual(100);
    expect(focus.simplification.length).toBeGreaterThan(0);
  });

  it("estimates executive leverage", () => {
    const leverage = composeLeverage("listening-rooms");
    expect(leverage.items.length).toBeGreaterThan(0);
    expect(leverage.topRecommendation.length).toBeGreaterThan(10);
  });

  it("composeToday delivers morning experience", () => {
    const today = composeToday({ missionId: "listening-rooms" });
    expect(today.morning.officePrepared).toContain("prepared");
    expect(today.morning.missionLine).toContain("Listening");
  });

  it("detects friction without duplicating orchestrator", () => {
    const center = composeCommandCenter();
    expect(center.friction.some((f) => f.reduction.length > 0)).toBe(true);
  });

  it("focus score reacts to attention load", () => {
    const overloaded = calculateFocusScore(
      [
        classifyAttention({ id: "1", title: "a", summary: "", level: "now", source: "t" }),
        classifyAttention({ id: "2", title: "b", summary: "", level: "now", source: "t" }),
        classifyAttention({ id: "3", title: "c", summary: "", level: "now", source: "t" }),
        classifyAttention({ id: "4", title: "d", summary: "", level: "now", source: "t" }),
      ],
      4,
      6,
    );
    expect(overloaded.label).toBe("overloaded");
  });
});
