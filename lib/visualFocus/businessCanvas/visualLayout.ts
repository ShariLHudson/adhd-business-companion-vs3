import type { VisualFocusVisualLayout, VisualFocusVisualNode } from "../types";
import { BUSINESS_CANVAS_SECTION_COLORS } from "./sectionTheme";
import type { BusinessCanvasData } from "./types";
import { BUSINESS_CANVAS_SECTION_GUIDANCE } from "./guidance";
import { BUSINESS_CANVAS_SECTION_ORDER } from "./types";

/** Classic Business Model Canvas grid positions (percent x/y, center of cell). */
const GRID_POSITIONS: Record<
  string,
  { x: number; y: number; w: number; h: number }
> = {
  "key-partners": { x: 8, y: 18, w: 18, h: 28 },
  "key-activities": { x: 28, y: 18, w: 18, h: 14 },
  "key-resources": { x: 28, y: 36, w: 18, h: 14 },
  "value-proposition": { x: 48, y: 18, w: 18, h: 32 },
  "customer-relationships": { x: 68, y: 18, w: 18, h: 14 },
  channels: { x: 68, y: 36, w: 18, h: 14 },
  "customer-segments": { x: 88, y: 18, w: 18, h: 32 },
  "cost-structure": { x: 28, y: 58, w: 36, h: 22 },
  "revenue-streams": { x: 68, y: 58, w: 36, h: 22 },
};

export function buildBusinessCanvasVisualLayout(
  data: BusinessCanvasData,
  centerLabel: string,
): VisualFocusVisualLayout {
  const nodes: VisualFocusVisualNode[] = [];

  for (const sectionId of BUSINESS_CANVAS_SECTION_ORDER) {
    const pos = GRID_POSITIONS[sectionId];
    if (!pos) continue;
    const guidance = BUSINESS_CANVAS_SECTION_GUIDANCE[sectionId];
    const items = data.sections[sectionId].items.filter((i) => i.trim());
    const preview =
      items.length > 0
        ? items.slice(0, 3).join(" · ")
        : guidance.prompt;
    nodes.push({
      id: sectionId,
      label: `${guidance.title}\n${preview}`,
      x: pos.x + pos.w / 2,
      y: pos.y + pos.h / 2,
      color: BUSINESS_CANVAS_SECTION_COLORS[sectionId],
      level: 0,
    });
  }

  nodes.push({
    id: "canvas-center",
    label: centerLabel,
    x: 50,
    y: 8,
    color: "#1e4f4f",
    level: 0,
  });

  return {
    nodes,
    edges: [],
    layoutKind: "business-canvas-grid",
  };
}
