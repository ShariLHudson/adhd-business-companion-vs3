import { studioCardTitleForMode } from "./studioCards";
import type { VisualFocusMode } from "./types";

export const VISUAL_FOCUS_MY_WORK_CATEGORIES: {
  mode: VisualFocusMode;
  label: string;
}[] = [
  { mode: "mind-map", label: "Mind Maps" },
  { mode: "decision-tree", label: "Decision Trees" },
  { mode: "strategy-map", label: "Strategy Maps" },
  { mode: "relationship-map", label: "Relationship Maps" },
  { mode: "project-map", label: "Project Maps" },
  { mode: "visual-kanban", label: "Visual Kanbans" },
  { mode: "business-canvas", label: "Business Canvases" },
];

export function myWorkCategoryLabelForMode(mode: VisualFocusMode): string {
  return (
    VISUAL_FOCUS_MY_WORK_CATEGORIES.find((c) => c.mode === mode)?.label ??
    studioCardTitleForMode(mode)
  );
}

export function visualFocusContinuityLocation(mode: VisualFocusMode): string {
  return `Other → Saved → Visual Thinking → ${myWorkCategoryLabelForMode(mode)}`;
}
