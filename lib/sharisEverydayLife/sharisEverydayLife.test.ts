import { describe, expect, it } from "vitest";
import { EVERYDAY_LIFE_CATALOG } from "./catalog";
import {
  violatesEverydayLifeNarration,
  filterSilentConversationHints,
  resolveEverydayLifeChanges,
} from "./index";
import type { LivingChangeEngineInput } from "@/lib/livingLifeEngine/types";

function baseInput(
  overrides: Partial<LivingChangeEngineInput> = {},
): LivingChangeEngineInput {
  return {
    now: new Date("2026-06-25T10:00:00"),
    timeOfDay: "morning",
    season: "summer",
    weather: "clear",
    sessionVisitIndex: 12,
    isFirstMeeting: false,
    ...overrides,
  };
}

describe("Shari's Everyday Life", () => {
  it("catalog has lived-in moments across zones", () => {
    expect(EVERYDAY_LIFE_CATALOG.length).toBeGreaterThanOrEqual(35);
    const zones = new Set(EVERYDAY_LIFE_CATALOG.map((m) => m.zone));
    expect(zones.has("living_room")).toBe(true);
    expect(zones.has("kitchen")).toBe(true);
    expect(zones.has("creative_studio")).toBe(true);
  });

  it("includes imperfect ADHD-authentic moments", () => {
    expect(EVERYDAY_LIFE_CATALOG.some((m) => m.imperfect)).toBe(true);
  });

  it("bans announced staging narration", () => {
    expect(violatesEverydayLifeNarration("I've been crocheting today.")).toBe(
      true,
    );
    expect(violatesEverydayLifeNarration("Coffee's ready if you want it.")).toBe(
      true,
    );
    expect(filterSilentConversationHints(["Coffee's ready if you want it."])).toEqual(
      [],
    );
  });

  it("skips first meeting and recovery days", () => {
    expect(resolveEverydayLifeChanges(baseInput({ isFirstMeeting: true }))).toEqual(
      [],
    );
    expect(
      resolveEverydayLifeChanges(baseInput({ recoveryGentle: true })),
    ).toEqual([]);
  });

  it("returns at most one silent environmental change", () => {
    const changes = resolveEverydayLifeChanges(baseInput({ sessionVisitIndex: 11 }));
    expect(changes.length).toBeLessThanOrEqual(1);
    for (const change of changes) {
      expect(change.sourceModule).toBe("sharisEverydayLife");
      expect(change.conversationHint).toBeUndefined();
      expect(change.priority).toBe("life_continuity");
    }
  });
});
