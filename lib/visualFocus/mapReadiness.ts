import type { VisualFocusMap, VisualFocusNode } from "./types";
import {
  countBusinessCanvasItems,
  filledBusinessCanvasSectionCount,
} from "./businessCanvas/factory";

const PLACEHOLDER_LABELS = new Set([
  "new branch",
  "central idea",
  "first idea",
  "your business",
  "new card",
]);

function collectLabels(root: VisualFocusNode): string[] {
  const out: string[] = [];
  function walk(n: VisualFocusNode) {
    const label = n.label.trim();
    if (label && !PLACEHOLDER_LABELS.has(label.toLowerCase())) {
      out.push(label);
    }
    for (const child of n.children) walk(child);
  }
  walk(root);
  return out;
}

export function canGenerateVisualFocusMap(map: VisualFocusMap): boolean {
  if (map.mode === "business-canvas" && map.businessCanvas) {
    return (
      filledBusinessCanvasSectionCount(map.businessCanvas) >= 3 ||
      countBusinessCanvasItems(map.businessCanvas) >= 4
    );
  }
  if (map.mode === "visual-kanban" && map.kanban) {
    const cards = Object.values(map.kanban.cards).filter(
      (c) => c.label.trim() && !PLACEHOLDER_LABELS.has(c.label.trim().toLowerCase()),
    );
    return cards.length >= 2;
  }
  return collectLabels(map.root).length >= 2;
}

export function meaningfulNodeCount(map: VisualFocusMap): number {
  if (map.mode === "business-canvas" && map.businessCanvas) {
    return countBusinessCanvasItems(map.businessCanvas);
  }
  if (map.mode === "visual-kanban" && map.kanban) {
    return Object.values(map.kanban.cards).filter(
      (c) => c.label.trim() && !PLACEHOLDER_LABELS.has(c.label.trim().toLowerCase()),
    ).length;
  }
  return collectLabels(map.root).length;
}
