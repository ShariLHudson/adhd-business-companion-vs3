import { describe, expect, it } from "vitest";
import {
  assertAllWallMapsActiveAndNamed,
  assertMindMapNamingConsistent,
  CARTOGRAPHY_MAP_REGISTRY,
  canonicalMapName,
  namingMatrixRow,
  productionWallMaps,
  visualFocusModeForWallMap,
} from "./mapRegistry";
import {
  CARTOGRAPHY_MAP_DEFINITIONS,
} from "./mapDefinitions";
import {
  CARTOGRAPHERS_FRAMED_MAPS,
  wallSelectableFramedMaps,
} from "./framedMaps";
import {
  assertWallMapRegistryComplete,
  cartographyWallMaps,
  wallMapsForRow,
} from "./wallMaps";
import { buildDraftFromGuidedAnswers } from "@/lib/visualFocus/guidedBuilder";
import { buildVisualLayout } from "@/lib/visualFocus/visualLayout";
import { buildVisualFocusPrintHtml } from "@/lib/visualFocus/printMap";
import type { VisualFocusMap } from "@/lib/visualFocus/types";

describe("Cartography map registry (room completion)", () => {
  it("registers every framed wall map", () => {
    for (const frame of CARTOGRAPHERS_FRAMED_MAPS) {
      expect(
        CARTOGRAPHY_MAP_REGISTRY.some((e) => e.canonicalId === frame.id),
      ).toBe(true);
    }
  });

  it("canonical wall registry has exact order and names", () => {
    expect(assertWallMapRegistryComplete()).toBe(true);
    expect(wallMapsForRow("top").map((m) => m.name)).toEqual([
      "Mind Map",
      "Decision Map",
      "Relationship Map",
      "Process Map",
      "Journey Map",
    ]);
    expect(wallMapsForRow("bottom").map((m) => m.name)).toEqual([
      "Timeline Map",
      "Strategy Map",
      "Opportunity Map",
      "System Map",
      "Priority Map",
    ]);
    for (const wall of cartographyWallMaps) {
      expect(canonicalMapName(wall.id)).toBe(wall.name);
      expect(wall.builderType).toBe(wall.id);
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

  it("every wall map is active, labeled, and selectable", () => {
    expect(assertAllWallMapsActiveAndNamed()).toBe(true);
    expect(productionWallMaps()).toHaveLength(10);
    expect(wallSelectableFramedMaps()).toHaveLength(10);
    for (const frame of CARTOGRAPHERS_FRAMED_MAPS) {
      expect(frame.wallSelectable).toBe(true);
      expect(frame.interactive).toBe(true);
      expect(frame.nameplate).toBe(canonicalMapName(frame.id));
      expect(frame.visualFocusMode).toBe(visualFocusModeForWallMap(frame.id));
    }
    expect(CARTOGRAPHERS_FRAMED_MAPS.map((m) => m.id)).toContain("system-map");
    expect(CARTOGRAPHERS_FRAMED_MAPS.map((m) => m.id)).not.toContain("project-map");
  });

  it("Decision Map name is canonical (not Decision Tree)", () => {
    expect(canonicalMapName("decision-map")).toBe("Decision Map");
    expect(canonicalMapName("decision-tree")).toBe("Decision Map");
    const entry = CARTOGRAPHY_MAP_REGISTRY.find(
      (e) => e.canonicalId === "decision-map",
    );
    expect(entry?.wallLabel).toBe("Decision Map");
    expect(entry?.galleryLabel).toBe("Decision Map");
  });

  it("Timeline Map and System Map use exact canonical names", () => {
    expect(canonicalMapName("timeline-map")).toBe("Timeline Map");
    expect(canonicalMapName("system-map")).toBe("System Map");
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

  it("every active wall map has guided steps and print support", () => {
    for (const def of CARTOGRAPHY_MAP_DEFINITIONS) {
      expect(def.isActive).toBe(true);
      expect(def.supportsPrint).toBe(true);
      expect(def.steps.length).toBeGreaterThan(0);
      expect(def.name).toBe(canonicalMapName(def.id));
    }
  });

  it("guided drafts produce visual layouts for every wall map mode", () => {
    for (const def of CARTOGRAPHY_MAP_DEFINITIONS) {
      if (def.builderType === "mind-map-discovery") continue;
      const answers: Record<string, string> = {};
      for (const step of def.steps) {
        answers[step.fieldKey] =
          step.inputKind === "list"
            ? "Alpha, Beta, Gamma"
            : `Sample ${step.fieldKey}`;
      }
      const draft = buildDraftFromGuidedAnswers(def, answers);
      expect(draft.title.trim().length).toBeGreaterThan(0);
      expect(draft.root.children.length).toBeGreaterThan(0);
      const map: VisualFocusMap = {
        id: `test-${def.id}`,
        title: draft.title,
        mode: def.visualFocusMode,
        root: draft.root,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        workflowStage: "generated",
      };
      const layout = buildVisualLayout(map);
      expect(layout.nodes.length).toBeGreaterThan(1);
      expect(layout.edges.length).toBeGreaterThan(0);
      const html = buildVisualFocusPrintHtml({
        ...map,
        visualLayout: layout,
        summary: draft.summaryHint,
      });
      expect(html).toContain(def.name);
      expect(html).toContain(draft.title);
    }
  });
});
