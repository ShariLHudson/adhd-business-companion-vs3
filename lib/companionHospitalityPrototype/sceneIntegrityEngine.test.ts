import { describe, expect, it } from "vitest";
import { DEFAULT_DIRECTOR_STATE, resolveSceneIntegrity } from "./index";
import { COMPANION_PRESENCE_WELCOME_IMAGE_ID } from "@/lib/companionPresenceLibrary";

describe("resolveSceneIntegrity", () => {
  it("removes butterflies during winter snow", () => {
    const scene = resolveSceneIntegrity({
      ...DEFAULT_DIRECTOR_STATE,
      presetId: null,
      season: "winter",
      weather: "snow",
      motion: ["butterflies", "foliage", "snow", "sunlight"],
    });

    expect(scene.motion).not.toContain("butterflies");
    expect(scene.motion).not.toContain("foliage");
    expect(scene.motion).not.toContain("sunlight");
    expect(scene.motion).toContain("snow");
    expect(scene.disabledMotion.some((d) => d.id === "butterflies")).toBe(true);
  });

  it("removes harsh sunlight during rain", () => {
    const scene = resolveSceneIntegrity({
      ...DEFAULT_DIRECTOR_STATE,
      weather: "rain",
      motion: ["sunlight", "rain"],
      lighting: "afternoon",
      timeOfDay: "afternoon",
    });

    expect(scene.motion).not.toContain("sunlight");
    expect(scene.motion).toContain("rain");
    expect(scene.motion).toContain("lamplight");
  });

  it("blocks fireflies in the morning", () => {
    const scene = resolveSceneIntegrity({
      ...DEFAULT_DIRECTOR_STATE,
      season: "summer",
      timeOfDay: "morning",
      lighting: "morning",
      motion: ["fireflies", "sunlight"],
    });

    expect(scene.motion).not.toContain("fireflies");
    expect(scene.disabledMotion.some((d) => d.id === "fireflies")).toBe(true);
  });

  it("deduplicates greeting and invite", () => {
    const scene = resolveSceneIntegrity({
      ...DEFAULT_DIRECTOR_STATE,
      greeting: "Good morning.",
      invite: "Good morning.",
    });

    expect(scene.greeting).toBe("Good morning.");
    expect(scene.invite).not.toBe(scene.greeting);
  });

  it("hides logo on welcome hero where mug already carries brand", () => {
    const scene = resolveSceneIntegrity({
      ...DEFAULT_DIRECTOR_STATE,
      companionImageId: COMPANION_PRESENCE_WELCOME_IMAGE_ID,
    });

    expect(scene.showLogo).toBe(false);
    expect(scene.composition.hideLogo).toBe(true);
  });

  it("limits recovery scenes to restrained objects", () => {
    const scene = resolveSceneIntegrity({
      ...DEFAULT_DIRECTOR_STATE,
      presetId: "recovery-day",
      hospitality: ["tea-set", "cake", "suitcase", "cookies", "flowers", "journal"],
      books: ["A", "B", "C", "D", "E"],
    });

    expect(scene.lifeEvent).toBe("recovery");
    expect(scene.hospitality).not.toContain("cake");
    expect(scene.hospitality).not.toContain("suitcase");
    expect(scene.books.length).toBeLessThanOrEqual(3);
    expect(scene.hospitality.length).toBeLessThanOrEqual(5);
  });

  it("corrects summer snow by shifting season to winter", () => {
    const scene = resolveSceneIntegrity({
      ...DEFAULT_DIRECTOR_STATE,
      season: "summer",
      weather: "snow",
    });

    expect(scene.season).toBe("winter");
    expect(scene.weather).toBe("snow");
    expect(scene.corrections.some((c) => c.field === "season")).toBe(true);
  });

  it("resolves autumn leaves only in autumn", () => {
    const scene = resolveSceneIntegrity({
      ...DEFAULT_DIRECTOR_STATE,
      season: "spring",
      motion: ["leaves", "foliage"],
    });

    expect(scene.motion).not.toContain("leaves");
  });
});
