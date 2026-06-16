/**
 * Context-aware Shari assist button labels — each workspace explains what Shari
 * will help the user do before they click.
 */

import type { ActivityCategoryId } from "./companionActivities";
import type { AppSection } from "./companionUi";

export type ShariAssistContext = {
  activityCategoryId?: ActivityCategoryId | null;
  selectedItemName?: string | null;
  createItemType?: string | null;
};

const SECTION_LABELS: Partial<Record<AppSection, string>> = {
  projects: "Build With Shari",
  "content-generator": "Create With Shari",
  focus: "Focus With Shari",
  "focus-timer": "Focus With Shari",
  "focus-audio": "Focus With Shari",
  playbook: "Apply With Shari",
  "client-avatars": "Define With Shari",
  "brain-dump": "Sort It Out With Shari",
  "templates-library": "Customize With Shari",
  "how-do-i": "Learn With Shari",
  "spin-wheel": "Decide With Shari",
  "time-block": "Focus With Shari",
};

function activityCategoryLabel(categoryId: ActivityCategoryId): string {
  switch (categoryId) {
    case "decide":
      return "Decide With Shari";
    case "focus":
      return "Focus With Shari";
    case "calm":
    case "overwhelm":
    case "slow-down":
      return "Sort It Out With Shari";
    case "energize":
      return "Focus With Shari";
    case "creativity":
      return "Create With Shari";
    default:
      return "Focus With Shari";
  }
}

/** Button label for the current workspace — never a generic "Work With Shari" when context is known. */
export function getShariAssistLabel(
  section: AppSection | null | undefined,
  ctx?: ShariAssistContext,
): string {
  if (!section) return "Work With Shari";

  if (section === "activities" && ctx?.activityCategoryId) {
    return activityCategoryLabel(ctx.activityCategoryId);
  }

  return SECTION_LABELS[section] ?? "Work With Shari";
}
