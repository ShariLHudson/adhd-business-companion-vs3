import { describe, expect, it } from "vitest";
import { resolveGuestPreparation, resolveVisitEnergy } from "./resolveGuestPreparation";

describe("resolveGuestPreparation", () => {
  it("prepares coffee in the Spark mug for coffee guests", () => {
    const prep = resolveGuestPreparation({
      profile: { favoriteDrink: "coffee" },
      visitEnergy: "steady",
    });

    expect(prep.drink).toBe("coffee");
    expect(prep.objectKind).toBe("coffee");
    expect(prep.vesselLabel).toBe("Spark mug");
    expect(prep.line).toMatch(/Coffee/);
    expect(prep.line).not.toMatch(/customiz/i);
  });

  it("prepares tea for tea guests", () => {
    const prep = resolveGuestPreparation({
      profile: { favoriteDrink: "tea" },
      visitEnergy: "steady",
    });

    expect(prep.drink).toBe("tea");
    expect(prep.objectKind).toBe("tea-set");
    expect(prep.line).toMatch(/tea/i);
  });

  it("recovery day prepares tea and blanket", () => {
    const prep = resolveGuestPreparation({
      profile: { favoriteDrink: "coffee" },
      visitEnergy: "recovery",
    });

    expect(prep.drink).toBe("tea");
    expect(prep.blanket).toBe(true);
    expect(prep.line).toMatch(/blanket/i);
  });

  it("high-energy morning prepares coffee and bright light", () => {
    const energy = resolveVisitEnergy({
      timeOfDay: "morning",
      weather: "clear",
    });
    const prep = resolveGuestPreparation({
      profile: { favoriteDrink: "coffee" },
      visitEnergy: energy,
    });

    expect(energy).toBe("high");
    expect(prep.brightMorning).toBe(true);
    expect(prep.drink).toBe("coffee");
  });
});
