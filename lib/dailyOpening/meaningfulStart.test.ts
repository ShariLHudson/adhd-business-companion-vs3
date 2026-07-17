import { describe, expect, it, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  recommendMeaningfulStart,
  nextMeaningfulStartRecommendation,
  shariCueForMeaningfulStart,
} from "./meaningfulStart";
import {
  resolveDailyOpeningChoiceAction,
  resolveGlobalDailyOpening,
} from "./resolveGlobalDailyOpening";
import { buildDailyOpeningChoiceCards } from "./buildDailyOpeningChoiceCards";

vi.mock("@/lib/planMyDay/planDayItems", () => ({
  loadTodayPlanItems: () => [
    { id: "p1", title: "Review Create preview", column: "today", done: false },
    { id: "p2", title: "Email Carolyn", column: "today", done: false },
  ],
}));

vi.mock("@/lib/companionStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/companionStore")>();
  return {
    ...actual,
    getProjects: () => [],
  };
});

vi.mock("@/lib/dailyAdaptation/hasActivePlanToday", () => ({
  hasActivePlanForToday: () => false,
}));

describe("Meaningful Start (140)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Choice 1 never auto-opens Plan My Day or resumes prior work", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "explicit-new-day",
    });
    const action = resolveDailyOpeningChoiceAction(
      "continue-meaningful-work",
      opening,
    );
    expect(action).toEqual({ kind: "show-meaningful-start" });
    expect(action).not.toEqual(
      expect.objectContaining({
        kind: "navigate",
        destination: expect.objectContaining({ kind: "plan-my-day" }),
      }),
    );
    expect(action).not.toEqual(
      expect.objectContaining({
        kind: "navigate",
        destination: expect.objectContaining({ kind: "continue" }),
      }),
    );
  });

  it("cards keep three distinct jobs and Choice 1 copy", () => {
    const cards = buildDailyOpeningChoiceCards(null);
    expect(cards).toHaveLength(3);
    expect(cards[0]?.title).toBe("Start With What Matters Most");
    expect(cards[0]?.explanation).toMatch(/not a full day plan/i);
    expect(cards[1]?.title).toBe("Plan or Adapt My Day");
    expect(cards[2]?.title).toBe("Help Me Choose");
  });

  it("recommends one concrete action and Show Me Another changes it", () => {
    const first = recommendMeaningfulStart();
    expect(first.title).toBeTruthy();
    expect(first.clarifying).toBeFalsy();
    const second = nextMeaningfulStartRecommendation(first.id, [first.id]);
    expect(second.id).not.toBe(first.id);
    expect(shariCueForMeaningfulStart(first)).toMatch(/meaningful next step/i);
  });

  it("wires Meaningful Start UI and does not resume on Choice 1 in CPC", () => {
    const cpc = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(cpc).toContain('mode="meaningful-start"');
    expect(cpc).toContain("handleMeaningfulStartAction");
    expect(cpc).toContain("show-meaningful-start");
    expect(cpc).not.toMatch(
      /continue-meaningful-work[\s\S]{0,200}openPlanAdaptSharedCore\("plan"\)/,
    );
  });
});
