import { describe, expect, it } from "vitest";
import {
  DESTINATION_CRYSTAL_REGISTRY,
  getDestinationCrystalRegistryEntry,
  listVisibleDestinationCrystals,
  resolveCrystalFunctionalStatus,
} from "./destinationRegistry";
import { DESTINATION_GALLERY_CRYSTALS } from "./constants";

describe("destination crystal registry (Prompt 142)", () => {
  it("registers every gallery crystal with launch and fallback behavior", () => {
    const ids = DESTINATION_CRYSTAL_REGISTRY.map((e) => e.internalId).sort();
    expect(ids).toEqual(
      DESTINATION_GALLERY_CRYSTALS.map((c) => c.id).sort(),
    );
    for (const entry of DESTINATION_CRYSTAL_REGISTRY) {
      expect(entry.crystalName).toBeTruthy();
      expect(entry.userFacingLabel).toBeTruthy();
      expect(entry.launchBehavior).toBeTruthy();
      expect(entry.fallbackBehavior).toBeTruthy();
      expect([
        "connected",
        "available_to_connect",
        "coming_soon",
        "disabled",
      ]).toContain(entry.status);
    }
  });

  it("keeps only intentional crystals visible", () => {
    expect(listVisibleDestinationCrystals()).toHaveLength(6);
    expect(getDestinationCrystalRegistryEntry("create").requiredConnection).toBe(
      "canva",
    );
  });

  it("maps connection actions to functional status", () => {
    expect(
      resolveCrystalFunctionalStatus({
        crystalId: "create",
        connectionAction: "ready",
      }),
    ).toBe("connected");
    expect(
      resolveCrystalFunctionalStatus({
        crystalId: "create",
        connectionAction: "needs_connection",
      }),
    ).toBe("available_to_connect");
    expect(
      resolveCrystalFunctionalStatus({
        crystalId: "print",
        connectionAction: "local_only",
      }),
    ).toBe("connected");
  });
});
