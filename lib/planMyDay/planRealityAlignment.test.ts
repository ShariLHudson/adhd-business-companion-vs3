import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DayState } from "../companionStore";
import type { PlanDayItem } from "./types";
import {
  dismissPlanRealityPrompt,
  evaluatePlanRealityMismatch,
  resetPlanRealityPromptDismissal,
  summarizeDayReality,
} from "./planRealityAlignment";

vi.mock("../companionStore", () => ({
  getDayState: vi.fn(),
}));

import { getDayState } from "../companionStore";

const constrainedDay: DayState = {
  energy: "low",
  overwhelm: "high",
  energyLevel: "running-on-fumes",
  motivationLevel: "dragging",
  vibe: "struggling",
  needs: [],
  setAt: new Date().toISOString(),
};

function item(title: string, partial?: Partial<PlanDayItem>): PlanDayItem {
  return {
    id: `id-${title}`,
    title,
    column: "ready",
    done: false,
    ...partial,
  };
}

describe("planRealityAlignment", () => {
  const sessionStore: Record<string, string> = {};

  beforeEach(() => {
    vi.mocked(getDayState).mockReturnValue(constrainedDay);
    const storage = {
      getItem: (k: string) => sessionStore[k] ?? null,
      setItem: (k: string, v: string) => {
        sessionStore[k] = v;
      },
      removeItem: (k: string) => {
        delete sessionStore[k];
      },
    };
    vi.stubGlobal("sessionStorage", storage);
    Object.keys(sessionStore).forEach((k) => delete sessionStore[k]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetPlanRealityPromptDismissal();
  });

  it("summarizes constrained day state for the prompt", () => {
    const summary = summarizeDayReality(constrainedDay);
    expect(summary).toContain("Low energy");
    expect(summary.some((s) => /limited|drive|tougher/i.test(s))).toBe(true);
  });

  it("does not prompt when reality is not constrained", () => {
    vi.mocked(getDayState).mockReturnValue({
      ...constrainedDay,
      energy: "high",
      overwhelm: "low",
      energyLevel: "full-tank",
      motivationLevel: "get-it-done",
      vibe: "feeling-good",
    });
    const items = [
      item("Finish sales page"),
      item("Create webinar"),
      item("Build landing page"),
    ];
    expect(evaluatePlanRealityMismatch(items)).toBeNull();
  });

  it("does not prompt with fewer than three active items", () => {
    expect(
      evaluatePlanRealityMismatch([
        item("Finish sales page"),
        item("Create webinar"),
      ]),
    ).toBeNull();
  });

  it("prompts when constrained reality meets heavy workload", () => {
    const items = [
      item("Finish sales page"),
      item("Create webinar"),
      item("Build landing page"),
      item("Write email sequence"),
      item("Update website"),
    ];
    const prompt = evaluatePlanRealityMismatch(items, {
      newItemTitle: "Update website",
    });
    expect(prompt).not.toBeNull();
    expect(prompt?.reasons.length).toBeGreaterThan(0);
    expect(prompt?.realitySummary.length).toBeGreaterThan(0);
  });

  it("respects dismiss until workload grows", () => {
    const items = [
      item("Finish sales page"),
      item("Create webinar"),
      item("Build landing page"),
      item("Write email sequence"),
    ];
    dismissPlanRealityPrompt(items);
    expect(evaluatePlanRealityMismatch(items)).toBeNull();
    const heavier = [
      ...items,
      item("Launch new funnel"),
      item("Rebuild entire website"),
    ];
    expect(
      evaluatePlanRealityMismatch(heavier, { newItemTitle: "Rebuild entire website" }),
    ).not.toBeNull();
  });
});
