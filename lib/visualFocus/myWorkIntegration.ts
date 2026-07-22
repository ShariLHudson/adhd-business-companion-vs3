import { studioCardTitleForMode } from "./studioCards";
import type { VisualFocusMode } from "./types";

export const VISUAL_FOCUS_MY_WORK_CATEGORIES: {
  mode: VisualFocusMode;
  label: string;
}[] = [
  { mode: "mind-map", label: "Mind Maps" },
  { mode: "decision-tree", label: "Decision Maps" },
  { mode: "strategy-map", label: "Strategy Maps" },
  { mode: "relationship-map", label: "Relationship Maps" },
  { mode: "project-map", label: "Project Maps" },
  { mode: "process-map", label: "Process Maps" },
  { mode: "journey-map", label: "Journey Maps" },
  { mode: "timeline-map", label: "Timeline Maps" },
  { mode: "opportunity-map", label: "Opportunity Maps" },
  { mode: "system-map", label: "System Maps" },
  { mode: "priority-map", label: "Priority Maps" },
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
