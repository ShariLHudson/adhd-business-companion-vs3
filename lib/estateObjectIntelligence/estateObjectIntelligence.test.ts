import { describe, expect, it } from "vitest";
import { matchObjectAlias } from "./objectAliases";
import { getEstateObjectById, isInteractiveObjectAvailable } from "./estateObjects";
import { getPlacementsForObject } from "./objectLocations";
import {
  isResolvedObjectIntent,
  resolveObjectIntent,
} from "./resolveObjectIntent";

describe("Estate Object Intelligence", () => {
  it("resolves telescope visual reference", () => {
    const alias = matchObjectAlias("What is that telescope?");
    expect(alias?.objectId).toBe("observatory-telescope");

    const resolution = resolveObjectIntent("What is that telescope?");
    expect(isResolvedObjectIntent(resolution)).toBe(true);
    expect(resolution.object?.officialName).toBe("Observatory Telescope");
    expect(resolution.memberFacingAnswer).toContain("Observatory Telescope");
  });

  it("resolves Kinsey from who is the dog", () => {
    const resolution = resolveObjectIntent("Who is the dog?");
    expect(resolution.object?.objectId).toBe("kinsey");
    expect(resolution.object?.objectType).toBe("character");
    expect(resolution.memberFacingAnswer).toContain("Kinsey");
  });

  it("resolves Kinsey from dog name in the picture", () => {
    const resolution = resolveObjectIntent("What is the dog's name in the picture?");
    expect(resolution.object?.objectId).toBe("kinsey");
    expect(resolution.memberFacingAnswer).toContain("That is Kinsey");
  });

  it("resolves discovery chest from that chest", () => {
    const resolution = resolveObjectIntent("What is that chest?");
    expect(resolution.object?.objectId).toBe("discovery-chest");
    expect(resolution.object?.officialName).toContain("Discovery Chest");
  });

  it("handles journal use request as interactive experience", () => {
    const journal = getEstateObjectById("estate-journal");
    expect(isInteractiveObjectAvailable(journal)).toBe(true);

    const resolution = resolveObjectIntent("Can I use that journal?");
    expect(resolution.kind).toBe("use_request");
    expect(resolution.suggestedAction).toBe("visit_journal");
    expect(resolution.memberFacingAnswer).toContain("journal");
  });

  it("prefers placement in current location context", () => {
    const resolution = resolveObjectIntent("What is that telescope?", {
      currentLocationId: "observatory",
    });
    expect(resolution.placement?.locationId).toBe("observatory");
    expect(resolution.placement?.placementLabel).toBe("Telescope Table");
  });

  it("lists multiple placements for telescope", () => {
    const placements = getPlacementsForObject("observatory-telescope");
    expect(placements.length).toBeGreaterThanOrEqual(2);
  });

  it("returns unresolved for unrelated chat", () => {
    const resolution = resolveObjectIntent(
      "Help me write a newsletter subject line",
    );
    expect(resolution.kind).toBe("unresolved");
  });

  it("does not invent objects outside registry", () => {
    const resolution = resolveObjectIntent("What is that spaceship?");
    expect(resolution.kind).toBe("unresolved");
  });
});
