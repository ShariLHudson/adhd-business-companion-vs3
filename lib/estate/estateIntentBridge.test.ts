import { describe, expect, it } from "vitest";

import {
  ESTATE_INTENT_AUTO_ROUTE_CONFIDENCE,
  mayAutoRouteFromEstateIntent,
  resolveEstateIntent,
} from "./estateIntentBridge";
import { suggestCanonicalPlacesForProfile } from "./canonicalPlaceSuggestions";

describe("Estate Intent Bridge (Phase H.1)", () => {
  it('"I need somewhere quiet" suggests restorative places without auto-route', () => {
    const result = resolveEstateIntent({ text: "I need somewhere quiet" });
    expect(result.primaryPlaceId).toBeNull();
    expect(result.confidence).toBeLessThan(ESTATE_INTENT_AUTO_ROUTE_CONFIDENCE);
    expect(result.suggestedPlaceIds.length).toBeGreaterThanOrEqual(1);
    expect(result.suggestedPlaceIds.length).toBeLessThanOrEqual(3);
    expect(result.suggestedPlaceIds).toContain("reading-nook");
    expect(result.reasoning.length).toBeGreaterThan(0);
    expect(mayAutoRouteFromEstateIntent(result)).toBe(false);
  });

  it('"I feel overwhelmed" maps to overwhelmed suggestions', () => {
    const result = resolveEstateIntent({ text: "I feel overwhelmed" });
    expect(result.primaryPlaceId).toBeNull();
    expect(result.suggestedPlaceIds.length).toBeGreaterThanOrEqual(1);
    expect(result.suggestedPlaceIds.length).toBeLessThanOrEqual(3);
    expect(result.suggestedPlaceIds).toContain("conservatory");
    expect(result.reasoning).toMatch(/overwhelm/i);
  });

  it('"I want to think" suggests thinking places gently', () => {
    const result = resolveEstateIntent({ text: "I want to think" });
    expect(result.primaryPlaceId).toBeNull();
    expect(result.suggestedPlaceIds).toEqual([
      "observatory",
      "library",
      "reading-nook",
    ]);
    expect(result.reasoning).toMatch(/conversation-drives-navigation:think/);
    expect(result.confidence).toBeLessThan(ESTATE_INTENT_AUTO_ROUTE_CONFIDENCE);
  });

  it('"take me to the plant place" resolves Greenhouse with route confidence', () => {
    const result = resolveEstateIntent({
      text: "take me to the plant place",
    });
    expect(result.primaryPlaceId).toBe("greenhouse");
    expect(result.confidence).toBeGreaterThanOrEqual(
      ESTATE_INTENT_AUTO_ROUTE_CONFIDENCE,
    );
    expect(mayAutoRouteFromEstateIntent(result)).toBe(true);
    expect(result.reasoning).toMatch(/greenhouse/i);
  });

  it('"I want to celebrate something" centers celebration profile order', () => {
    const result = resolveEstateIntent({
      text: "I want to celebrate something",
    });
    const celebrateIds = suggestCanonicalPlacesForProfile("celebrate").map(
      (place) => place.id,
    );
    expect(result.suggestedPlaceIds).toEqual(celebrateIds);
    expect(result.suggestedPlaceIds.length).toBeLessThanOrEqual(3);
    expect(result.reasoning).toMatch(/celebrat/i);
  });

  it("relationship conversation — good day wish — no place inference", () => {
    const result = resolveEstateIntent({
      text: "I hope you're having a good day.",
    });
    expect(result.primaryPlaceId).toBeNull();
    expect(result.suggestedPlaceIds).toEqual([]);
    expect(result.confidence).toBe(0);
    expect(result.reasoning).toMatch(/relationship conversation/i);
    expect(mayAutoRouteFromEstateIntent(result)).toBe(false);
  });

  it("marketing strategy question — no orient room suggestions", () => {
    const result = resolveEstateIntent({
      text: "i need to find a strategy for marketing apps on facebook",
    });
    expect(result.primaryPlaceId).toBeNull();
    expect(result.suggestedPlaceIds).toEqual([]);
    expect(result.confidence).toBe(0);
    expect(result.reasoning).toMatch(/substantive help/i);
  });

  it('"I don\'t know where to go" never fails silently', () => {
    const result = resolveEstateIntent({
      text: "I don't know where to go",
    });
    expect(result.primaryPlaceId).toBeNull();
    expect(result.suggestedPlaceIds.length).toBeGreaterThanOrEqual(1);
    expect(result.reasoning.length).toBeGreaterThan(0);
    expect(result.reasoning).toMatch(/uncertain|restorative/i);
  });

  it("exact registry alias routes with high confidence", () => {
    const result = resolveEstateIntent({ text: "reading nook" });
    expect(result.primaryPlaceId).toBe("reading-nook");
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("respects stay-here when no move intent and no match", () => {
    const result = resolveEstateIntent({
      text: "hmm",
      currentPlaceId: "sunroom",
    });
    expect(result.primaryPlaceId).toBeNull();
    expect(result.reasoning).toMatch(/stay at sunroom/i);
  });

  it("only suggests canonical registry places", () => {
    const phrases = [
      "I need somewhere quiet",
      "take me to the plant place",
      "I want to celebrate something",
    ];
    for (const text of phrases) {
      const { suggestedPlaceIds, primaryPlaceId } = resolveEstateIntent({
        text,
      });
      const ids = primaryPlaceId
        ? [primaryPlaceId, ...suggestedPlaceIds]
        : suggestedPlaceIds;
      for (const id of ids) {
        expect(id).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });
});
