import { describe, expect, it } from "vitest";
import {
  detectDependencyHint,
  effortBandFromMinutes,
  gentleCompletionAcknowledgement,
  mitReason,
  priorityBandLabel,
  recommendPlanningStyle,
  recommendPlanView,
  taskEnergyFit,
} from "./companionPlanRefinement";
import type { PlanDayItem } from "./types";
import { recommendUniversalView } from "@/lib/presentation/universalViewArchitecture";

function item(title: string, notes?: string): PlanDayItem {
  return {
    id: "1",
    title,
    notes,
    column: "today",
    done: false,
  };
}

describe("companion Plan My Day refinements", () => {
  it("recommends Gentle / Balanced / Focused without requiring answers", () => {
    expect(
      recommendPlanningStyle({ energy: "low", motivation: null, taskCount: 3 })
        .style,
    ).toBe("gentle");
    expect(
      recommendPlanningStyle({
        energy: null,
        motivation: null,
        taskCount: 2,
      }).reason,
    ).toMatch(/Balanced/i);
    expect(
      recommendPlanningStyle({
        energy: "high",
        motivation: "high",
        taskCount: 3,
      }).style,
    ).toBe("focused");
  });

  it("maps effort bands beside minutes", () => {
    expect(effortBandFromMinutes(5)).toBe("tiny");
    expect(effortBandFromMinutes(20)).toBe("small");
    expect(effortBandFromMinutes(40)).toBe("medium");
    expect(effortBandFromMinutes(80)).toBe("large");
    expect(effortBandFromMinutes(120)).toBe("huge");
  });

  it("matches tasks to energy and labels priority bands", () => {
    expect(taskEnergyFit("work on strategy homepage")).toBe("high");
    expect(taskEnergyFit("discuss pricing options")).toBe("medium");
    expect(taskEnergyFit("file paperwork")).toBe("low");
    expect(priorityBandLabel("highest")).toBe("Highest Impact");
    expect(priorityBandLabel("nice")).toBe("Nice if Time");
  });

  it("detects dependency hints without treating them as avoidance", () => {
    const dep = detectDependencyHint(
      item("Call Carolyn", "requires Find insurance paperwork"),
    );
    expect(dep?.kind).toBe("requires");
    expect(dep?.note).toMatch(/Requires/i);

    const waiting = detectDependencyHint(
      item("Send invoice", "waiting for Carolyn"),
    );
    expect(waiting?.kind).toBe("waiting");
  });

  it("explains MIT and offers gentle completion acknowledgement", () => {
    expect(mitReason("work on adhd app", "focused")).toMatch(/Main Focus|forward/i);
    expect(gentleCompletionAcknowledgement("Email Sam")).toMatch(/Nice work/);
    expect(gentleCompletionAcknowledgement("Email Sam")).toContain("Email Sam");
  });

  it("recommends a universal view without hard-coding Plan My Day modes", () => {
    expect(recommendUniversalView({ overwhelmed: true }).mode).toBe("focus");
    expect(recommendUniversalView({ appointmentCount: 4 }).mode).toBe(
      "timeline",
    );
    expect(recommendUniversalView({ energy: "low" }).mode).toBe("energy");
    expect(recommendPlanView({ energy: "low", taskCount: 3 }).mode).toBe(
      "energy",
    );
  });
});
