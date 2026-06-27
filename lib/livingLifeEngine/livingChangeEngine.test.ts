import { describe, expect, it, beforeEach } from "vitest";
import {
  evaluateCompanionEnvironmentIntelligence,
  resolveDailyDiscovery,
} from "@/lib/companionEnvironmentIntelligence";
import {
  clearLivingChangeHistoryForTests,
  resolveLivingChangeSet,
  filterBySceneIntegrity,
  resolveLivingTimeline,
  recordLivingRoomDeparture,
} from "@/lib/livingLifeEngine";
import type { LivingChangeEngineInput } from "@/lib/livingLifeEngine/types";

function baseEngineInput(
  overrides: Partial<LivingChangeEngineInput> = {},
): LivingChangeEngineInput {
  return {
    now: new Date("2026-06-25T09:00:00"),
    timeOfDay: "morning",
    season: "summer",
    weather: "clear",
    sessionVisitIndex: 12,
    isFirstMeeting: false,
    objects: [],
    motion: { enabled: ["candle", "foliage"] },
    ...overrides,
  };
}

describe("Living Change Engine", () => {
  beforeEach(() => {
    clearLivingChangeHistoryForTests();
  });

  it("caps changes per Living Change Set limits", () => {
    const changeSet = resolveLivingChangeSet(
      baseEngineInput({ timeOfDay: "evening", weather: "rain" }),
    );
    const environmental = changeSet.changes.filter(
      (change) => change.bucket === "environmental",
    );
    const hospitality = changeSet.changes.filter(
      (change) => change.bucket === "hospitality_preparation",
    );
    expect(environmental.length).toBeLessThanOrEqual(2);
    expect(hospitality.length).toBeLessThanOrEqual(1);
    expect(
      changeSet.changes.filter((change) => change.bucket === "relationship")
        .length,
    ).toBeLessThanOrEqual(1);
    expect(
      changeSet.changes.filter((change) => change.bucket === "hero_motion")
        .length,
    ).toBeLessThanOrEqual(1);
  });

  it("vetoes butterflies in winter per scene integrity", () => {
    const candidates = [
      {
        id: "wildlife-butterfly",
        bucket: "environmental" as const,
        priority: "season" as const,
        sourceModule: "test",
        cause: "butterfly",
        wildlife: "butterfly" as const,
        motion: { enable: ["butterflies" as const] },
      },
    ];
    const filtered = filterBySceneIntegrity(
      candidates,
      baseEngineInput({ season: "winter", weather: "snow" }),
    );
    expect(filtered).toHaveLength(0);
  });

  it("detects room return when guest was away briefly", () => {
    recordLivingRoomDeparture({
      toSection: "plan-my-day",
      snapshot: {
        kinsey: "window-gazing",
        wildlife: "robin",
        heroMotion: "sunlight",
        objectKinds: ["coffee"],
      },
      now: new Date("2026-06-25T08:50:00"),
    });
    const timeline = resolveLivingTimeline({
      now: new Date("2026-06-25T09:00:00"),
      hoursSinceLastVisit: 0.2,
    });
    expect(timeline.visitKind).toBe("room_return");
    expect(timeline.notes.length).toBeGreaterThan(0);
  });

  it("applies restraint on quiet refresh within twenty minutes", () => {
    const changeSet = resolveLivingChangeSet(
      baseEngineInput({
        livingLifeContext: {
          visitKind: "quiet_refresh",
          hoursSinceLastVisit: 0.1,
        },
      }),
    );
    expect(changeSet.restraintApplied).toBe(true);
    expect(changeSet.changes).toHaveLength(0);
  });

  it("integrates with environment intelligence before render", () => {
    const intel = evaluateCompanionEnvironmentIntelligence({
      now: new Date("2026-06-25T09:00:00"),
      timeOfDay: "morning",
      season: "summer",
      weather: "clear",
      sessionVisitIndex: 12,
      isFirstMeeting: false,
      useLivingChangeEngine: true,
    });
    expect(intel.livingChangeSet).toBeTruthy();
    expect(intel.livingChangeSet?.changes.length).toBeGreaterThanOrEqual(0);
    expect(intel.objects.length).toBeLessThanOrEqual(5);
  });

  it("deprecates modulo daily discovery rotation", () => {
    const discovery = resolveDailyDiscovery(new Date("2026-01-11T10:00:00"));
    expect(discovery).toBeNull();
  });

  it("still surfaces calendar observances through caused hospitality", () => {
    const intel = evaluateCompanionEnvironmentIntelligence({
      now: new Date("2026-12-04T10:00:00"),
      timeOfDay: "morning",
      season: "holiday",
      sessionVisitIndex: 12,
      isFirstMeeting: false,
    });
    expect(intel.objects.some((object) => object.kind === "cookies")).toBe(
      true,
    );
  });

  it("produces conversation hints without announcing mechanics", () => {
    const changeSet = resolveLivingChangeSet(
      baseEngineInput({
        now: new Date("2026-07-15T10:00:00"),
        season: "summer",
        timeOfDay: "morning",
        weather: "clear",
      }),
    );
    for (const hint of changeSet.conversationHints) {
      expect(hint.toLowerCase()).not.toMatch(/added|because you|random/);
    }
  });
});
