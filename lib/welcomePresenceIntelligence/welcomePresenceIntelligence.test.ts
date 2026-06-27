import { describe, expect, it, beforeEach } from "vitest";
import { clearCarryForwardStoreForTests } from "@/lib/carryForward/dayVisit";
import { evaluateWelcomePresenceIntelligence } from "./evaluateWelcomePresenceIntelligence";
import { clearVoiceUsageForTests, violatesShariVoice } from "@/lib/shariVoiceBible";

describe("WelcomePresenceIntelligence", () => {
  beforeEach(() => {
    clearVoiceUsageForTests();
    clearCarryForwardStoreForTests();
  });

  it("welcomes day one from Voice Bible", () => {
    const intel = evaluateWelcomePresenceIntelligence({
      homeState: "FIRST_VISIT",
      timeOfDay: "morning",
      sessionVisitIndex: 1,
      returnIntervalHours: null,
      returnIntervalDays: null,
      isFirstMeeting: true,
    });
    expect(intel.greetingCategory).toBe("day_one");
    expect(intel.greeting.length).toBeGreaterThan(0);
    expect(violatesShariVoice(intel.greeting)).toBe(false);
    if (intel.invite) {
      expect(violatesShariVoice(intel.invite)).toBe(false);
    }
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
    expect(intel.greeting).toContain("Alex");
    expect(violatesShariVoice(intel.greeting)).toBe(false);
  });

  it("chooses recovery mood gently", () => {
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
    expect(intel.chatPlaceholder.length).toBeGreaterThan(0);
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
    expect(intel.greeting.length).toBeLessThanOrEqual(32);
    expect(intel.presence).toBeDefined();
    expect(intel.restraint).toBeDefined();
    expect(intel.character).toBeDefined();
    expect(intel.character.greeting.authentic).toBe(true);
  });

  it("uses earned wonder questions with prior thread — not topic citation", () => {
    const intel = evaluateWelcomePresenceIntelligence({
      homeState: "QUIET_PRESENCE",
      timeOfDay: "afternoon",
      sessionVisitIndex: 30,
      returnIntervalHours: 20,
      returnIntervalDays: 1,
      isFirstMeeting: false,
      previousTopic: "the product launch",
    });
    if (intel.invite) {
      expect(intel.invite).not.toMatch(/last time/i);
      expect(intel.invite).not.toMatch(/you (said|mentioned)/i);
      expect(intel.invite).not.toMatch(/launch/i);
    }
  });
});
