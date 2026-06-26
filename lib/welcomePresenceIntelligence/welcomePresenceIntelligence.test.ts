import { describe, expect, it } from "vitest";
import { evaluateWelcomePresenceIntelligence } from "./evaluateWelcomePresenceIntelligence";

describe("WelcomePresenceIntelligence™", () => {
  it("welcomes day one with earned simplicity", () => {
    const intel = evaluateWelcomePresenceIntelligence({
      homeState: "FIRST_VISIT",
      timeOfDay: "morning",
      sessionVisitIndex: 1,
      returnIntervalHours: null,
      returnIntervalDays: null,
      isFirstMeeting: true,
    });
    expect(intel.greetingCategory).toBe("day_one");
    expect(intel.greeting).toMatch(/welcome|here for you/i);
    expect(intel.invite).toMatch(/on your mind today/i);
    expect(intel.animationProfile).toBe("living");
  });

  it("prioritizes birthday over ordinary morning", () => {
    const intel = evaluateWelcomePresenceIntelligence({
      homeState: "QUIET_PRESENCE",
      timeOfDay: "morning",
      sessionVisitIndex: 40,
      returnIntervalHours: 20,
      returnIntervalDays: 1,
      isFirstMeeting: false,
      birthdayToday: true,
      firstName: "Alex",
    });
    expect(intel.greetingCategory).toBe("birthday");
    expect(intel.greeting).toMatch(/celebrate/i);
    expect(intel.greeting).toContain("Alex");
  });

  it("chooses recovery copy gently", () => {
    const intel = evaluateWelcomePresenceIntelligence({
      homeState: "QUIET_PRESENCE",
      timeOfDay: "afternoon",
      sessionVisitIndex: 12,
      returnIntervalHours: 48,
      returnIntervalDays: 2,
      isFirstMeeting: false,
      recoveryGentle: true,
    });
    expect(intel.greetingCategory).toBe("recovery");
    expect(intel.mood).toBe("gentle");
    expect(intel.chatPlaceholder).toMatch(/no rush/i);
  });

  it("is stable within the same day", () => {
    const base = {
      homeState: "QUIET_PRESENCE" as const,
      timeOfDay: "morning" as const,
      sessionVisitIndex: 22,
      returnIntervalHours: 16,
      returnIntervalDays: 0.6,
      isFirstMeeting: false,
      now: new Date("2026-06-25T09:00:00"),
    };
    const a = evaluateWelcomePresenceIntelligence(base);
    const b = evaluateWelcomePresenceIntelligence(base);
    expect(a.greeting).toBe(b.greeting);
    expect(a.invite).toBe(b.invite);
  });

  it("earns deeper greetings over time", () => {
    const intel = evaluateWelcomePresenceIntelligence({
      homeState: "QUIET_PRESENCE",
      timeOfDay: "morning",
      sessionVisitIndex: 200,
      returnIntervalHours: 14,
      returnIntervalDays: 0.5,
      isFirstMeeting: false,
    });
    expect(intel.greetingCategory).toBe("relationship_years");
  });
});
