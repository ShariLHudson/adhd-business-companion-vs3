import { describe, expect, it } from "vitest";
import { COMPANION_LIBRARY_CATALOG } from "./libraryCatalog";
import { COMPANION_PLACE_LIBRARY, placeById } from "./libraries/placeLibrary";
import { orchestrateCompanionUniverse } from "./orchestrator/companionBrainOrchestrator";
import { DEFAULT_DIRECTOR_STATE } from "@/lib/companionHospitalityPrototype";
import { constitutionPassed } from "./constitution";

describe("Companion Universe", () => {
  it("catalog defines master libraries including companion object library", () => {
    expect(COMPANION_LIBRARY_CATALOG.length).toBeGreaterThanOrEqual(26);
    expect(COMPANION_LIBRARY_CATALOG.some((lib) => lib.id === "companion-object")).toBe(
      true,
    );
  });

  it("place library defines homestead places", () => {
    expect(COMPANION_PLACE_LIBRARY).toHaveLength(21);
    expect(placeById("living-room").emotionalPromise).toBe(
      "I've been expecting you.",
    );
  });

  it("orchestrator resolves director controls through scene integrity", () => {
    const result = orchestrateCompanionUniverse({
      placeId: "living-room",
      directorControls: {
        ...DEFAULT_DIRECTOR_STATE,
        season: "winter",
        weather: "snow",
        motion: ["butterflies", "snow", "foliage"],
      },
    });

    expect(result.resolvedScene).toBeDefined();
    expect(result.resolvedScene?.motion).not.toContain("butterflies");
    expect(result.resolvedScene?.motion).not.toContain("foliage");
    expect(result.constitutionPassed).toBe(true);
    expect(result.hospitalityPrinciple.passed).toBe(true);
    expect(result.librariesUsed).toContain("scene-integrity");
    expect(result.presence.level).toBe(5);
    expect(result.presence.showShariImage).toBe(true);
  });

  it("orchestrator resolves presence for window seat place", () => {
    const result = orchestrateCompanionUniverse({
      placeId: "window-seat",
      directorControls: DEFAULT_DIRECTOR_STATE,
    });
    expect(result.presence.level).toBe(2);
    expect(result.presence.showShariImage).toBe(false);
    expect(result.presence.evidenceObjects.length).toBeGreaterThan(0);
  });

  it("orchestrator production path composes living room", () => {
    const result = orchestrateCompanionUniverse({
      placeId: "living-room",
      useProductionPath: true,
      now: new Date("2026-03-15T09:00:00"),
    });

    expect(result.livingRoom).toBeDefined();
    expect(result.greeting).toBeTruthy();
    expect(constitutionPassed(result.constitution)).toBe(true);
  });
});
