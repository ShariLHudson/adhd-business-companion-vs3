import { describe, expect, it } from "vitest";

import {
  CANONICAL_ESTATE_REGISTRY,
  getCanonicalEstatePlaceById,
} from "./canonicalEstateRegistry";
import {
  detectCanonicalSuggestionProfile,
  suggestCanonicalPlaceIds,
  suggestCanonicalPlacesForProfile,
} from "./canonicalPlaceSuggestions";
import { formatEstatePlaceSuggestionMenu } from "./estatePlaceIdentityLock";
import { resolveEstateIntent } from "./estateIntentBridge";
import { resolveEstatePlace } from "./resolveEstatePlace";

function assertOnlyCanonicalIds(ids: readonly string[]) {
  expect(ids.length).toBeLessThanOrEqual(3);
  for (const id of ids) {
    expect(getCanonicalEstatePlaceById(id)).toBeDefined();
  }
}

function assertMenuUsesOnlyCanonicalPlaces(line: string) {
  expect(line).not.toMatch(/oak tree|hammock|meditation corner|near the pond/i);
  const numbered = [...line.matchAll(/^\s*\d+[.)]\s+(.+)$/gm)];
  expect(numbered.length).toBeGreaterThan(0);
  expect(numbered.length).toBeLessThanOrEqual(3);
  for (const [, label] of numbered) {
    const normalized = label!.split("—")[0]!.trim().toLowerCase();
    const known = CANONICAL_ESTATE_REGISTRY.some((place) => {
      const official = place.officialName.replace(/\u2122/g, "").trim().toLowerCase();
      return (
        normalized.includes(official) ||
        place.aliases.some((alias) =>
          normalized.includes(alias.toLowerCase()),
        )
      );
    });
    expect(known).toBe(true);
  }
}

describe("canonical place suggestions (registry only)", () => {
  it('"I need somewhere quiet" → quiet profile, singular place offer', () => {
    expect(detectCanonicalSuggestionProfile("I need somewhere quiet")).toBe(
      "quiet",
    );
    const ids = suggestCanonicalPlaceIds("I need somewhere quiet");
    assertOnlyCanonicalIds(ids);
    expect(ids.length).toBe(1);
    expect(ids[0]).toBe(
      suggestCanonicalPlacesForProfile("quiet").map((place) => place.id)[0],
    );
    const menu = formatEstatePlaceSuggestionMenu(ids);
    assertMenuUsesOnlyCanonicalPlaces(menu);
  });

  it('"suggest a peaceful place" → quiet canonical menu (singular)', () => {
    const quietIds = suggestCanonicalPlaceIds("I need somewhere quiet");
    const peacefulIds = suggestCanonicalPlaceIds("suggest a peaceful place");
    assertOnlyCanonicalIds(peacefulIds);
    expect(peacefulIds).toEqual(quietIds);
    expect(peacefulIds.length).toBe(1);
  });

  it('"I\'m stressed" → no unsolicited scenic profile', () => {
    const profile = detectCanonicalSuggestionProfile("I'm stressed");
    expect(profile).toBeNull();
    const ids = suggestCanonicalPlaceIds("I'm stressed");
    expect(ids).toEqual([]);

    const resolution = resolveEstatePlace("I'm stressed");
    expect(resolution.kind).toBe("none");
  });

  it("resolveEstateIntent never returns non-registry place ids", () => {
    const phrases = [
      "I need somewhere quiet",
      "suggest a peaceful place",
      "I'm stressed",
      "I feel overwhelmed",
      "I don't know where to go",
    ];
    for (const text of phrases) {
      const result = resolveEstateIntent({ text });
      assertOnlyCanonicalIds(result.suggestedPlaceIds);
      if (result.primaryPlaceId) {
        expect(getCanonicalEstatePlaceById(result.primaryPlaceId)).toBeDefined();
      }
    }
  });

  it("failsafe: unknown mood returns orient profile or empty — never invented", () => {
    const ids = suggestCanonicalPlaceIds("xyzzy florp");
    expect(ids.length).toBe(0);
    const menu = formatEstatePlaceSuggestionMenu([]);
    expect(menu).toMatch(/no suggestions available/i);
  });
});
