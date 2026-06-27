import { describe, expect, it } from "vitest";
import {
  COMPANION_OBJECT_CATEGORIES,
  COMPANION_OBJECT_LIBRARY,
  PRIMARY_FEATURE_OBJECT_IDS,
  companionObjectById,
  companionObjectRegistrySummary,
  companionObjectsByCategory,
} from "./objectLibrary";

describe("Companion Object Library", () => {
  it("defines all twelve object categories", () => {
    expect(COMPANION_OBJECT_CATEGORIES).toHaveLength(12);
    for (const category of COMPANION_OBJECT_CATEGORIES) {
      expect(companionObjectsByCategory(category).length).toBeGreaterThan(0);
    }
  });

  it("has unique object ids", () => {
    const ids = COMPANION_OBJECT_LIBRARY.map((object) => object.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves every primary feature from the design brief", () => {
    for (const id of PRIMARY_FEATURE_OBJECT_IDS) {
      const object = companionObjectById(id);
      expect(object, `missing primary feature object: ${id}`).toBeDefined();
      expect(object!.signatureObject.length).toBeGreaterThan(0);
      expect(object!.artworkStatus).toBe("needs-artwork");
    }
  });

  it("requires future-ready asset fields on every entry", () => {
    for (const object of COMPANION_OBJECT_LIBRARY) {
      expect(object.transparentAsset).toBe(true);
      expect(object.future3D).toBe(true);
      expect(object.style).toContain("homestead");
      expect(object.lightingProfile.length).toBeGreaterThan(0);
    }
  });

  it("maps Clear My Mind to leather journal in Window Seat", () => {
    const object = companionObjectById("clear-my-mind");
    expect(object?.signatureObject).toBe("Leather journal");
    expect(object?.room).toBe("window-seat");
    expect(object?.currentEmoji).toBe("🧠");
  });

  it("maps Focus Studio to premium headphones", () => {
    const object = companionObjectById("focus-studio");
    expect(object?.signatureObject).toBe("Premium headphones");
    expect(object?.room).toBe("focus-studio");
  });

  it("summarizes registry for migration planning", () => {
    const summary = companionObjectRegistrySummary();
    expect(summary.total).toBe(COMPANION_OBJECT_LIBRARY.length);
    expect(summary.primaryFeatures).toBe(PRIMARY_FEATURE_OBJECT_IDS.length);
    expect(summary.needsArtwork).toBe(summary.total);
  });
});
