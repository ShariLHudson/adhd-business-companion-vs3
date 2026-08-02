import { describe, expect, it } from "vitest";
import { resolveEstateDestination } from "./estateDestinationResolver";
import { resolveEstatePlace } from "./resolveEstatePlace";
import { estateNavigateCommandForPlace } from "@/lib/estateIntelligence/estateCommandRouter";
import { getExploreEstateDestinations } from "@/lib/estateMap/exploreEstateDestinations";
import { resolveEstateLocationShell } from "./directory/shell";

/** True when a request resolves to the canonical personal-library place. */
function resolvesToPersonalLibrary(userText: string): boolean {
  const exact = resolveEstateDestination({ userText });
  if (exact.kind === "exact_match" && exact.destinationId === "personal-library") {
    return true;
  }
  const place = resolveEstatePlace(userText);
  return "placeId" in place && place.placeId === "personal-library";
}

describe("Personal Library chat navigation", () => {
  it("the personal-library place renders the PersonalLibraryRoom section", () => {
    // Canonical section resolution — this section renders PersonalLibraryRoom.
    expect(resolveEstateLocationShell("personal-library").section).toBe(
      "personal-library",
    );
    expect(estateNavigateCommandForPlace("personal-library")?.section).toBe(
      "personal-library",
    );
  });

  it("'take me to my personal library' opens PersonalLibraryRoom", () => {
    const r = resolveEstateDestination({
      userText: "take me to my personal library",
    });
    expect(r.kind).toBe("exact_match");
    if (r.kind === "exact_match") expect(r.destinationId).toBe("personal-library");
  });

  it("'go to my personal library' and 'open my library' open PersonalLibraryRoom", () => {
    expect(resolvesToPersonalLibrary("go to my personal library")).toBe(true);
    expect(resolvesToPersonalLibrary("open my library")).toBe(true);
  });

  it("'go to my Spark Collection' resolves to the Personal Library (real saved collection)", () => {
    expect(resolvesToPersonalLibrary("go to my Spark Collection")).toBe(true);
    expect(resolvesToPersonalLibrary("show me my saved Sparks")).toBe(true);
  });

  it("'find my saved note' and 'show my recent saved items' resolve to Personal Library", () => {
    expect(resolvesToPersonalLibrary("find my saved note")).toBe(true);
    expect(resolvesToPersonalLibrary("show my recent saved items")).toBe(true);
  });

  it("'spark cards' requests navigate to the Personal Library (not a content query)", () => {
    for (const phrase of [
      "go to spark cards",
      "go to spark card",
      "show me my spark cards",
      "search my spark cards",
      "my spark cards",
    ]) {
      expect(resolvesToPersonalLibrary(phrase), phrase).toBe(true);
    }
  });

  it("'spark cards' phrases resolve to Personal Library, NOT Seeds Planted", () => {
    // Regression: Seeds Planted used to claim "spark cards" / "my spark cards".
    for (const phrase of [
      "show me my spark cards",
      "my spark cards",
      "go to spark cards",
      "spark cards",
    ]) {
      const place = resolveEstatePlace(phrase);
      expect("placeId" in place && place.placeId, phrase).toBe(
        "personal-library",
      );
    }
    // Seeds Planted still reachable by its own name.
    const seeds = resolveEstatePlace("go to seeds planted");
    expect("placeId" in seeds && seeds.placeId).toBe("seeds-planted");
  });

  it("Wander 'My Personal Library' opens the same canonical room, no duplicate", () => {
    const dests = getExploreEstateDestinations();
    const pl = dests.find((d) => d.id === "personal-library");
    expect(pl?.name).toBe("My Personal Library");
    // Same canonical destination id chat navigation uses…
    expect(pl?.destinationId).toBe("personal-library");
    // …exactly one destination/route targets it (no duplicate room)…
    expect(
      dests.filter((d) => d.destinationId === "personal-library").length,
    ).toBe(1);
    // …resolving to the same section that renders PersonalLibraryRoom.
    expect(estateNavigateCommandForPlace(pl!.destinationId)?.section).toBe(
      "personal-library",
    );
  });
});
