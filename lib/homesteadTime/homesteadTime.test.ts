import { describe, expect, it } from "vitest";
import {
  HOMESTEAD_TIME_PERIODS,
  legacyTimeOfDayFromPeriod,
  resolveContinuousHomesteadTime,
  resolveHomesteadTime,
  resolveHomesteadTimePeriod,
} from "@/lib/homesteadTime";

describe("Homestead Time™", () => {
  it("resolves seven daily periods from clock time", () => {
    expect(resolveHomesteadTimePeriod(new Date("2026-06-25T06:15:00"))).toBe(
      "dawn",
    );
    expect(resolveHomesteadTimePeriod(new Date("2026-06-25T08:45:00"))).toBe(
      "morning",
    );
    expect(resolveHomesteadTimePeriod(new Date("2026-06-25T11:20:00"))).toBe(
      "midday",
    );
    expect(resolveHomesteadTimePeriod(new Date("2026-06-25T14:15:00"))).toBe(
      "afternoon",
    );
    expect(resolveHomesteadTimePeriod(new Date("2026-06-25T17:50:00"))).toBe(
      "golden-hour",
    );
    expect(resolveHomesteadTimePeriod(new Date("2026-06-25T20:30:00"))).toBe(
      "evening",
    );
    expect(resolveHomesteadTimePeriod(new Date("2026-06-25T23:10:00"))).toBe(
      "night",
    );
  });

  it("maps rich periods onto legacy four-bucket consumers", () => {
    expect(legacyTimeOfDayFromPeriod("midday")).toBe("morning");
    expect(legacyTimeOfDayFromPeriod("golden-hour")).toBe("evening");
    expect(legacyTimeOfDayFromPeriod("afternoon")).toBe("afternoon");
  });

  it("interpolates continuously within a period", () => {
    const early = resolveContinuousHomesteadTime(
      new Date("2026-06-25T17:10:00"),
      "golden-hour",
    );
    const late = resolveContinuousHomesteadTime(
      new Date("2026-06-25T19:10:00"),
      "golden-hour",
    );
    expect(late.sunWarmth).toBeGreaterThan(early.sunWarmth);
    expect(late.shadowLength).toBeGreaterThan(early.shadowLength);
  });

  it("shifts room defaults from coffee to tea through the day", () => {
    const morning = resolveHomesteadTime({
      now: new Date("2026-06-25T08:30:00"),
      placeId: "living-room",
    });
    const evening = resolveHomesteadTime({
      now: new Date("2026-06-25T20:30:00"),
      placeId: "living-room",
    });
    expect(morning.roomDefaults.primaryDrink).toBe("coffee");
    expect(evening.roomDefaults.primaryDrink).toBe("tea");
    expect(evening.roomDefaults.lampEmphasis).toBe(true);
  });

  it("provides ADHD rhythm tones without scripted UI copy", () => {
    const morning = resolveHomesteadTime({
      now: new Date("2026-06-25T08:30:00"),
    });
    const night = resolveHomesteadTime({
      now: new Date("2026-06-25T23:00:00"),
    });
    expect(morning.conversation.tone).toBe("hope");
    expect(night.conversation.tone).toBe("gentleness");
    expect(morning.conversation.hints[0].length).toBeGreaterThan(0);
  });

  it("covers a full Iowa day without gaps", () => {
    expect(HOMESTEAD_TIME_PERIODS).toHaveLength(7);
  });
});
