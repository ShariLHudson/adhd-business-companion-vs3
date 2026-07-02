import { describe, expect, it } from "vitest";
import { evaluateCompanionEnvironmentIntelligence } from "@/lib/companionEnvironmentIntelligence/evaluateCompanionEnvironmentIntelligence";
import { isMasterLivingRoomLocked } from "@/lib/livingRoomMaster";

describe("welcome homestead lighting", () => {
  it("keeps master scene locked while still resolving evening atmosphere", () => {
    expect(isMasterLivingRoomLocked()).toBe(true);

    const evening = evaluateCompanionEnvironmentIntelligence({
      now: new Date("2026-06-26T21:30:00"),
      timeOfDay: "evening",
      season: "summer",
      weather: "clear",
      sessionVisitIndex: 4,
      isFirstMeeting: false,
      useLivingChangeEngine: false,
    });

    expect(evening.atmosphere.timeOfDay).toBe("evening");
    expect(evening.homesteadTime?.period).toBe("evening");
    expect(evening.photograph.id).toBe("welcome-home-background");
  });

  it("resolves morning atmosphere for soft daylight copy", () => {
    const morning = evaluateCompanionEnvironmentIntelligence({
      now: new Date("2026-06-26T08:15:00"),
      timeOfDay: "morning",
      season: "summer",
      weather: "clear",
      sessionVisitIndex: 2,
      isFirstMeeting: false,
      useLivingChangeEngine: false,
    });

    expect(morning.atmosphere.timeOfDay).toBe("morning");
    expect(morning.homesteadTime?.period).toBe("morning");
  });
});
