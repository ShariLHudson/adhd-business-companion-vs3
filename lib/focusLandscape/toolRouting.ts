import type { FocusFeelingId } from "@/lib/focusHub";
import type { FocusLandscapeSpaceId } from "./types";

/** Every Focus hub tool routes to a landscape space — never a menu */
export const FOCUS_TOOL_TO_SPACE: Record<string, FocusLandscapeSpaceId> = {
  "next-small-step": "garden-path",
  "prioritize-options": "garden-path",
  "break-smaller": "garden-path",
  "mind-slow-breathe": "meadow-lake",
  "stretch-break": "meadow-stretch",
  "calm-moment": "meadow-stretch",
  "sixty-second-reset": "meadow-stretch",
  "calm-audio": "forest-pavilion",
  "focus-audio": "forest-pavilion",
  "mind-slow-places": "forest-pavilion",
  "nature-audio": "forest-pavilion",
  "sleep-audio": "forest-pavilion",
  "brain-break-games": "meadow-object-field",
  "sensory-reset": "deep-forest",
  "walk-reminder": "horizon-trail",
  "momentum-builders": "meadow-stretch",
  "brain-dump": "deep-forest",
  "overwhelm-prioritize": "garden-path",
  "overwhelm-break-down": "garden-path",
  "overwhelm-clear": "deep-forest",
  "chat-guide": "garden-path",
  "quick-recharge": "meadow-lake",
};

export const FOCUS_FEELING_TO_SPACE: Record<FocusFeelingId, FocusLandscapeSpaceId> =
  {
    stuck: "garden-path",
    "need-break": "meadow-lake",
  };

export const FOCUS_HUB_CENTER_SPACE: FocusLandscapeSpaceId = "meadow-lake";

export function spaceForFocusTool(toolId?: string): FocusLandscapeSpaceId | null {
  if (!toolId) return null;
  return FOCUS_TOOL_TO_SPACE[toolId] ?? null;
}

export function spaceForFocusFeeling(
  feelingId?: FocusFeelingId | string,
): FocusLandscapeSpaceId {
  if (feelingId && feelingId in FOCUS_FEELING_TO_SPACE) {
    return FOCUS_FEELING_TO_SPACE[feelingId as FocusFeelingId];
  }
  return FOCUS_HUB_CENTER_SPACE;
}

export function spaceForFocusWorkspace(input: {
  workspaceId?: string;
  focusCategoryId?: string;
  toolId?: string;
}): FocusLandscapeSpaceId {
  if (input.toolId) {
    const fromTool = spaceForFocusTool(input.toolId);
    if (fromTool) return fromTool;
  }
  if (input.workspaceId === "focus-category" && input.focusCategoryId) {
    return spaceForFocusFeeling(input.focusCategoryId);
  }
  return FOCUS_HUB_CENTER_SPACE;
}
