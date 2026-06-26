import { describe, expect, it } from "vitest";
import { resolveGuestPreparation, resolveVisitEnergy } from "./resolveGuestPreparation";
import { violatesPresenceVoice } from "@/lib/presenceIntelligence";

describe("resolveGuestPreparation", () => {
  it("prepares coffee in the Spark mug for coffee guests — silently", () => {
    const prep = resolveGuestPreparation({
      profile: { favoriteDrink: "coffee", chronotype: "morning" },
      visitEnergy: "steady",
      timeOfDay: "morning",
    });

    expect(prep.drink).toBe("coffee");
    expect(prep.objectKind).toBe("coffee");
    expect(prep.vesselLabel).toBe("Spark mug");
    expect(prep.line).toBeNull();
  });

  it("prepares tea for tea guests without memory narration", () => {
    const prep = resolveGuestPreparation({
      profile: { favoriteDrink: "tea" },
      visitEnergy: "steady",
    });

    expect(prep.drink).toBe("tea");
    expect(prep.objectKind).toBe("tea-set");
    expect(prep.line).toBeNull();
    if (prep.line) {
      expect(violatesPresenceVoice(prep.line)).toBe(false);
    }
  });

  it("recovery day prepares tea and blanket — discovered, not announced", () => {
    const prep = resolveGuestPreparation({
      profile: { favoriteDrink: "coffee" },
      visitEnergy: "recovery",
      recoveryGentle: true,
    });

    expect(prep.drink).toBe("tea");
    expect(prep.blanket).toBe(true);
    expect(prep.line).toBeNull();
  });

  it("high-energy morning prepares coffee and bright light", () => {
    const energy = resolveVisitEnergy({
      timeOfDay: "morning",
      weather: "clear",
    });
    const prep = resolveGuestPreparation({
      profile: { favoriteDrink: "coffee", chronotype: "morning" },
      visitEnergy: energy,
      timeOfDay: "morning",
    });

    expect(energy).toBe("high");
    expect(prep.brightMorning).toBe(true);
    expect(prep.drink).toBe("coffee");
    expect(prep.line).toBeNull();
  });
});
