import { describe, expect, it } from "vitest";
import { COMPANION_PRESENCE_WELCOME_IMAGE_ID } from "@/lib/companionPresenceLibrary/sceneCatalog";
import {
  evaluateCompanionEnvironmentIntelligence,
  resolveDailyDiscovery,
  selectWelcomePhotograph,
  applyObjectLimits,
  IMAGE_CONTEXT_REGISTRY,
} from "@/lib/companionEnvironmentIntelligence";

describe("CompanionEnvironmentIntelligence", () => {
  it("uses the canonical Living Room photograph on first page", () => {
    const intel = evaluateCompanionEnvironmentIntelligence({
      timeOfDay: "morning",
      season: "summer",
      sessionVisitIndex: 1,
      isFirstMeeting: true,
    });
    expect(intel.photograph.id).toBe(COMPANION_PRESENCE_WELCOME_IMAGE_ID);
    expect(intel.photograph.reason).toMatch(/welcome|waiting/i);
    expect(intel.objects.some((o) => o.kind === "book")).toBe(true);
    expect(intel.objects.length).toBeLessThanOrEqual(5);
    expect(intel.motion.enabled).toContain("candle");
    expect(intel.atmosphere.weather).toBeTruthy();
  });

  it("prepares spring rain hospitality", () => {
    const intel = evaluateCompanionEnvironmentIntelligence({
      timeOfDay: "afternoon",
      season: "spring",
      weather: "rain",
      sessionVisitIndex: 12,
      isFirstMeeting: false,
    });
    expect(intel.objects.some((o) => o.kind === "tulips")).toBe(true);
    expect(intel.motion.enabled).toContain("rain");
  });

  it("prepares autumn objects with restraint", () => {
    const intel = evaluateCompanionEnvironmentIntelligence({
      timeOfDay: "evening",
      season: "autumn",
      weather: "cloudy",
      sessionVisitIndex: 12,
      isFirstMeeting: false,
    });
    expect(intel.objects.some((o) => o.kind === "pumpkins")).toBe(true);
    expect(intel.objects.length).toBeLessThanOrEqual(5);
  });

  it("places cookies on National Cookie Day without popups", () => {
    const discovery = resolveDailyDiscovery(new Date("2026-12-04T10:00:00"));
    expect(discovery?.label).toMatch(/Cookie/i);
    const intel = evaluateCompanionEnvironmentIntelligence({
      now: new Date("2026-12-04T10:00:00"),
      timeOfDay: "morning",
      season: "holiday",
      sessionVisitIndex: 12,
      isFirstMeeting: false,
    });
    expect(intel.objects.some((o) => o.kind === "cookies")).toBe(true);
    expect(intel.dailyDiscovery?.kind).toBe("holiday");
  });

  it("supports prototype discovery overrides", () => {
    const intel = evaluateCompanionEnvironmentIntelligence({
      timeOfDay: "morning",
      season: "winter",
      weather: "snow",
      sessionVisitIndex: 12,
      isFirstMeeting: false,
      prototypeDiscovery: "project-complete",
    });
    expect(intel.objects.some((o) => o.kind === "wrapped-journal")).toBe(true);
    expect(intel.motion.enabled).toContain("snow");
  });

  it("prepares guest-aware coffee for coffee guests", () => {
    const intel = evaluateCompanionEnvironmentIntelligence({
      timeOfDay: "afternoon",
      season: "autumn",
      weather: "cloudy",
      sessionVisitIndex: 12,
      isFirstMeeting: false,
      hospitalityProfile: { favoriteDrink: "coffee" },
      visitEnergy: "steady",
    });
    expect(intel.guestPreparation?.drink).toBe("coffee");
    expect(intel.guestPreparation?.vesselLabel).toMatch(/Spark mug/i);
    expect(intel.objects.some((o) => o.kind === "coffee")).toBe(true);
  });

  it("prepares tea and blanket on recovery days", () => {
    const intel = evaluateCompanionEnvironmentIntelligence({
      timeOfDay: "afternoon",
      season: "spring",
      weather: "rain",
      sessionVisitIndex: 12,
      isFirstMeeting: false,
      hospitalityProfile: { favoriteDrink: "coffee" },
      recoveryGentle: true,
      visitEnergy: "recovery",
    });
    expect(intel.guestPreparation?.drink).toBe("tea");
    expect(intel.guestPreparation?.blanket).toBe(true);
    expect(intel.objects.some((o) => o.kind === "tea-set")).toBe(true);
    expect(intel.objects.some((o) => o.kind === "blanket")).toBe(true);
  });

  it("caps foreground objects at five", () => {
    const capped = applyObjectLimits([
      { kind: "book", placement: "shelf", label: "Tiny Wins" },
      { kind: "cookies", placement: "table" },
      { kind: "tea-set", placement: "table" },
      { kind: "flowers", placement: "table" },
      { kind: "cake", placement: "table" },
      { kind: "balloons", placement: "window" },
      { kind: "gift", placement: "table" },
    ]);
    expect(capped.length).toBeLessThanOrEqual(5);
    expect(capped.some((o) => o.kind === "book")).toBe(true);
  });

  it("keeps the master Living Room photograph until seasonal layers ship", () => {
    const photo = selectWelcomePhotograph({
      timeOfDay: "evening",
      season: "autumn",
      weather: "cloudy",
      sessionVisitIndex: 20,
      isFirstMeeting: false,
    });
    expect(photo.id).toBe(COMPANION_PRESENCE_WELCOME_IMAGE_ID);
    expect(photo.reason.length).toBeGreaterThan(0);
    expect(IMAGE_CONTEXT_REGISTRY.length).toBeGreaterThan(20);
  });

  it("is stable within the same day", () => {
    const input = {
      now: new Date("2026-06-25T09:00:00"),
      timeOfDay: "morning" as const,
      season: "summer" as const,
      sessionVisitIndex: 22,
      isFirstMeeting: false,
    };
    const a = evaluateCompanionEnvironmentIntelligence(input);
    const b = evaluateCompanionEnvironmentIntelligence(input);
    expect(a.photograph.id).toBe(b.photograph.id);
    expect(a.objects).toEqual(b.objects);
  });
});
