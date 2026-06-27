import { describe, expect, it } from "vitest";
import { evaluateGreetingIntelligence } from "./evaluateGreetingIntelligence";
import { clearVoiceUsageForTests, violatesShariVoice } from "@/lib/shariVoiceBible";

describe("GreetingIntelligence", () => {
  it("composes first visit from Voice Bible — not random lists", () => {
    clearVoiceUsageForTests();
    const intel = evaluateGreetingIntelligence({
      homeState: "FIRST_VISIT",
      timeOfDay: "morning",
      sessionVisitIndex: 1,
      returnIntervalHours: null,
      returnIntervalDays: null,
      isFirstMeeting: true,
    });
    expect(intel.greeting.length).toBeGreaterThan(0);
    expect(violatesShariVoice(intel.greeting)).toBe(false);
    if (intel.reconnectionQuestion) {
      expect(violatesShariVoice(intel.reconnectionQuestion)).toBe(false);
    }
  });

  it("uses earned wonder when prior thread is known", () => {
    clearVoiceUsageForTests();
    const intel = evaluateGreetingIntelligence({
      homeState: "QUIET_PRESENCE",
      timeOfDay: "afternoon",
      sessionVisitIndex: 20,
      returnIntervalHours: 20,
      returnIntervalDays: 1,
      isFirstMeeting: false,
      previousTopic: "the launch plan",
    });
    expect(intel.reconnectionQuestion).toBeTruthy();
    expect(intel.reconnectionQuestion).not.toMatch(/launch plan/i);
    expect(violatesShariVoice(intel.reconnectionQuestion ?? "")).toBe(false);
  });

  it("welcomes long absence from the bible", () => {
    clearVoiceUsageForTests();
    const intel = evaluateGreetingIntelligence({
      homeState: "QUIET_PRESENCE",
      timeOfDay: "evening",
      sessionVisitIndex: 30,
      returnIntervalHours: 24 * 50,
      returnIntervalDays: 50,
      isFirstMeeting: false,
    });
    expect(intel.greeting.length).toBeGreaterThan(0);
    expect(violatesShariVoice(intel.greeting)).toBe(false);
  });

  it("is stable within the same day", () => {
    clearVoiceUsageForTests();
    const base = {
      homeState: "QUIET_PRESENCE" as const,
      timeOfDay: "morning" as const,
      sessionVisitIndex: 22,
      returnIntervalHours: 16,
      returnIntervalDays: 0.6,
      isFirstMeeting: false,
      now: new Date("2026-06-25T09:00:00"),
    };
    const a = evaluateGreetingIntelligence(base);
    const b = evaluateGreetingIntelligence(base);
    expect(a.greeting).toBe(b.greeting);
  });
});
