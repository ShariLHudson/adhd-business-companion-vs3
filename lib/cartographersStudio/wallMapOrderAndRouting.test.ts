import { describe, expect, it } from "vitest";
import {
  cartographyWallMaps,
  CARTOGRAPHY_WALL_HOTSPOTS,
  getWallMapById,
  wallMapsForRow,
  wallMapsInDisplayOrder,
  type CartographyWallMapId,
} from "./wallMaps";
import {
  getCartographyMapDefinition,
  type CartographersFramedMapId,
} from "./mapDefinitions";

/**
 * Spark Estate — Cartography Wall Labels, Map App Connections & Routing.
 * Locks the corrected wall order (Relationship #3 top, Journey #5 top) and
 * proves every wall map connects to a real, non-placeholder builder.
 */

describe("Cartography wall order — corrected Relationship/Journey positions", () => {
  it("top row is exactly Mind, Decision, Relationship, Process, Journey", () => {
    const top = wallMapsForRow("top");
    expect(top.map((m) => m.id)).toEqual([
      "mind-map",
      "decision-map",
      "relationship-map",
      "process-map",
      "journey-map",
    ]);
    expect(top.map((m) => m.name)).toEqual([
      "Mind Map",
      "Decision Map",
      "Relationship Map",
      "Process Map",
      "Journey Map",
    ]);
  });

  it("Relationship Map is position 3 on the top row (not 5)", () => {
    const relationship = getWallMapById("relationship-map");
    expect(relationship?.row).toBe("top");
    expect(relationship?.position).toBe(3);
  });

  it("Journey Map is position 5 on the top row (not 3)", () => {
    const journey = getWallMapById("journey-map");
    expect(journey?.row).toBe("top");
    expect(journey?.position).toBe(5);
  });

  it("bottom row is exactly Timeline, Strategy, Opportunity, System, Priority", () => {
    const bottom = wallMapsForRow("bottom");
    expect(bottom.map((m) => m.id)).toEqual([
      "timeline-map",
      "strategy-map",
      "opportunity-map",
      "system-map",
      "priority-map",
    ]);
  });

  it("declaration order matches display order (no silent re-sort mismatch)", () => {
    const declared = wallMapsInDisplayOrder().map((m) => m.id);
    const sortedTop = wallMapsForRow("top").map((m) => m.id);
    const sortedBottom = wallMapsForRow("bottom").map((m) => m.id);
    expect(declared).toEqual([...sortedTop, ...sortedBottom]);
  });

  it("no two wall maps share a row + position", () => {
    const seen = new Set<string>();
    for (const map of cartographyWallMaps) {
      const key = `${map.row}-${map.position}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it("desktop hotspot left-to-right order matches position order per row", () => {
    for (const row of ["top", "bottom"] as const) {
      const ordered = wallMapsForRow(row);
      const lefts = ordered.map(
        (m) => parseFloat(CARTOGRAPHY_WALL_HOTSPOTS[m.id].left),
      );
      const sorted = [...lefts].sort((a, b) => a - b);
      expect(lefts).toEqual(sorted);
    }
  });

  it("Relationship and Journey hotspots swapped places (visual position matches new order)", () => {
    // Relationship now sits where Journey used to be (3rd slot), and vice versa.
    expect(CARTOGRAPHY_WALL_HOTSPOTS["relationship-map"].left).toBe("42%");
    expect(CARTOGRAPHY_WALL_HOTSPOTS["journey-map"].left).toBe("66%");
  });
});

describe("Every wall map connects to a real, correct, non-placeholder builder", () => {
  const allIds: CartographyWallMapId[] = cartographyWallMaps.map((m) => m.id);

  it("every wall map id resolves to an active map definition", () => {
    for (const id of allIds) {
      const def = getCartographyMapDefinition(id as CartographersFramedMapId);
      expect(def).toBeTruthy();
      expect(def.isActive).toBe(true);
    }
  });

  it("wall registry builderType matches the map definition's identity (no cross-wired routes)", () => {
    for (const wall of cartographyWallMaps) {
      expect(wall.builderType).toBe(wall.id);
      const def = getCartographyMapDefinition(
        wall.id as CartographersFramedMapId,
      );
      expect(def.id).toBe(wall.id);
      expect(def.name).toBe(wall.name);
    }
  });

  it("Relationship Map opens the Relationship Map builder — not Journey Map", () => {
    const def = getCartographyMapDefinition("relationship-map");
    expect(def.id).toBe("relationship-map");
    expect(def.name).toBe("Relationship Map");
    expect(def.visualFocusMode).toBe("relationship-map");
  });

  it("Journey Map opens the Journey Map builder — not Relationship Map", () => {
    const def = getCartographyMapDefinition("journey-map");
    expect(def.id).toBe("journey-map");
    expect(def.name).toBe("Journey Map");
    expect(def.visualFocusMode).toBe("journey-map");
  });

  it("no wall map has an empty route, missing steps, or placeholder builder", () => {
    for (const id of allIds) {
      const def = getCartographyMapDefinition(id as CartographersFramedMapId);
      expect(def.route.trim().length).toBeGreaterThan(0);
      expect(def.supportsPrint).toBe(true);
      if (def.builderType === "guided-steps") {
        expect(def.steps.length).toBeGreaterThan(0);
      } else {
        expect(def.builderType).toBe("mind-map-discovery");
      }
    }
  });

  it("every wall map has a distinct builder identity (no two maps share one builder)", () => {
    const builderTypes = allIds.map(
      (id) => getCartographyMapDefinition(id as CartographersFramedMapId).id,
    );
    expect(new Set(builderTypes).size).toBe(builderTypes.length);
  });
});
