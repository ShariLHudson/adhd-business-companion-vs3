import { describe, expect, it } from "vitest";
import { placeById } from "./libraries/placeLibrary";
import { EXAMPLE_HOSPITALITY_PROFILES } from "./libraries/hospitalityProfileLibrary";
import { resolveHospitalityLayers } from "./resolveHospitalityLayers";
import { DEFAULT_DIRECTOR_STATE, resolveSceneIntegrity } from "@/lib/companionHospitalityPrototype";

describe("resolveHospitalityLayers", () => {
  const place = placeById("living-room");
  const scene = resolveSceneIntegrity(DEFAULT_DIRECTOR_STATE);

  it("layer 1 foundation stays identical across guests", () => {
    const tea = resolveHospitalityLayers({
      place,
      scene,
      profile: EXAMPLE_HOSPITALITY_PROFILES["tea-gardener"],
    });
    const coffee = resolveHospitalityLayers({
      place,
      scene,
      profile: EXAMPLE_HOSPITALITY_PROFILES["coffee-traveler"],
    });

    expect(tea.layer1.place.id).toBe(coffee.layer1.place.id);
    expect(tea.layer1.signatureObject).toBe(coffee.layer1.signatureObject);
    expect(tea.layer1.anchors).toEqual(coffee.layer1.anchors);
  });

  it("layer 5 weaves guest hospitality without changing foundation", () => {
    const tea = resolveHospitalityLayers({
      place,
      scene,
      profile: EXAMPLE_HOSPITALITY_PROFILES["tea-gardener"],
    });
    const coffee = resolveHospitalityLayers({
      place,
      scene,
      profile: EXAMPLE_HOSPITALITY_PROFILES["coffee-traveler"],
    });

    expect(tea.layer5.foundationUnchanged).toBe(true);
    expect(tea.layer5.woven.some((w) => w.includes("Tea"))).toBe(true);
    expect(coffee.layer5.woven.some((w) => w.includes("Coffee"))).toBe(true);
    expect(coffee.layer5.woven.some((w) => w.includes("dog"))).toBe(true);
  });

  it("layer 3 conversation reflects what Shari knows", () => {
    const gardener = resolveHospitalityLayers({
      place,
      scene,
      profile: EXAMPLE_HOSPITALITY_PROFILES["tea-gardener"],
    });

    expect(
      gardener.layer3.contextualLines.some((line) =>
        line.includes("coneflowers"),
      ),
    ).toBe(true);
  });

  it("layer 4 traditions belong to the home calendar", () => {
    const spring = resolveHospitalityLayers({
      place,
      scene,
      now: new Date("2026-04-10T10:00:00"),
    });

    expect(spring.layer4.active.some((t) => t.id === "spring-tulips")).toBe(true);
    expect(spring.layer4.active.every((t) => t.belongsTo === "home")).toBe(true);
  });
});
