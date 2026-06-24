import type { BusinessCanvasData } from "./types";
import { BUSINESS_CANVAS_SECTION_ORDER } from "./types";

export function createEmptyBusinessCanvas(): BusinessCanvasData {
  const sections = {} as BusinessCanvasData["sections"];
  for (const id of BUSINESS_CANVAS_SECTION_ORDER) {
    sections[id] = { items: [] };
  }
  return {
    canvasType: "business-model",
    sections,
  };
}

export function countBusinessCanvasItems(data: BusinessCanvasData): number {
  return BUSINESS_CANVAS_SECTION_ORDER.reduce(
    (sum, id) => sum + data.sections[id].items.filter((i) => i.trim()).length,
    0,
  );
}

export function filledBusinessCanvasSectionCount(data: BusinessCanvasData): number {
  return BUSINESS_CANVAS_SECTION_ORDER.filter(
    (id) => data.sections[id].items.some((i) => i.trim()),
  ).length;
}
