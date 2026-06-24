"use client";

import type { VisualFocusVisualLayout } from "@/lib/visualFocus/types";
import { BUSINESS_CANVAS_SECTION_GUIDANCE } from "@/lib/visualFocus/businessCanvas/guidance";
import {
  BUSINESS_CANVAS_GRID_CELLS,
  BUSINESS_CANVAS_GRID_TEMPLATE,
} from "@/lib/visualFocus/businessCanvas/sectionTheme";
import type { BusinessCanvasSectionId } from "@/lib/visualFocus/businessCanvas/types";

const GRID_CELLS = BUSINESS_CANVAS_GRID_CELLS.map((cell) => ({
  id: cell.id as BusinessCanvasSectionId,
  gridArea: cell.gridArea,
  theme: cell,
}));

function previewFromLabel(label: string): { title: string; body: string } {
  const [title, ...rest] = label.split("\n");
  return { title: title ?? "", body: rest.join(" ") };
}

export function BusinessCanvasVisualGrid({
  layout,
  centerTitle,
}: {
  layout: VisualFocusVisualLayout;
  centerTitle: string;
}) {
  const nodeById = new Map(layout.nodes.map((n) => [n.id, n]));

  return (
    <div
      className="min-h-[420px] rounded-2xl border border-[#e7dfd4] bg-[#faf7f2] p-3"
      data-testid="business-canvas-visual-grid"
    >
      <p className="mb-3 text-center text-sm font-semibold text-[#1e4f4f]">
        {centerTitle}
      </p>
      <div
        className="grid min-h-[360px] gap-2"
        style={{
          gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
          gridTemplateRows: "1fr 1fr 0.8fr",
          gridTemplateAreas: BUSINESS_CANVAS_GRID_TEMPLATE,
        }}
      >
        {GRID_CELLS.map((cell) => {
          const node = nodeById.get(cell.id);
          const guidance = BUSINESS_CANVAS_SECTION_GUIDANCE[cell.id];
          const preview = node ? previewFromLabel(node.label) : null;
          return (
            <div
              key={cell.id}
              className="rounded-xl border-2 bg-white p-2 shadow-sm"
              style={{
                gridArea: cell.gridArea,
                borderColor: cell.theme.color,
                backgroundColor: cell.theme.bg,
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#6b635a]">
                <span aria-hidden="true">{cell.theme.emoji} </span>
                {guidance.title}
              </p>
              <p className="mt-1 text-xs font-semibold leading-snug text-[#1f1c19]">
                {preview?.body || guidance.prompt || "—"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
