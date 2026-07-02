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
  /** Custom business plan being built (e.g. Marketing Strategy). */
  businessStrategyLabel?: string | null;
  businessStrategyPhase?: "building" | "coaching" | null;
};

const SECTION_LABELS: Partial<Record<AppSection, string>> = {
  projects: "Build With Shari",
  "content-generator": "Build With Shari",
  focus: "Focus With Shari",
  "focus-timer": "Focus With Shari",
  "focus-audio": "Focus With Shari",
  playbook: "Apply With Shari",
  "client-avatars": "Define With Shari",
  "brain-dump": "Sort It Out With Shari",
  "templates-library": "Build With Shari",
  snippets: "Use With Shari",
  "how-do-i": "Learn With Shari",
  "momentum-institute": "Explore With Shari",
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
      return "Build With Shari";
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

  if (section === "playbook" && ctx?.businessStrategyLabel) {
    const short = ctx.businessStrategyLabel.replace(/\s+strategy$/i, "").trim();
    if (ctx.businessStrategyPhase === "coaching") {
      return `Plan ${short} With Shari`;
    }
    return `Build ${short} With Shari`;
  }

  if (section === "playbook" && ctx?.createItemType) {
    return `Build ${ctx.createItemType} With Shari`;
  }

  return SECTION_LABELS[section] ?? "Work With Shari";
}
