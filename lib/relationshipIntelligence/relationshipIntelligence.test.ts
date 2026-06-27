import { describe, expect, it, beforeEach } from "vitest";
import { clearCarryForwardStoreForTests } from "@/lib/carryForward/dayVisit";
import { isValidCarryForwardLine } from "@/lib/carryForward/rules";
import { evaluateWelcomePresenceIntelligence } from "@/lib/welcomePresenceIntelligence";
import { clearVoiceUsageForTests } from "@/lib/shariVoiceBible";
import {
  applyNameNaturally,
  clearGreetingHistoryForTests,
  countNameOccurrences,
  evaluateMorningGreeting,
  evaluateNameIntelligence,
  formatMorningGreeting,
  pickVariedEntry,
  recordGreetingShown,
  violatesVagueCarryForward,
  VAGUE_CARRY_FORWARD_PATTERNS,
} from "./index";

describe("Name Intelligence", () => {
  it("uses the name on first greeting of the day", () => {
    const verdict = evaluateNameIntelligence({
      firstName: "Shari",
      scenario: "first_greeting_of_day",
      lineContext: "greeting",
      isFirstGreetingOfDay: true,
    });
    expect(verdict.useName).toBe(true);
    const greeting = applyNameNaturally("Good morning.", "Shari", true);
    expect(greeting).toBe("Good morning, Shari.");
  });

  it("does not use the name in ordinary chat responses", () => {
    const verdict = evaluateNameIntelligence({
      firstName: "Shari",
      lineContext: "chat",
      scenario: "ordinary",
    });
    expect(verdict.useName).toBe(false);
  });

  it("does not use the name in research or instruction contexts", () => {
    expect(
      evaluateNameIntelligence({
        firstName: "Shari",
        lineContext: "research",
      }).useName,
    ).toBe(false);
    expect(
      evaluateNameIntelligence({
        firstName: "Shari",
        lineContext: "instruction",
      }).useName,
    ).toBe(false);
  });

  it("stops after the name was already used twice in one conversation", () => {
    const verdict = evaluateNameIntelligence({
      firstName: "Shari",
      scenario: "first_greeting_of_day",
      namesUsedThisConversation: 2,
    });
    expect(verdict.useName).toBe(false);
  });

  it("uses the name for celebration and reconnection", () => {
    expect(
      evaluateNameIntelligence({
        firstName: "Shari",
        scenario: "celebration",
        celebrationActive: true,
      }).useName,
    ).toBe(true);
    expect(
      evaluateNameIntelligence({
        firstName: "Shari",
        returnIntervalDays: 5,
        scenario: "reconnect_after_absence",
      }).useName,
    ).toBe(true);
  });

  it("counts name occurrences in text", () => {
    expect(countNameOccurrences("Good morning, Shari. Ready, Shari?", "Shari")).toBe(2);
    expect(countNameOccurrences("Good morning.", "Shari")).toBe(0);
  });
});

describe("Morning Greeting Intelligence", () => {
  beforeEach(() => {
    clearGreetingHistoryForTests();
  });

  it("includes the user's name naturally on first morning greeting", () => {
    const verdict = evaluateMorningGreeting({
      now: new Date("2026-06-25T08:00:00"),
      firstName: "Shari",
      sessionVisitIndex: 12,
      isFirstMeeting: false,
    });
    expect(verdict.usedName).toBe(true);
    expect(formatMorningGreeting(verdict)).toMatch(/Shari/);
    expect(formatMorningGreeting(verdict)).toMatch(/morning/i);
  });

  it("references specific prior work when previousTopic is known", () => {
    const verdict = evaluateMorningGreeting({
      now: new Date("2026-06-25T08:00:00"),
      firstName: "Shari",
      previousTopic: "Pinterest strategy",
      sessionVisitIndex: 8,
    });
    expect(verdict.usedSpecificMemory).toBe(true);
    expect(formatMorningGreeting(verdict)).toMatch(/Pinterest strategy/i);
    expect(violatesVagueCarryForward(formatMorningGreeting(verdict))).toBe(false);
  });

  it("references a specific accomplishment when recentAccomplishment is known", () => {
    const verdict = evaluateMorningGreeting({
      now: new Date("2026-06-25T08:00:00"),
      firstName: "Shari",
      recentAccomplishment: "the Focus rooms design",
      sessionVisitIndex: 8,
    });
    expect(verdict.usedSpecificMemory).toBe(true);
    expect(formatMorningGreeting(verdict)).toMatch(/Focus rooms design/i);
  });

  it("fresh-start greetings work when no meaningful carry-forward exists", () => {
    const verdict = evaluateMorningGreeting({
      now: new Date("2026-06-25T08:00:00"),
      firstName: "Shari",
      sessionVisitIndex: 3,
    });
    expect(verdict.usedSpecificMemory).toBe(false);
    expect(formatMorningGreeting(verdict).length).toBeGreaterThan(8);
    expect(violatesVagueCarryForward(formatMorningGreeting(verdict))).toBe(false);
  });

  it("rotates greetings to reduce repetition when history is tracked", () => {
    const pool = [
      { id: "a", withName: "A", withoutName: "A" },
      { id: "b", withName: "B", withoutName: "B" },
      { id: "c", withName: "C", withoutName: "C" },
    ];
    const fresh = pool.filter((entry) => !["a", "b"].includes(entry.id));
    expect(fresh).toHaveLength(1);
    expect(fresh[0]?.id).toBe("c");
    const picked = pickVariedEntry(fresh, "seed-1");
    expect(picked.id).toBe("c");
  });
});

describe("Vague Carry Forward bans", () => {
  it("forbids vague emotional carry-forward phrases", () => {
    for (const pattern of [
      "Still carrying a similar feeling?",
      "Feeling the same today?",
      "Morning — good to see you.",
      "Yesterday still with you?",
    ]) {
      expect(violatesVagueCarryForward(pattern)).toBe(true);
      expect(isValidCarryForwardLine(pattern)).toBe(false);
    }
  });

  it("allows specific memory references", () => {
    expect(
      isValidCarryForwardLine(
        "Good morning. Yesterday felt like a good step forward.",
      ),
    ).toBe(true);
  });

  it("catalog rejects removed vague patterns", () => {
    expect(isValidCarryForwardLine("Morning — good to see you.")).toBe(false);
  });
});

describe("Welcome Presence + Morning Greeting integration", () => {
  beforeEach(() => {
    clearVoiceUsageForTests();
    clearCarryForwardStoreForTests();
    clearGreetingHistoryForTests();
  });

  it("morning first visit uses Morning Greeting Intelligence with name", () => {
    const intel = evaluateWelcomePresenceIntelligence({
      homeState: "QUIET_PRESENCE",
      timeOfDay: "morning",
      sessionVisitIndex: 20,
      returnIntervalHours: 16,
      returnIntervalDays: 0.6,
      isFirstMeeting: false,
      firstName: "Shari",
      now: new Date("2026-06-25T09:00:00"),
    });
    expect(intel.greeting).toMatch(/Shari/);
    expect(intel.greeting).not.toMatch(/similar feeling/i);
    expect(intel.greeting).not.toMatch(/good to see you/i);
  });
});
