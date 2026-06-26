import { describe, expect, it } from "vitest";
import { resolveSceneIntegrity } from "./sceneIntegrityEngine";
import {
  prepareHomeFromBrief,
  snowyBirthdayAfternoonBrief,
  productionSurpriseBrief,
} from "./directorExperience";

describe("directorExperience", () => {
  it("prepares snowy birthday afternoon in one brief", () => {
    const state = prepareHomeFromBrief(snowyBirthdayAfternoonBrief());
    const resolved = resolveSceneIntegrity(state);
    expect(resolved.season).toBe("winter");
    expect(resolved.weather).toBe("snow");
    expect(resolved.lifeEvent).toBe("birthday");
    expect(resolved.hospitality).toContain("cake");
  });

  it("applies Iowa Reality when snow conflicts with season", () => {
    const state = prepareHomeFromBrief({
      placeId: "living-room",
      season: "summer",
      weather: "snow",
      time: "afternoon",
      lifeEvent: "none",
      atmosphereTone: "cozy",
      iowaReality: true,
      fantasyMode: false,
    });
    const resolved = resolveSceneIntegrity(state);
    expect(resolved.season).not.toBe("summer");
  });

  it("production surprise returns a complete scene", () => {
    const state = prepareHomeFromBrief(productionSurpriseBrief());
    expect(state.greeting.length).toBeGreaterThan(0);
    expect(state.motion.length).toBeGreaterThan(0);
  });
});
