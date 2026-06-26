import { describe, expect, it } from "vitest";
import {
  SHARI_VOICE_BIBLE_ENTRIES,
  SHARI_VOICE_BIBLE_ENTRY_COUNT,
  clearVoiceUsageForTests,
  composeLivingRoomOpening,
  relationshipStageFromVisits,
  violatesShariVoice,
  selectVoiceLine,
} from "./index";
import { resolveVoiceContext } from "./resolveVoiceContext";
import type { ShariVoiceCategory } from "./types";

const REQUIRED_CATEGORIES: ShariVoiceCategory[] = [
  "morning",
  "afternoon",
  "evening",
  "late_night",
  "first_visit",
  "return_long_absence",
  "variable_question",
  "echo",
  "overwhelmed",
  "birthday",
  "weekend",
  "rainy_day",
  "from_planning_table",
  "from_clear_my_mind",
  "from_creative_studio",
];

describe("Shari Voice Bible™", () => {
  it("contains hundreds of approved lines", () => {
    expect(SHARI_VOICE_BIBLE_ENTRY_COUNT).toBeGreaterThanOrEqual(300);
    expect(SHARI_VOICE_BIBLE_ENTRIES.length).toBe(SHARI_VOICE_BIBLE_ENTRY_COUNT);
  });

  it("rejects narration and software voice in the library", () => {
    for (const entry of SHARI_VOICE_BIBLE_ENTRIES) {
      expect(violatesShariVoice(entry.text)).toBe(false);
    }
  });

  it("covers core context categories", () => {
    const categories = new Set(SHARI_VOICE_BIBLE_ENTRIES.map((e) => e.category));
    for (const required of REQUIRED_CATEGORIES) {
      expect(categories.has(required)).toBe(true);
    }
  });

  it("composes morning opening from context", () => {
    clearVoiceUsageForTests();
    const opening = composeLivingRoomOpening({
      homeState: "QUIET_PRESENCE",
      timeOfDay: "morning",
      sessionVisitIndex: 50,
      returnIntervalHours: 16,
      returnIntervalDays: 0.5,
      isFirstMeeting: false,
      season: "summer",
    });
    expect(opening.greeting.length).toBeGreaterThan(0);
    expect(violatesShariVoice(opening.greeting)).toBe(false);
    if (opening.question) {
      expect(violatesShariVoice(opening.question)).toBe(false);
    }
  });

  it("quiets voice as relationship deepens", () => {
    expect(relationshipStageFromVisits(1)).toBe("day_one");
    expect(relationshipStageFromVisits(50)).toBe("month");
    expect(relationshipStageFromVisits(500)).toBe("deep");
    expect(relationshipStageFromVisits(2000)).toBe("kin");
  });

  it("allows silence — question is optional", () => {
    clearVoiceUsageForTests();
    const ctx = resolveVoiceContext({
      homeState: "QUIET_PRESENCE",
      timeOfDay: "morning",
      sessionVisitIndex: 2000,
      returnIntervalHours: 12,
      returnIntervalDays: 0.4,
      isFirstMeeting: false,
    });
    const kinGreeting = selectVoiceLine("greeting", ctx, {
      category: "morning",
      salt: "kin-test",
    });
    expect(kinGreeting?.text.length).toBeLessThanOrEqual(24);
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
    const a = composeLivingRoomOpening(base);
    const b = composeLivingRoomOpening(base);
    expect(a.greeting).toBe(b.greeting);
  });

  it("uses presence wonder for prior thread — not topic citation", () => {
    clearVoiceUsageForTests();
    const opening = composeLivingRoomOpening({
      homeState: "QUIET_PRESENCE",
      timeOfDay: "afternoon",
      sessionVisitIndex: 40,
      returnIntervalHours: 20,
      returnIntervalDays: 1,
      isFirstMeeting: false,
      previousTopic: "the launch plan",
    });
    expect(opening.question).toBeTruthy();
    expect(opening.question).not.toMatch(/launch plan/i);
    expect(opening.question).not.toMatch(/last time/i);
    expect(violatesShariVoice(opening.question ?? "")).toBe(false);
  });
});
