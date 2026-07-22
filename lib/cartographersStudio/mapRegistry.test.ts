import { describe, expect, it } from "vitest";
import {
  assertMindMapNamingConsistent,
  CARTOGRAPHY_MAP_REGISTRY,
  namingMatrixRow,
  productionWallMaps,
} from "./mapRegistry";
import {
  CARTOGRAPHERS_FRAMED_MAPS,
  wallSelectableFramedMaps,
} from "./framedMaps";

describe("Cartography map registry (Prompt 140)", () => {
  it("registers every framed wall map", () => {
    for (const frame of CARTOGRAPHERS_FRAMED_MAPS) {
      expect(
        CARTOGRAPHY_MAP_REGISTRY.some((e) => e.canonicalId === frame.id),
      ).toBe(true);
    }
  });

  it("Mind Map naming is consistent across wall, gallery, and atlas", () => {
    expect(assertMindMapNamingConsistent()).toBe(true);
    const mind = CARTOGRAPHY_MAP_REGISTRY.find((e) => e.canonicalId === "mind-map");
    expect(mind?.wallLabel).toBe("Mind Map");
    expect(mind?.galleryLabel).toBe("Mind Map");
    expect(mind?.atlasLabel).toBe("Mind Map");
    expect(mind?.productionStatus).toBe("production");
    expect(mind?.wallSelectable).toBe(true);
  });

  it("only Mind Map is a production wall-selectable map", () => {
    expect(productionWallMaps().map((m) => m.canonicalId)).toEqual(["mind-map"]);
    expect(wallSelectableFramedMaps().map((m) => m.id)).toEqual(["mind-map"]);
    for (const frame of CARTOGRAPHERS_FRAMED_MAPS) {
      if (frame.id === "mind-map") {
        expect(frame.wallSelectable).toBe(true);
        expect(frame.interactive).toBe(true);
      } else {
        expect(frame.wallSelectable).toBe(false);
      }
    }
  });

  it("naming matrix rows are complete for report export", () => {
    for (const entry of CARTOGRAPHY_MAP_REGISTRY) {
      const row = namingMatrixRow(entry);
      expect(row.canonicalId).toBeTruthy();
      expect(row.canonicalName).toBeTruthy();
      expect(row.route).toBeTruthy();
      expect(row.status).toBeTruthy();
    }
  });
});
