import { describe, expect, it } from "vitest";
import {
  COMPANION_OBJECT_COLLECTIONS,
  COMPANION_OBJECTS_CATALOG_TARGET_MAX,
  COMPANION_OBJECTS_CATALOG_TARGET_MIN,
  COMPANION_OBJECTS_MASTER_CATALOG,
  ILLUSTRATION_STYLE_NAME,
  companionObjectCatalogById,
  companionObjectCatalogSummary,
  companionObjectsByCollection,
  findCompanionObjectByName,
} from "./index";

describe("Companion Objects Design System", () => {
  it("defines 200–300 catalog objects", () => {
    expect(COMPANION_OBJECTS_MASTER_CATALOG.length).toBeGreaterThanOrEqual(
      COMPANION_OBJECTS_CATALOG_TARGET_MIN,
    );
    expect(COMPANION_OBJECTS_MASTER_CATALOG.length).toBeLessThanOrEqual(
      COMPANION_OBJECTS_CATALOG_TARGET_MAX,
    );
  });

  it("has unique object ids", () => {
    const ids = COMPANION_OBJECTS_MASTER_CATALOG.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers all ten collections", () => {
    for (const collection of COMPANION_OBJECT_COLLECTIONS) {
      expect(companionObjectsByCollection(collection).length).toBeGreaterThan(0);
    }
  });

  it("requires full metadata on every entry", () => {
    for (const object of COMPANION_OBJECTS_MASTER_CATALOG) {
      expect(object.name.length).toBeGreaterThan(0);
      expect(object.emotionalPurpose.length).toBeGreaterThan(0);
      expect(object.primaryRoom.length).toBeGreaterThan(0);
      expect(object.material.length).toBeGreaterThan(0);
      expect(object.colorPalette.length).toBeGreaterThan(0);
      expect(object.illustrationNotes.length).toBeGreaterThan(0);
      expect(object.accessibilityDescription.length).toBeGreaterThan(0);
      expect(object.designerStory.length).toBeGreaterThan(20);
    }
  });

  it("includes authentic designer stories for signature objects", () => {
    const mug = companionObjectCatalogById("obj-shari-signature-mug");
    expect(mug?.designerStory).toMatch(/favorite mug/i);
    expect(mug?.designerStory).toMatch(/every morning/i);

    const journal = companionObjectCatalogById("obj-leather-journal");
    expect(journal?.designerStory).toMatch(/by her chair/i);
    expect(journal?.designerStory).toMatch(/before they disappear/i);

    const crochet = companionObjectCatalogById("obj-crochet-basket");
    expect(crochet?.designerStory).toMatch(/mind needs to settle/i);

    const feeder = companionObjectCatalogById("obj-bird-feeder");
    expect(feeder?.designerStory).toMatch(/hummingbirds, cardinals, and goldfinches/i);

    const aquarium = companionObjectCatalogById("obj-aquarium-ornament");
    expect(aquarium?.designerStory).toMatch(/slow racing thoughts/i);
  });

  it("covers every catalog object with a designer story", () => {
    for (const object of COMPANION_OBJECTS_MASTER_CATALOG) {
      expect(object.designerStory).not.toMatch(/not chosen to decorate a screen/);
    }
  });

  it("includes signature objects from the design brief", () => {
    expect(findCompanionObjectByName("Leather journal")).toBeDefined();
    expect(findCompanionObjectByName("Shari's signature mug")).toBeDefined();
    expect(findCompanionObjectByName("Kinsey's dog bed")).toBeDefined();
    expect(findCompanionObjectByName("Bird feeder")).toBeDefined();
    expect(findCompanionObjectByName("Crochet basket")).toBeDefined();
  });

  it("links feature objects where specified", () => {
    expect(companionObjectCatalogById("obj-leather-journal")?.featureObjectId).toBe(
      "clear-my-mind",
    );
    expect(companionObjectCatalogById("obj-open-planner")?.featureObjectId).toBe(
      "plan-my-day",
    );
  });

  it("uses Warm Homestead Realism illustration style", () => {
    expect(ILLUSTRATION_STYLE_NAME).toBe("Warm Homestead Realism");
  });

  it("summarizes catalog for art production planning", () => {
    const summary = companionObjectCatalogSummary();
    expect(summary.total).toBe(COMPANION_OBJECTS_MASTER_CATALOG.length);
    expect(summary.withAnimation).toBeGreaterThan(10);
    expect(summary.withFeatureLink).toBeGreaterThanOrEqual(5);
    expect(summary.byCollection.writing).toBeGreaterThanOrEqual(30);
  });
});
