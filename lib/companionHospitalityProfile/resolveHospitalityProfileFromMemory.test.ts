import { describe, expect, it } from "vitest";
import type { RecognitionStore } from "@/lib/recognition/recognitionStore";
import { resolveEffectiveHospitalityProfile } from "./resolveEffectiveHospitalityProfile";
import { resolveHospitalityProfileFromMemory } from "./resolveHospitalityProfileFromMemory";
import { resolveTodayContextFromRecognition } from "./resolveTodayContext";

const EMPTY_RECOGNITION: RecognitionStore = {
  celebrationMode: "full",
  birthday: null,
  personalDates: [],
  businessMilestones: {},
  dismissed: {},
  sentLog: [],
  firstConversationAt: null,
  conversationStarts: 0,
  lastConversationStartAt: null,
};

describe("resolveHospitalityProfileFromMemory", () => {
  it("maps safe hospitality memories to profile shape", () => {
    const result = resolveHospitalityProfileFromMemory(
      {
        favoriteDrink: "tea",
        favoriteFlower: "tulips",
        favoriteColor: "purple",
        lovesGardening: true,
        lovesBooks: true,
        prefersQuiet: true,
        chronotype: "morning",
      },
      EMPTY_RECOGNITION,
      { now: new Date("2026-06-25T10:00:00") },
    );

    expect(result.profile.favoriteDrink).toBe("tea");
    expect(result.profile.favoriteFlower).toBe("tulips");
    expect(result.profile.favoriteColor).toBe("purple");
    expect(result.profile.lovesGardening).toBe(true);
    expect(result.profile.lovesReading).toBe(true);
    expect(result.profile.prefersQuiet).toBe(true);
    expect(result.profile.chronotype).toBe("morning");
    expect(result.summary.recognized).toContain("Favorite drink: tea");
    expect(result.summary.recognized).toContain("Loves: gardening, books");
  });

  it("blocks pets without explicit permission", () => {
    const result = resolveHospitalityProfileFromMemory(
      { lovesDogs: true, lovesCats: true },
      EMPTY_RECOGNITION,
    );

    expect(result.profile.lovesDogs).toBeUndefined();
    expect(result.profile.lovesCats).toBeUndefined();
    expect(result.summary.blocked.length).toBeGreaterThan(0);
  });

  it("allows pets when permission is granted", () => {
    const result = resolveHospitalityProfileFromMemory(
      {
        lovesDogs: true,
        permissions: { petsFromPhotos: true },
      },
      EMPTY_RECOGNITION,
    );

    expect(result.profile.lovesDogs).toBe(true);
    expect(result.summary.blocked).toHaveLength(0);
  });

  it("normalizes drink aliases", () => {
    expect(
      resolveHospitalityProfileFromMemory(
        { favoriteDrink: "cocoa" },
        EMPTY_RECOGNITION,
      ).profile.favoriteDrink,
    ).toBe("hot-chocolate");
  });
});

describe("resolveTodayContextFromRecognition", () => {
  it("detects birthday and vacation countdown", () => {
    const now = new Date("2026-06-25T10:00:00");
    const recognition: RecognitionStore = {
      ...EMPTY_RECOGNITION,
      birthday: { month: 6, day: 25 },
      personalDates: [
        {
          id: "vac-1",
          label: "Italy",
          month: 7,
          day: 1,
          kind: "vacation",
          category: "travel",
          targetDate: "2026-06-28",
        },
      ],
    };

    const today = resolveTodayContextFromRecognition(recognition, now);
    expect(today.birthdayToday).toBe(true);
    expect(today.vacationDaysAway).toBe(3);
  });
});

describe("resolveEffectiveHospitalityProfile", () => {
  it("demo source returns example profile", () => {
    const resolved = resolveEffectiveHospitalityProfile({
      source: "demo",
      demoKey: "coffee-traveler",
    });
    expect(resolved.profile.favoriteDrink).toBe("coffee");
    expect(resolved.summary.source).toBe("demo");
  });

  it("manual source merges saved manual profile", () => {
    const resolved = resolveEffectiveHospitalityProfile({
      source: "manual",
      manualProfile: { favoriteDrink: "tea", favoriteFlower: "roses" },
    });
    expect(resolved.profile.favoriteDrink).toBe("tea");
    expect(resolved.profile.favoriteFlower).toBe("roses");
  });
});
