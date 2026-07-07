import { describe, expect, it } from "vitest";
import { matchEstateAlias } from "@/lib/estateKnowledgeBase/estateAliases";
import { resolveLocationIntent } from "@/lib/estateKnowledgeBase/locationIntentResolution";
import { matchAmbiguousLocationTerm } from "./ambiguousLocations";
import { resolveEstateNavigationIntent } from "./resolveEstateNavigationIntent";
import { resolveEstateRoutingDecision } from "@/lib/estate/estateRoutingRegistry";
import { resolveCanonicalPlaceBackgroundCandidates } from "@/lib/estate/estatePlaceMedia";

describe("Conservatory routing precision", () => {
  it("F — ocean conservatory resolves to conservatory not greenhouse", () => {
    const q = "take me to the ocean conservatory";
    expect(matchEstateAlias(q)?.locationId).toBe("conservatory");
    const intent = resolveLocationIntent(q);
    expect(intent.kind).toBe("direct");
    expect(intent.directLocation?.locationId).toBe("conservatory");

    const nav = resolveEstateNavigationIntent(q);
    expect(nav.kind).toBe("navigate_direct");
    expect(nav.locationId).toBe("conservatory");

    const routing = resolveEstateRoutingDecision(q);
    expect(routing.kind).toBe("navigate");
    expect(routing.placeId).toBe("conservatory");
  });

  it("G — bare conservatory offers choices, never defaults to greenhouse", () => {
    const q = "take me to the conservatory";
    const ambiguous = matchAmbiguousLocationTerm(q);
    expect(ambiguous?.term.id).toBe("conservatory");

    const nav = resolveEstateNavigationIntent(q);
    expect(nav.kind).toBe("offer_choices");
    const ids = nav.choices?.map((c) => c.locationId) ?? [];
    expect(ids).toContain("conservatory");
    expect(ids).toContain("greenhouse");
    expect(nav.locationId).not.toBe("greenhouse");
  });

  it("ocean conservatory does not trigger bare conservatory ambiguity", () => {
    const q = "take me to the ocean conservatory";
    expect(matchAmbiguousLocationTerm(q)).toBeNull();
  });

  it("aquarium resolves to ocean conservatory", () => {
    for (const q of [
      "take me to the aquarium",
      "go to the aquarium",
      "aquarium",
    ]) {
      expect(matchEstateAlias(q)?.locationId).toBe("conservatory");
      const nav = resolveEstateNavigationIntent(q, { bypassIntentGate: true });
      expect(nav.kind).toBe("navigate_direct");
      expect(nav.locationId).toBe("conservatory");
      expect(nav.placeId).toBe("conservatory");
    }
  });

  it("conservatory background fallbacks never use greenhouse plate", () => {
    const candidates = resolveCanonicalPlaceBackgroundCandidates("conservatory");
    expect(candidates.some((url) => url.includes("greenhouse"))).toBe(false);
    expect(candidates[0]).toContain("the-ocean-conservatory-background");
  });
});
