import { describe, expect, it } from "vitest";
import { companionObjectById } from "@/lib/companionObjects";
import {
  companionObjectById as libraryObjectById,
  PRIMARY_FEATURE_OBJECT_IDS,
} from "@/lib/companionUniverse/libraries/objectLibrary";
import {
  SIGNATURE_COMPANION_OBJECTS,
  SIGNATURE_ROOM_ZONES,
  primarySignatureForRoom,
  resolveSignatureVisualSpec,
  signatureForFeatureObjectId,
  signatureObjectById,
  signatureRegistrySummary,
  signaturesForRoom,
  sizeForSignatureForm,
  workspaceHasSignatureObject,
} from "./index";

describe("Signature Companion Objects™", () => {
  it("defines signature objects for every room zone", () => {
    for (const room of SIGNATURE_ROOM_ZONES) {
      expect(signaturesForRoom(room).length).toBeGreaterThan(0);
      expect(primarySignatureForRoom(room)).toBeDefined();
    }
  });

  it("has unique signature ids", () => {
    const ids = SIGNATURE_COMPANION_OBJECTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves three coordinated visual forms", () => {
    const journal = signatureObjectById("sig-reflection-journal")!;
    const nav = resolveSignatureVisualSpec(journal, "navigation");
    const feature = resolveSignatureVisualSpec(journal, "feature");
    const env = resolveSignatureVisualSpec(journal, "environmental");

    expect(nav.size).toBe("sm");
    expect(nav.variant).toBe("icon");
    expect(feature.size).toBe("card");
    expect(feature.variant).toBe("mini-scene");
    expect(env.size).toBe("hero");
    expect(env.catalogObjectId).toBe("obj-leather-journal");
    expect(nav.designerStory).toMatch(/by her chair/i);
  });

  it("maps size tokens to design brief ranges", () => {
    expect(sizeForSignatureForm("navigation")).toBe("sm");
    expect(sizeForSignatureForm("feature")).toBe("card");
    expect(sizeForSignatureForm("environmental")).toBe("hero");
  });

  it("links primary workspaces to signature objects", () => {
    expect(signatureForFeatureObjectId("clear-my-mind")?.name).toBe(
      "Reflection Journal™",
    );
    expect(signatureForFeatureObjectId("plan-my-day")?.name).toBe(
      "Daily Planner™",
    );
  });

  it("includes emotional purpose on every signature", () => {
    for (const sig of SIGNATURE_COMPANION_OBJECTS) {
      expect(sig.emotionalPurpose.length).toBeGreaterThan(0);
      expect(sig.catalogObjectId.startsWith("obj-")).toBe(true);
    }
  });

  it("covers primary feature objects via registry or signature link", () => {
    for (const id of PRIMARY_FEATURE_OBJECT_IDS) {
      const hasSignature =
        workspaceHasSignatureObject(id) ||
        Boolean(companionObjectById(id)) ||
        Boolean(libraryObjectById(id));
      expect(hasSignature, `missing signature for ${id}`).toBe(true);
    }
  });

  it("summarizes registry for art production", () => {
    const summary = signatureRegistrySummary();
    expect(summary.total).toBeGreaterThanOrEqual(70);
    expect(summary.withFeatureLink).toBeGreaterThanOrEqual(3);
    expect(summary.formSizes.navigation.min).toBe(24);
    expect(summary.formSizes.feature.max).toBe(120);
  });
});
