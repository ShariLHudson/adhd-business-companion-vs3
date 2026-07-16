import { describe, expect, it } from "vitest";
import { matchAmbiguousLocationTerm } from "./ambiguousLocations";
import { validateEstateNavigationTarget } from "./routeValidation";
import {
  resolveEstateNavigationIntent,
  shouldNavigateFromDecision,
} from "./resolveEstateNavigationIntent";
import { tryKnowledgeBasePlaceResolution } from "./bridge";

describe("Estate Navigation Intelligence", () => {
  it("navigates directly for alias match — treehouse → Possibility House", () => {
    const decision = resolveEstateNavigationIntent("Take me to the treehouse");
    expect(decision.kind).toBe("navigate_direct");
    expect(decision.intentKind).toBe("alias_match");
    expect(decision.locationId).toBe("house-possibility-outside");
    expect(shouldNavigateFromDecision(decision)).toBe(true);
  });

  it("navigates directly for pool alias", () => {
    const decision = resolveEstateNavigationIntent("Take me to the pool");
    expect(decision.kind).toBe("navigate_direct");
    expect(decision.locationId).toBe("summer-terrace");
  });

  it("offers garden options without choosing randomly", () => {
    const decision = resolveEstateNavigationIntent("Take me to the garden");
    expect(decision.kind).toBe("offer_choices");
    expect(decision.choices?.length).toBeGreaterThanOrEqual(2);
    expect(decision.memberFacingPrompt).toMatch(/\b1\./);
    expect(decision.memberFacingPrompt).toMatch(/garden|Greenhouse|Conservatory/i);
    // Ambiguous term still resolves when trigger matches after verb strip.
    const ambiguous = matchAmbiguousLocationTerm("the garden");
    if (ambiguous) {
      expect(ambiguous.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("offers peaceful experience options", () => {
    const decision = resolveEstateNavigationIntent("I want somewhere peaceful");
    expect(decision.kind).toBe("offer_choices");
    expect(decision.intentKind).toBe("experience_request");
    expect(decision.choices?.length).toBe(3);
  });

  it("offers think-and-reflect places for thinking requests", () => {
    const decision = resolveEstateNavigationIntent("Find me a place to think");
    expect(decision.kind).toBe("offer_choices");
    expect(decision.intentKind).toBe("experience_request");
    expect(decision.choices?.map((c) => c.locationId)).toEqual(
      expect.arrayContaining([
        "personal-library",
        "reflection-pond",
        "conservatory",
      ]),
    );
  });

  it("offers music room for music requests when Live", () => {
    const validation = validateEstateNavigationTarget("music-room");
    expect(validation.ok).toBe(true);

    const decision = resolveEstateNavigationIntent("Where can I listen to music?");
    expect(decision.kind).toBe("navigate_direct");
    expect(decision.locationId).toBe("music-room");
  });

  it("navigates to Live Observatory when asked", () => {
    const validation = validateEstateNavigationTarget("observatory");
    expect(validation.ok).toBe(true);

    const decision = resolveEstateNavigationIntent("Take me to the Observatory");
    expect(decision.kind).toBe("navigate_direct");
    expect(decision.locationId).toBe("observatory");
    expect(shouldNavigateFromDecision(decision)).toBe(true);
  });

  it("bridges to EstatePlaceResolution for direct navigation", () => {
    const resolution = tryKnowledgeBasePlaceResolution("Take me to the treehouse");
    expect(resolution?.kind).toBe("exact-place");
    expect(resolution?.placeId).toBeTruthy();
    expect(resolution?.confidence).toBe("high");
  });

  it("bridges ambiguous garden to place suggestions", () => {
    const resolution = tryKnowledgeBasePlaceResolution("Take me to the garden");
    expect(resolution?.kind).toBe("suggestion");
    expect(resolution?.suggestedPlaceIds?.length).toBeGreaterThanOrEqual(2);
  });

  it("returns unresolved for non-navigation chat", () => {
    const decision = resolveEstateNavigationIntent(
      "How do I write a better email subject line?",
    );
    expect(decision.kind).toBe("unresolved");
  });

  it("does not treat content retrieve as navigation", () => {
    const decision = resolveEstateNavigationIntent(
      "Find me a snippet about my ADHD Business Ecosystem",
    );
    expect(decision.kind).toBe("unresolved");
  });
});
