import { describe, expect, it, beforeEach } from "vitest";
import { clearLivingChangeHistoryForTests } from "@/lib/livingLifeEngine/livingChangeHistory";
import {
  MEMORY_TRIGGER_CATALOG,
  evaluateMemoryTriggers,
  isValidMemoryTriggerStoryLine,
  violatesMemoryTriggerAnnouncement,
  resolveMemoryTriggerChanges,
  listMemoryTriggersBySense,
} from "./index";

describe("Memory Triggers", () => {
  beforeEach(() => {
    clearLivingChangeHistoryForTests();
  });

  it("catalog has entries for all five senses", () => {
    const senses = new Set(MEMORY_TRIGGER_CATALOG.map((e) => e.sense));
    expect(senses.has("sight")).toBe(true);
    expect(senses.has("sound")).toBe(true);
    expect(senses.has("smell")).toBe(true);
    expect(senses.has("touch")).toBe(true);
    expect(senses.has("taste")).toBe(true);
    expect(MEMORY_TRIGGER_CATALOG.length).toBeGreaterThanOrEqual(50);
  });

  it("every story line passes announcement and authenticity rules", () => {
    for (const entry of MEMORY_TRIGGER_CATALOG) {
      expect(
        isValidMemoryTriggerStoryLine(entry.storyLine),
        `invalid story for ${entry.id}: ${entry.storyLine}`,
      ).toBe(true);
      expect(violatesMemoryTriggerAnnouncement(entry.storyLine)).toBe(false);
    }
  });

  it("rejects announcement-style copy", () => {
    expect(isValidMemoryTriggerStoryLine("The room smells like coffee.")).toBe(false);
    expect(isValidMemoryTriggerStoryLine("It smells like cinnamon.")).toBe(false);
    expect(isValidMemoryTriggerStoryLine("I just poured another cup of coffee.")).toBe(true);
  });

  it("returns at most one cue and often none", () => {
    const none = evaluateMemoryTriggers({
      season: "spring",
      timeOfDay: "morning",
      sessionVisitIndex: 1,
    });
    expect(none.cueCount).toBe(0);
    expect(none.trigger).toBeNull();

    const one = evaluateMemoryTriggers({
      season: "autumn",
      timeOfDay: "evening",
      sessionVisitIndex: 4,
      establishedRelationship: true,
    });
    if (one.trigger) {
      expect(one.cueCount).toBe(1);
      expect(one.storyLine).toBe(one.trigger.storyLine);
    }
  });

  it("suppresses during emotional safety states", () => {
    const flooded = evaluateMemoryTriggers({
      season: "winter",
      timeOfDay: "evening",
      sessionVisitIndex: 8,
      flooded: true,
    });
    expect(flooded.suppressedReason).toBe("flooded");

    const first = evaluateMemoryTriggers({
      season: "summer",
      timeOfDay: "afternoon",
      sessionVisitIndex: 4,
      isFirstMeeting: true,
    });
    expect(first.suppressedReason).toBe("first-meeting");
  });

  it("includes signature cinnamon rolls story", () => {
    const cinnamon = MEMORY_TRIGGER_CATALOG.find(
      (e) => e.id === "mt-kitchen-cinnamon-rolls-saturday",
    );
    expect(cinnamon?.storyLine).toContain("cinnamon rolls");
    expect(cinnamon?.storyLine).not.toMatch(/the room smells/i);
  });

  it("resolveMemoryTriggerChanges integrates with living engine shape", () => {
    const changes = resolveMemoryTriggerChanges({
      season: "autumn",
      timeOfDay: "evening",
      sessionVisitIndex: 4,
      weather: "cloudy",
      isFirstMeeting: false,
      recoveryGentle: false,
      lowEnergy: false,
    });
    expect(changes.length).toBeLessThanOrEqual(1);
    if (changes[0]) {
      expect(changes[0].sourceModule).toBe("memoryTriggers");
      expect(changes[0].conversationHint).toBeTruthy();
      expect(isValidMemoryTriggerStoryLine(changes[0].conversationHint!)).toBe(true);
    }
  });

  it("lists smell triggers for seasonal library coverage", () => {
    const smells = listMemoryTriggersBySense("smell");
    expect(smells.length).toBeGreaterThan(10);
  });
});
