import { describe, expect, it } from "vitest";
import {
  applyCanonicalRootChange,
  mapHasPublishedCanvas,
  refreshCanvasFromOutline,
} from "./canvasSync";
import type { VisualFocusMap, VisualFocusNode } from "./types";

function baseMap(overrides: Partial<VisualFocusMap> = {}): VisualFocusMap {
  const root: VisualFocusNode = {
    id: "root",
    label: "Launch",
    children: [
      { id: "a", label: "Audience", children: [] },
      { id: "b", label: "Offer", children: [] },
    ],
  };
  return {
    id: "map-1",
    title: "Launch",
    mode: "project-map",
    root,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("canvasSync (Prompt 140)", () => {
  it("does not mark unpublished maps as needing canvas refresh", () => {
    expect(mapHasPublishedCanvas(baseMap())).toBe(false);
  });

  it("regenerates layout and analysis when outline changes on a published map", () => {
    const published = baseMap({
      workflowStage: "generated",
      generatedAt: "2026-01-01T00:00:00.000Z",
      visualLayout: {
        nodes: [{ id: "root", label: "Launch", x: 0, y: 0 }],
        edges: [],
        layoutKind: "vertical-flow",
      },
      analysis: {
        summary: "old",
        keyRelationships: [],
        patterns: [],
        risks: [],
        opportunities: [],
        recommendations: [],
        nextSteps: [],
        generatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    const nextRoot: VisualFocusNode = {
      ...published.root,
      children: [
        ...published.root.children,
        { id: "c", label: "Channels", children: [] },
      ],
    };

    const synced = applyCanonicalRootChange(published, nextRoot);
    expect(synced.root.children).toHaveLength(3);
    expect(synced.workflowStage).toBe("generated");
    expect(synced.visualLayout?.nodes.length).toBeGreaterThan(
      published.visualLayout!.nodes.length,
    );
    expect(synced.analysis?.summary).toBeTruthy();
    expect(synced.analysis?.summary).not.toBe("old");
  });

  it("refreshCanvasFromOutline always rebuilds from current root", () => {
    const map = baseMap({
      workflowStage: "generated",
      generatedAt: "2026-01-01T00:00:00.000Z",
      visualLayout: {
        nodes: [{ id: "stale", label: "Stale", x: 0, y: 0 }],
        edges: [],
        layoutKind: "vertical-flow",
      },
    });
    const refreshed = refreshCanvasFromOutline(map);
    expect(refreshed.visualLayout?.nodes.some((n) => n.label === "Audience")).toBe(
      true,
    );
    expect(refreshed.visualLayout?.nodes.some((n) => n.id === "stale")).toBe(
      false,
    );
  });
});
