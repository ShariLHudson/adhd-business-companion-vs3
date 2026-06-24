/**
 * Intelligence ↔ Canvas highlight bridge — future-ready for Living Canvas™,
 * What-If Analysis™, ripple effects, and Board of Directors™.
 */

import type { BusinessCanvasSectionId } from "../businessCanvas/types";

export type IntelligenceHighlightBridge = {
  /** Sections currently emphasized from intelligence interaction. */
  highlightedSections: BusinessCanvasSectionId[];
  /** Source card category — for future analytics. */
  sourceCategory?: string;
};

export function mergeCanvasHighlights(
  changeHighlights: BusinessCanvasSectionId[] | undefined,
  intelligenceHighlights: BusinessCanvasSectionId[] | undefined,
): BusinessCanvasSectionId[] | undefined {
  const merged = new Set<BusinessCanvasSectionId>([
    ...(changeHighlights ?? []),
    ...(intelligenceHighlights ?? []),
  ]);
  return merged.size > 0 ? [...merged] : undefined;
}
