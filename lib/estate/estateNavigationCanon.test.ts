import { describe, expect, it } from "vitest";
import { resolveEstateLocationShell } from "./directory/shell";
import { resolvePlaceId } from "./placeIdAliases";
import {
  ESTATE_NAVIGATION_CANON,
  ESTATE_NAVIGATION_NON_EQUIVALENT,
  getNavigationCanon,
} from "./estateNavigationCanon";
import { recognitionRoomsEquivalent } from "@/lib/sparkRecognitionEngine/recognitionIds";

describe("estate navigation canon", () => {
  it("maps each canon room to one shell section", () => {
    for (const entry of ESTATE_NAVIGATION_CANON) {
      expect(resolveEstateLocationShell(entry.placeId).section).toBe(
        entry.section,
      );
    }
  });

  it("resolves legacy ids to canonical place ids", () => {
    expect(resolvePlaceId("evidence-bank")).toBe("evidence-vault");
    expect(resolvePlaceId("celebration-garden")).toBe("gardens");
    expect(resolvePlaceId("celebration-hall")).toBe("celebration-room");
    expect(resolvePlaceId("hall-of-accomplishments")).toBe("portfolio");
    expect(resolvePlaceId("growth-portfolio")).toBe("portfolio");
    expect(resolvePlaceId("gallery")).toBe("gallery-of-firsts");
    expect(resolvePlaceId("pond")).toBe("seat-at-pond");
  });

  it("keeps Gallery distinct from Hall of Accomplishments (portfolio shell)", () => {
    expect(resolveEstateLocationShell("gallery-of-firsts").section).toBe(
      "home",
    );
    expect(resolveEstateLocationShell("portfolio").section).toBe(
      "growth-portfolio",
    );
    expect(getNavigationCanon("gallery-of-firsts")?.officialName).toMatch(
      /Gallery/,
    );
    expect(getNavigationCanon("portfolio")?.officialName).toMatch(
      /Hall of Accomplishments/,
    );
  });

  it("keeps Estate Gardens separate from Celebration Garden", () => {
    expect(resolveEstateLocationShell("estate-gardens").section).toBe("home");
    expect(resolveEstateLocationShell("gardens").section).toBe("wins-this-week");
    expect(recognitionRoomsEquivalent("estate-gardens", "gardens")).toBe(false);
  });

  it("documents non-equivalent pairs", () => {
    expect(ESTATE_NAVIGATION_NON_EQUIVALENT).toContainEqual([
      "gallery-of-firsts",
      "portfolio",
    ]);
    expect(ESTATE_NAVIGATION_NON_EQUIVALENT).toContainEqual([
      "gardens",
      "estate-gardens",
    ]);
  });
});
