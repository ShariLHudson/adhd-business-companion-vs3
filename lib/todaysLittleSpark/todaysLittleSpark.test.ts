import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  evaluateTodaysLittleSpark,
  formatSparkDelivery,
  resetSparkStoreForTests,
  SPARK_CATALOG,
  sparkOnCooldown,
} from "./index";
import { isNearFullMoon } from "./evaluateTodaysLittleSpark";
import { resolveSparkSeason } from "./season";

describe("todaysLittleSpark", () => {
  beforeEach(() => {
    const localMem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => localMem.get(k) ?? null,
      setItem: (k: string, v: string) => localMem.set(k, v),
      removeItem: (k: string) => localMem.delete(k),
      clear: () => localMem.clear(),
    });
    resetSparkStoreForTests();
  });

  it("suppresses on first meeting and non-first visit of day", () => {
    const base = {
      season: "summer" as const,
      timeOfDay: "morning" as const,
      forceEligible: true,
      now: new Date("2026-07-21T09:00:00"),
    };
    expect(
      evaluateTodaysLittleSpark({ ...base, isFirstVisitOfDay: true, isFirstMeeting: true })
        .suppressedReason,
    ).toBe("first_meeting");
    expect(
      evaluateTodaysLittleSpark({ ...base, isFirstVisitOfDay: false, isFirstMeeting: false })
        .suppressedReason,
    ).toBe("not_first_visit_of_day");
  });

  it("suppresses when birthday greeting already covers the moment", () => {
    const result = evaluateTodaysLittleSpark({
      now: new Date("2026-07-21T09:00:00"),
      season: "summer",
      timeOfDay: "morning",
      isFirstVisitOfDay: true,
      isFirstMeeting: false,
      birthdayToday: true,
      forceEligible: true,
    });
    expect(result.spark).toBeNull();
    expect(result.suppressedReason).toBe("birthday_greeting");
  });

  it("shows personal conversation milestone over frequency gate", () => {
    const result = evaluateTodaysLittleSpark({
      now: new Date("2026-03-10T10:00:00"),
      season: "spring",
      timeOfDay: "morning",
      isFirstVisitOfDay: true,
      isFirstMeeting: false,
      conversationStarts: 100,
      forceEligible: false,
    });
    expect(result.spark?.category).toBe("personal");
    expect(result.spark?.id).toBe("personal-100-conversations");
    expect(result.spark?.deliveryText).toMatch(/hundredth conversation/i);
  });

  it("matches fun holiday on the correct day with conversational delivery", () => {
    const result = evaluateTodaysLittleSpark({
      now: new Date("2026-07-21T09:00:00"),
      season: "summer",
      timeOfDay: "morning",
      isFirstVisitOfDay: true,
      isFirstMeeting: false,
      forceEligible: true,
    });
    expect(result.spark?.id).toBe("holiday-ice-cream-day");
    expect(result.spark?.deliveryText).not.toMatch(/^Today is National/i);
    expect(result.spark?.deliveryText).toMatch(/ice cream/i);
  });

  it("respects region-specific holidays", () => {
    const gb = evaluateTodaysLittleSpark({
      now: new Date("2026-04-21T09:00:00"),
      region: "GB",
      season: "spring",
      timeOfDay: "morning",
      isFirstVisitOfDay: true,
      isFirstMeeting: false,
      forceEligible: true,
    });
    expect(gb.spark?.id).toBe("holiday-afternoon-tea-gb");

    const us = evaluateTodaysLittleSpark({
      now: new Date("2026-04-21T09:00:00"),
      region: "US",
      season: "spring",
      timeOfDay: "morning",
      isFirstVisitOfDay: true,
      isFirstMeeting: false,
      forceEligible: true,
    });
    expect(us.spark?.id).not.toBe("holiday-afternoon-tea-gb");
  });

  it("boosts sparks that match user interests", () => {
    const coffeeDay = new Date("2026-09-29T08:00:00");
    const withCoffee = evaluateTodaysLittleSpark({
      now: coffeeDay,
      season: "autumn",
      timeOfDay: "morning",
      isFirstVisitOfDay: true,
      isFirstMeeting: false,
      favoriteDrink: "coffee",
      forceEligible: true,
    });
    expect(withCoffee.spark?.id).toBe("holiday-coffee-day");
  });

  it("does not repeat sparks within cooldown window", () => {
    const now = new Date("2026-07-21T09:00:00");
    const first = evaluateTodaysLittleSpark({
      now,
      season: "summer",
      timeOfDay: "morning",
      isFirstVisitOfDay: true,
      isFirstMeeting: false,
      forceEligible: true,
      record: true,
    });
    expect(first.spark?.id).toBe("holiday-ice-cream-day");

    const again = evaluateTodaysLittleSpark({
      now: new Date("2026-07-22T09:00:00"),
      season: "summer",
      timeOfDay: "morning",
      isFirstVisitOfDay: true,
      isFirstMeeting: false,
      forceEligible: true,
    });
    expect(again.spark?.id).not.toBe("holiday-ice-cream-day");
    expect(sparkOnCooldown("holiday-ice-cream-day", 45, now)).toBe(true);
  });

  it("silences when frequency gate closes and no personal milestone", () => {
    const result = evaluateTodaysLittleSpark({
      now: new Date("2026-07-21T09:00:00"),
      season: "summer",
      timeOfDay: "morning",
      isFirstVisitOfDay: true,
      isFirstMeeting: false,
      memberSinceIso: "2020-01-01T00:00:00.000Z",
      forceEligible: false,
    });
    if (!result.spark) {
      expect(result.suppressedReason).toMatch(/frequency_gate|no_candidate|already_sparked/);
    }
  });

  it("flips season for southern hemisphere", () => {
    const july = new Date("2026-07-15T12:00:00");
    expect(resolveSparkSeason("US", july)).toBe("summer");
    expect(resolveSparkSeason("AU", july)).toBe("winter");
  });

  it("never uses trivia-calendar phrasing in catalog bodies", () => {
    for (const entry of SPARK_CATALOG) {
      for (const body of entry.bodies) {
        expect(body).not.toMatch(/^Today is National /);
        expect(body).not.toMatch(/^On this day in history/i);
      }
    }
  });

  it("formatSparkDelivery keeps already-conversational bodies intact", () => {
    const body =
      "Before we get started… apparently today is National Ice Cream Day.";
    expect(formatSparkDelivery(body, "seed", { includeOpener: true })).toBe(body);
  });

  it("includes environment objects for seasonal sparks", () => {
    const result = evaluateTodaysLittleSpark({
      now: new Date("2026-10-15T17:00:00"),
      season: "autumn",
      timeOfDay: "evening",
      isFirstVisitOfDay: true,
      isFirstMeeting: false,
      forceEligible: true,
    });
    expect(result.spark?.environmentObjects?.some((o) => o.kind === "pumpkins")).toBe(
      true,
    );
  });

  it("only surfaces full moon spark near full moon evenings", () => {
    const fullMoon = new Date("2023-06-03T20:00:00");
    expect(isNearFullMoon(fullMoon)).toBe(true);
    const result = evaluateTodaysLittleSpark({
      now: fullMoon,
      season: "summer",
      timeOfDay: "evening",
      isFirstVisitOfDay: true,
      isFirstMeeting: false,
      forceEligible: true,
    });
    expect(result.spark?.id).toBe("nature-full-moon");
  });
});
